import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { UserRole } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/user-role.enum';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { BlockchainService } from './blockchain.service';
@Resolver()
export class BlockchainResolver {
  private readonly logger = new Logger(BlockchainResolver.name);
  constructor(private blockChainService: BlockchainService) {}

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
      await this.blockChainService.setPoolWallet(address, privateKey);
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    description: 'set project contract',
  })
  async setProjectContract(
    @CurrentUser() user: AppAuthUser,
    @Args('address') address: string,
    @Args('abi', { nullable: true }) abi?: string,
  ) {
    if (user.role !== UserRole.ADMIN)
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Admin only!',
      });
    try {
      await this.blockChainService.setProjectContract(address, abi);
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
