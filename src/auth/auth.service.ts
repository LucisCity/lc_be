import { AppError } from '@libs/helper/errors/base.error';
import { PasswordUtils } from '@libs/helper/password.util';
import { randString } from '@libs/helper/string.helper';
import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterInput } from './auth.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user || !user.password) {
      this.logger.debug('login: user not found');
      throw new AppError('Bad request');
    }
    const isValid = await PasswordUtils.comparePassword(pass, user.password);
    if (!isValid) {
      throw new AppError('Bad request', 'BAD_REQUEST');
    }
    const jwtToken = this.jwt.sign({
      id: user.id,
      role: user.role,
    });

    return {
      token: jwtToken,
      user,
    };
  }

  async register(input: RegisterInput) {
    // const isStrong = PasswordUtils.validate(pass);
    const hashPass = await PasswordUtils.hashPassword(input.password);
    const user = await this.prisma.user.create({
      data: {
        role: 'USER',
        email: input.email,
        ref_code: randString(10),
        invite_by: input.ref_code,
        password: hashPass,
        profile: {
          create: {
            given_name: input.email.split('@')[0],
          },
        },
      },
    });
    return user;
  }
}
