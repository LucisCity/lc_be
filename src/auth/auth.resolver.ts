import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthGql, LoginInput, RegisterInput } from './auth.type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => String, {
    description: 'Auth resolver',
  })
  async temp(): Promise<any> {
    return 'Ok';
  }

  @Mutation(() => AuthGql, {
    description: 'Login',
  })
  async login(@Args() input: LoginInput) {
    const result = await this.authService.login(input.email, input.password);
    return result;
  }

  @Mutation(() => String, {
    description: 'Register',
  })
  async register(@Args() input: RegisterInput) {
    const result = await this.authService.register(input);
    return result;
  }
}
