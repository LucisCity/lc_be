import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserKycVerification } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-kyc-verification/user-kyc-verification.model';
import { KycStatus } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/kyc-status.enum';
import { UseGuards } from '@nestjs/common';
import { AclAction, CanAclGuard, UseAcls } from '@libs/helper/acl';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { VipCardTier } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/vip-card-tier.enum';
import { VipCard } from '@libs/prisma/@generated/prisma-nestjs-graphql/vip-card/vip-card.model';
import { VipCardCreateInputGql, VipCardUpdateInputGql } from './user.dto';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Read], subject: 'Kyc' })
  @UseGuards(GqlAuthGuard)
  @Query(() => [UserKycVerification], { nullable: true, description: 'list pending kycs' })
  async getPendingKycs(): Promise<UserKycVerification[]> {
    return await this.userService.getPendingKycs();
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Read], subject: 'Kyc' })
  @UseGuards(GqlAuthGuard)
  @Query(() => [UserKycVerification], { nullable: true, description: 'list kycs with options' })
  async getKycs(
    @Args('userId', { nullable: true }) userId: string,
    @Args('id', { nullable: true, type: () => Int }) id: number,
    @Args('status', { nullable: true, type: () => KycStatus }) status: KycStatus,
  ): Promise<UserKycVerification[]> {
    return await this.userService.getKycs(id, userId, status);
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Update], subject: 'Kyc' })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => String, { nullable: true, description: 'update kycs' })
  async updatePendingKyc(
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @Args('status', { type: () => KycStatus }) status: KycStatus,
  ): Promise<string> {
    return await this.userService.updatePendingKyc(userIds, status);
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Update], subject: 'Kyc' })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'revert kyc to pending status' })
  async revertKycToPending(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return await this.userService.revertKycToPending(id);
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Read], subject: 'vip card' })
  @UseGuards(GqlAuthGuard)
  @Query(() => [VipCard], { nullable: true, description: 'list vip cards with options' })
  async getVipCards(
    @Args('userId', { nullable: true }) userId: string,
    @Args('id', { nullable: true }) id: string,
    @Args('number', { nullable: true }) number: string,
    @Args('tier', { nullable: true, type: () => VipCardTier }) tier: VipCardTier,
  ): Promise<VipCard[]> {
    return await this.userService.getVipCards(id, userId, number, tier);
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Create], subject: 'vip card' })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => VipCard, { nullable: true, description: 'create vip card' })
  async createVipCard(@Args('input', { nullable: true }) input: VipCardCreateInputGql): Promise<VipCard> {
    return await this.userService.createVipCard(input);
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Update], subject: 'vip card' })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'update vip card' })
  async updateVipCard(
    @Args('number', { nullable: true }) number: string,
    @Args('input', { nullable: true }) input: VipCardUpdateInputGql,
  ): Promise<boolean> {
    return await this.userService.updateVipCard(number, input);
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Update], subject: 'vip card' })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true, description: 'delete vip card' })
  async deleteVipCard(@Args('number', { nullable: true }) number: string): Promise<boolean> {
    return await this.userService.deleteVipCard(number);
  }
}
