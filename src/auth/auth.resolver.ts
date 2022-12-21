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
    @Args('refCode', { type: () => String, nullable: true }) refCode?: string,
    // @Args('invite_code', { type: () => String, nullable: true }) invite_code: string,
  ): Promise<any> {
    const result = await this.authService.loginGoogle(token, refCode);
    return result;
  }

  @Mutation(() => AuthGql, {
    description: 'Facebook login',
  })
  async loginFacebook(
    @Args('accessToken') accessToken: string,
    @Args('refCode', { type: () => String, nullable: true }) refCode?: string,
    // @Args('invite_code', { type: () => String, nullable: true }) invite_code: string,
  ): Promise<any> {
    const result = await this.authService.loginFacebook(accessToken, refCode);
    return result;
  }

  @Mutation(() => String, {
    description: 'Verify email',
  })
  async verifyEmail(@Args('token') token: string) {
    await this.authService.verifyEmail(token);
    return 'Success';
  }

  @Mutation(() => Boolean, {
    description: 'Forgot password',
  })
  async forgotPassword(@Args('email') email: string): Promise<boolean> {
    const result = await this.authService.forgotPassword(email);
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Forgot password',
  })
  async resetPassword(
    @Args('token') token: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    await this.authService.resetPassword(token, password);
    return true;
  }
}
