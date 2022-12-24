import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountInfo, AccountInfoUpdateInput } from './user.dto/user.dto';
import { AppError } from '@libs/helper/errors/base.error';
import { PasswordUtils } from '@libs/helper/password.util';
import { ChangePassInput, EventType, VerifyInput } from '@libs/helper/email';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationGql } from '@libs/notification/notification.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService, private eventEmitter: EventEmitter2) {}

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

  async changePassword(userId: string, oldPass: string, newPass: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });
    if (!user) {
      throw new AppError('Bad request', 'BAD_REQUEST');
    }
    if (oldPass === newPass) {
      throw new AppError('New password must be different from old password', 'NEW_PASS_SAME_OLD_PASS');
    }
    // check old password
    if (!(await PasswordUtils.comparePassword(oldPass, user.password))) {
      throw new AppError('Wrong old password, please try again', 'WRONG_OLD_PASS');
    }
    // check strong pass
    if (PasswordUtils.validate(newPass) !== true) {
      throw new AppError(
        'New password invalid, password must length from 8-32, contain letter and digit',
        'INVALID_NEW_PASS',
      );
    }
    // update password
    const newHashPass = await PasswordUtils.hashPassword(newPass);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashPass,
      },
    });

    const payload: ChangePassInput = {
      userName: user.profile.user_name,
      email: user.email,
    };
    this.eventEmitter.emit(EventType.forgot, payload);

    return true;
  }

  async getAccountInfo(userId: string): Promise<AccountInfo> {
    const profile = await this.prisma.userProfile.findUnique({
      where: {
        user_id: userId,
      },
      include: {
        user: true,
      },
    });

    return { email: profile.user.email, ...profile };
  }

  async updateAccountInfo(userId: string, input: AccountInfoUpdateInput) {
    try {
      await this.prisma.userProfile.update({
        where: {
          user_id: userId,
        },
        data: {
          given_name: input.given_name,
          user_name: input.user_name,
          display_name: input.display_name,
          family_name: input.family_name,
          date_of_birth: input.date_of_birth,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new AppError('username not available, please try another username', 'USERNAME_DUPLICATED');
      }
    }
  }

  async getNotifications(userId: string, page?: number, limit?: number) {
    return await this.prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async markAllNotisRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        is_seen: true,
      },
    });
    return true;
  }
}
