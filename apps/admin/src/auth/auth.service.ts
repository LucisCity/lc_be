import { AppError } from '@libs/helper/errors/base.error';
import { PasswordUtils } from '@libs/helper/password.util';
import { randString } from '@libs/helper/string.helper';
import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
      this.logger.debug('login: password not match');
      throw new AppError('Bad request');
    }
    const jwtToken = this.jwt.sign({
      id: user.id,
      role: user.role,
    });
    const { password, ...result } = user;

    return {
      token: jwtToken,
      user: result,
    };
  }

  async register(email: string, pass: string) {
    // const isStrong = PasswordUtils.validate(pass);
    const hashPass = await PasswordUtils.hashPassword(pass);
    const user = await this.prisma.user.create({
      data: {
        role: 'ADMIN',
        email,
        ref_code: randString(10),
        password: hashPass,
        profile: {
          create: {
            given_name: email.split('@')[0],
          },
        },
      },
    });
    const { password, ...result } = user;
    return result;
  }
}
