import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { UserRole } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/user-role.enum';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { TransactionLog } from '@libs/prisma/@generated/prisma-nestjs-graphql/transaction-log/transaction-log.model';
@Resolver()
export class BlockchainResolver {
  private readonly logger = new Logger(BlockchainResolver.name);
  constructor(private transactionService: TransactionService) {}

  @Mutation(() => Boolean, {
    description: 'Send tx transaction',
  })
  async sendTransaction(@Args('txHash') txHash: string, @Args('abi', { nullable: true }) abi?: string) {
    try {
      await this.transactionService.addTransaction(txHash, abi);
      return true;
    } catch (e) {
      return false;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    description: 'set pool wallet',
  })
  async setPoolWallet(
    @CurrentUser() user: AppAuthUser,
    @Args('address') address: string,
    @Args('privateKey') privateKey: string,
  ) {
    if (user.role !== UserRole.ADMIN)
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Admin only!',
      });
    try {
      await this.transactionService.setPoolWallet(address, privateKey);
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TransactionLog, {
    description: 'withdraw balance',
  })
  async withdrawBalance(
    @CurrentUser() user: AppAuthUser,
    @Args('address') address: string,
    @Args('amount') amount: string,
    @Args('signatureOTP') signatureOTP: string,
  ) {
    return await this.transactionService.withdrawBalance(user.id, address, amount, signatureOTP);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => String, {
    description: 'get OTP',
  })
  async getOneTimePassword(@CurrentUser() user: AppAuthUser, @Args('address') address: string) {
    return this.transactionService.getOneTimePassword(address);
  }
}
