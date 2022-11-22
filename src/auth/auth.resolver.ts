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
    await this.authService.register(input);
    return 'Success';
  }

  @Mutation(() => AuthGql, {
    description: 'Google login',
  })
  async loginGoogle(
    @Args('token') token: string,
    // @Args('invite_code', { type: () => String, nullable: true }) invite_code: string,
  ): Promise<any> {
    const result = await this.authService.loginGoogle(token);
    return result;
  }

  @Mutation(() => AuthGql, {
    description: 'Facebook login',
  })
  async loginFacebook(
    @Args('accessToken') accessToken: string,
    // @Args('invite_code', { type: () => String, nullable: true }) invite_code: string,
  ): Promise<any> {
    const result = await this.authService.loginFacebook(accessToken);
    return result;
  }
}
