import { AppError } from '@libs/helper/errors/base.error';
import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data: {
        ...user,
        profile: user.profile ?? {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async getReferralUser(userId: string) {
    try {
      return await this.prisma.user.findMany({
        where: { invited_by: userId },
        include: {
          referral_log: true,
          profile: true,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  //   async updateProfile(
  //     userId: number,
  //     data: Prisma.UserProfileUpdateInput,
  //   ): Promise<UpdateProfileResponse> {
  //     const password = data.password;
  //     delete data.password;
  //     const userProfile = await this.prisma.userProfile.update({
  //       where: {
  //         user_id: userId,
  //       },
  //       data: data,
  //       include: {
  //         user: true,
  //       },
  //     });
  //     let passwordSaved = false;
  //     if (password && password.set) {
  //       // check exist password
  //       if (userProfile.user.password) {
  //         throw new AppError('Password existed', 'PASSWORD_EXIST');
  //       }
  //       // check strong pass
  //       if (PasswordUtils.validate(password.set) !== true) {
  //         throw new AppError(
  //           'New password invalid, password must length from 8-32, contain letter and digit ',
  //           'NEW_PASS_INVALID',
  //         );
  //       }
  //       const hashPass = await PasswordUtils.hashPassword(password.set);
  //       await this.prisma.user.update({
  //         where: {
  //           id: userId,
  //         },
  //         data: {
  //           password: hashPass,
  //         },
  //       });
  //       passwordSaved = true;
  //     }
  //     return { updated_profile: userProfile, password_saved: passwordSaved };
  //   }

  //   async changePassword(
  //     userId: number,
  //     oldPass: string,
  //     newPass: string,
  //   ): Promise<boolean> {
  //     const user = await this.prisma.user.findUnique({
  //       where: {
  //         id: userId,
  //       },
  //     });
  //     if (!user) {
  //       throw new AppError('Bad request', 'BAD_REQUEST');
  //     }
  //     if (oldPass === newPass) {
  //       throw new AppError(
  //         'New password must not same old password',
  //         'NEW_PASS_SAME_OLD_PASS',
  //       );
  //     }
  //     // check old password valid
  //     if (!(await PasswordUtils.comparePassword(oldPass, user.password))) {
  //       throw new AppError('Old password invalid', 'OLD_PASS_INVALID');
  //     }
  //     // check strong pass
  //     if (PasswordUtils.validate(newPass) !== true) {
  //       throw new AppError(
  //         'New password invalid, password must length from 8-32, contain letter and digit ',
  //         'NEW_PASS_INVALID',
  //       );
  //     }
  //     // update password
  //     const newHashPass = await PasswordUtils.hashPassword(newPass);
  //     await this.prisma.user.update({
  //       where: {
  //         id: userId,
  //       },
  //       data: {
  //         password: newHashPass,
  //       },
  //     });
  //     return true;
  //   }
}
