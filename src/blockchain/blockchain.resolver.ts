import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import {
  AppAuthUser,
  CurrentUser,
} from '@libs/helper/decorator/current_user.decorator';
import { UserRole } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/user-role.enum';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';

@Resolver()
export class BlockchainResolver {
  constructor(private transactionService: TransactionService) {}

  @Mutation(() => Boolean, {
    description: 'Send tx transaction',
  })
  async sendTransaction(
    @Args('txHash') txHash: string,
    @Args('abi', { nullable: true }) abi?: string,
  ) {
    try {
      await this.transactionService.sendTransaction(txHash, abi);
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
      return false;
    }
  }
}
