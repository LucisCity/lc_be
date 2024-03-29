import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { AppError } from '@libs/helper/errors/base.error';
import {
  AccountInfo,
  AccountInfoUpdateInput,
  DashboardData,
  ReferralDataResponse,
  TransactionHistoryResponse,
} from './user.dto/user.dto';
import { Wallet } from '@libs/prisma/@generated/prisma-nestjs-graphql/wallet/wallet.model';
import { NotificationGql } from '@libs/subscription/subscription.dto';

import { TransactionLog } from '@libs/prisma/@generated/prisma-nestjs-graphql/transaction-log/transaction-log.model';
import { ProfileGql } from '../auth/auth.type';
import { UserKycVerification } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-kyc-verification/user-kyc-verification.model';
import { VipCard } from '@libs/prisma/@generated/prisma-nestjs-graphql/vip-card/vip-card.model';
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';
import { ErrorCode } from '@libs/helper/error-code/error-code.dto';
@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [ReferralDataResponse], {
    description: 'Get list referral user',
  })
  async getListReferralUser(@CurrentUser() user: AppAuthUser): Promise<ReferralDataResponse[]> {
    return await this.userService.getReferralUser(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Wallet, {
    description: 'get balance',
    nullable: true,
  })
  async getBalance(@CurrentUser() user: AppAuthUser): Promise<Wallet> {
    return await this.userService.getBalance(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => AccountInfo, { nullable: true, description: 'get account info' })
  async getAccountInfo(@CurrentUser() user: AppAuthUser): Promise<AccountInfo> {
    if (!user.id) {
      throw new AppError('Bad request', ErrorCode.BAD_REQUEST);
    }
    return this.userService.getAccountInfo(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ProfileGql, {
    nullable: true,
    description: 'update account info',
  })
  async updateAccountInfo(
    @CurrentUser() user: AppAuthUser,
    @Args('input') input: AccountInfoUpdateInput,
  ): Promise<ProfileGql> {
    return await this.userService.updateAccountInfo(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean, { nullable: true, description: 'check if user has password' })
  async hasPassWord(@CurrentUser() user: AppAuthUser): Promise<boolean> {
    return await this.userService.hasPassWord(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'change password' })
  async changePassword(
    @CurrentUser() user: AppAuthUser,
    @Args('newPass') newPass: string,
    @Args('oldPass', { nullable: true }) oldPass?: string,
  ): Promise<boolean> {
    await this.userService.changePassword(user.id, newPass, oldPass);
    return true;
  }
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Wallet, { nullable: true, description: 'claim referral' })
  async claimReferral(@CurrentUser() user: AppAuthUser, @Args('inviteeId') inviteeId: string): Promise<Wallet> {
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
  @Query(() => TransactionHistoryResponse, { nullable: true, description: 'get list transaction history' })
  async getTransactionHistory(
    @CurrentUser() user: AppAuthUser,
    @Args('skip', { nullable: true, type: () => Int }) skip: number,
    @Args('take', { nullable: true, type: () => Int }) take: number,
  ): Promise<TransactionHistoryResponse> {
    return this.userService.getTransactionHistory(user.id, skip, take);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Int, { nullable: true, description: 'get unseen notis count' })
  async countUnseenNotifications(@CurrentUser() user: AppAuthUser): Promise<number> {
    return this.userService.countUnseenNotifications(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true })
  async seenNotification(
    @CurrentUser() user: AppAuthUser,
    @Args('id', { type: () => Int }) notiId: number,
  ): Promise<boolean> {
    return await this.userService.seenNotification(user.id, notiId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'mark all notis as read' })
  async markAllNotisSeen(@CurrentUser() user: AppAuthUser): Promise<boolean> {
    return this.userService.markAllNotisSeen(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserKycVerification, { nullable: true, description: 'get kyc verification images' })
  async getKycImages(@CurrentUser() user: AppAuthUser): Promise<UserKycVerification> {
    return this.userService.getKycImages(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean, { nullable: true, description: 'check if user has vip card' })
  async hasVipCard(@CurrentUser() user: AppAuthUser): Promise<boolean> {
    return this.userService.hasVipCard(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => VipCard, { nullable: true, description: 'get vip card info' })
  async getVipCard(@CurrentUser() user: AppAuthUser): Promise<VipCard> {
    return this.userService.getVipCard(user.id);
  }

  @Query(() => VipCard, { nullable: true, description: 'get vip card info' })
  async getVipCardFromId(@Args('id') id: string): Promise<VipCard> {
    return this.userService.getVipCard(null, id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => String, { nullable: true, description: 'get wallet address' })
  async getWalletAddress(@CurrentUser() user: AppAuthUser): Promise<string> {
    return this.userService.getWalletAddress(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String, { nullable: true, description: 'upadate wallet address' })
  async updateWalletAddress(
    @CurrentUser() user: AppAuthUser,
    @Args('walletAddress') walletAddress: string,
  ): Promise<string> {
    return await this.userService.updateWalletAddress(user.id, walletAddress);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { nullable: true, description: 'get vip user' })
  async getVipUsers(@CurrentUser() user: AppAuthUser): Promise<User[]> {
    return await this.userService.getVipUser(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => String, { nullable: true, description: 'get profit vip user' })
  async getProfitForVipMember(@CurrentUser() user: AppAuthUser): Promise<string> {
    const res = await this.userService.getProfitVipUser(user.id);
    return res.profit.toString();
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'claim profit vip user' })
  async claimProfitForVipUser(@CurrentUser() user: AppAuthUser): Promise<boolean> {
    await this.userService.claimProfitForVipUser(user.id);
    return true;
  }

  @Mutation(() => Boolean, { nullable: true, description: 'claim profit vip user' })
  async contactUs(
    @Args('phone', { type: () => String }) phone: string,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
    @Args('name', { type: () => String, nullable: true }) name?: string,
    @Args('email', { type: () => String, nullable: true }) email?: string,
    @Args('question', { type: () => String, nullable: true }) question?: string,
  ): Promise<boolean> {
    await this.userService.contactUs(name, phone, email, question, userId);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => DashboardData, { nullable: true, description: 'claim profit vip user' })
  async getDashboard(@CurrentUser() user: AppAuthUser): Promise<DashboardData> {
    return await this.userService.getDashboard(user.id);
  }
}
