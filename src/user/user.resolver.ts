import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User], {
    description: 'Get list referral user',
  })
  async getListReferralUser(@Args('userId') userId: string): Promise<User[]> {
    return await this.userService.getReferralUser(userId);
  }
}
