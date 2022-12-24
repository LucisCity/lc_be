import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  AppAuthUser,
  CurrentUser,
} from '@libs/helper/decorator/current_user.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { AppError } from '@libs/helper/errors/base.error';
import {
  AccountInfo,
  AccountInfoUpdateInput,
  ReferralDataResponse,
} from './user.dto/user.dto';
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';
import { Wallet } from '@libs/prisma/@generated/prisma-nestjs-graphql/wallet/wallet.model';
import { NotificationGql } from '@libs/notification/notification.dto';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [ReferralDataResponse], {
    description: 'Get list referral user',
  })
  async getListReferralUser(
    @CurrentUser() user: AppAuthUser,
  ): Promise<ReferralDataResponse[]> {
    return await this.userService.getReferralUser(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Wallet, {
    description: 'get balance',
  })
  async getBalance(@CurrentUser() user: AppAuthUser): Promise<Wallet> {
    return await this.userService.getBalance(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => AccountInfo, { nullable: true, description: 'get account info' })
  async getAccountInfo(@CurrentUser() user: AppAuthUser): Promise<AccountInfo> {
    if (!user.id) {
      throw new AppError('Bad request');
    }
    return this.userService.getAccountInfo(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'update account info',
  })
  async updateAccountInfo(
    @CurrentUser() user: AppAuthUser,
    @Args('input') input: AccountInfoUpdateInput,
  ): Promise<boolean> {
    await this.userService.updateAccountInfo(user.id, input);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'change password' })
  async changePassword(
    @CurrentUser() user: AppAuthUser,
    @Args('oldPass') oldPass: string,
    @Args('newPass') newPass: string,
  ): Promise<boolean> {
    await this.userService.changePassword(user.id, oldPass, newPass);
    return true;
  }
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Wallet, { nullable: true, description: 'claim referral' })
  async claimReferral(
    @CurrentUser() user: AppAuthUser,
    @Args('inviteeId') inviteeId: string,
  ): Promise<Wallet> {
    return await this.userService.claimReferral(inviteeId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [NotificationGql], { nullable: true, description: 'get all notis' })
  async getNotifications(
    @CurrentUser() user: AppAuthUser,
    @Args('page', { nullable: true, type: () => Int }) page: number,
    @Args('limit', { nullable: true, type: () => Int }) limit: number,
  ): Promise<NotificationGql[]> {
    return this.userService.getNotifications(user.id, page, limit);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'mark all notis as read' })
  async markAllNotisRead(@CurrentUser() user: AppAuthUser): Promise<boolean> {
    return this.userService.markAllNotisRead(user.id);
  }
}
