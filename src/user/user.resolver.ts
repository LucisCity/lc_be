import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { AppAuthUser, CurrentUser } from "@libs/helper/decorator/current_user.decorator";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@libs/helper/guards/auth.guard";
import { AppError } from "@libs/helper/errors/base.error";
import { AccountInfo, AccountInfoUpdateInput } from "./user.dto/user.dto";
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], {
    description: 'Get list referral user',
  })
  async getListReferralUser(
    @CurrentUser() user: AppAuthUser,
  ): Promise<User[]> {
    return await this.userService.getReferralUser(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => AccountInfo, {nullable: true, description: "get account info"})
  async getAccountInfo(@CurrentUser() user: AppAuthUser): Promise<AccountInfo> {
    if (!user.id) {
      throw new AppError('Bad request');
    }
    return this.userService.getAccountInfo(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {nullable: true, description: "update account info"})
  async updateAccountInfo(
    @CurrentUser() user: AppAuthUser,
    @Args('input') input: AccountInfoUpdateInput,
  ): Promise<boolean> {
    await this.userService.updateAccountInfo(user.id, input);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {nullable: true, description: "update account info"})
  async changePassword(
    @CurrentUser() user: AppAuthUser,
    @Args('oldPass') oldPass: string,
    @Args('newPass') newPass: string,
  ): Promise<boolean> {
    await this.userService.changePassword(user.id, oldPass, newPass);
    return true;
  }
}
