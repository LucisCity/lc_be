import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
  // constructor(private service: Service) {}

  @Query(() => String, {
    description: 'Admin',
  })
  async user(@Args('userId') userId: number): Promise<any> {
    return 'Success';
  }
}
