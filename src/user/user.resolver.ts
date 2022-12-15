import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private authService: UserService) {}

  @Query(() => String, {
    description: 'Auth resolver',
  })
  async temp(): Promise<any> {
    return 'Ok';
  }
}
