import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserKycVerification } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-kyc-verification/user-kyc-verification.model';
import { KycStatus } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/kyc-status.enum';
import { UseGuards } from '@nestjs/common';
import { AclAction, CanAclGuard, UseAcls } from '@libs/helper/acl';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';

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
  @Mutation(() => Boolean, { nullable: true, description: 'update kycs' })
  async updateKyc(
    @Args('userId', { nullable: true }) userId: string,
    @Args('status', { nullable: true, type: () => KycStatus }) status: KycStatus,
  ): Promise<boolean> {
    return await this.userService.updateKyc(userId, status);
  }
}
