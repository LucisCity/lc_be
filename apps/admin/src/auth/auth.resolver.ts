import { AppError } from '@libs/helper/errors/base.error';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthGql, LoginInput, RegisterInput } from './auth.type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthGql, {
    description: 'Admin login',
  })
  async login(@Args() input: LoginInput): Promise<any> {
    const result = await this.authService.login(input.email, input.password);
    return result;
  }

  @Mutation(() => Boolean, {
    description: 'Admin register',
  })
  async register(@Args() input: RegisterInput): Promise<any> {
    if ((process.env.ADMIN_REGISTER_ENABLE ?? 'false').toLowerCase() == 'false') {
      throw new AppError('REGISTER DISABLE');
    }
    await this.authService.register(input.email, input.password);
    return true;
  }
}
