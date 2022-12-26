import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountInfo, AccountInfoUpdateInput } from './user.dto/user.dto';
import { AppError } from '@libs/helper/errors/base.error';
import { PasswordUtils } from '@libs/helper/password.util';
import { ChangePassInput, EventType, VerifyInput } from '@libs/helper/email';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

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

  async claimReferral(inviteeId: string) {
    const invitee = await this.prisma.referralLog.findUnique({
      where: { user_id: inviteeId },
    });

    if (!invitee) {
      throw new AppError('Invitee not exist!', 'INVITEE_NOT_EXIST');
    }

    if (invitee.isClaim) {
      throw new AppError('Referral claimed!', 'CLAIMED');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.referralLog.update({
        where: { user_id: inviteeId },
        data: { isClaim: true },
      });
      // find invited person
      const wallet = await tx.wallet.findUnique({
        where: { user_id: invitee.invited_by },
      });

      if (!wallet) {
        await tx.wallet.create({
          data: {
            user_id: invitee.invited_by,
            balance: new Prisma.Decimal(5),
          },
        });
        await tx.transactionLog.create({
          data: {
            type: 'CLAIM_REFERRAL',
            user_id: invitee.invited_by,
            description: 'Claim reward for referral',
            amount: new Prisma.Decimal(5),
          },
        });
      } else {
        const transaction = await tx.transactionLog.create({
          data: {
            type: 'CLAIM_REFERRAL',
            user_id: invitee.invited_by,
            description: 'Claim reward for referral',
            amount: new Prisma.Decimal(5),
          },
        });
        await tx.wallet.update({
          where: { user_id: invitee.invited_by },
          data: {
            balance: wallet.balance.add(new Prisma.Decimal(transaction.amount)),
          },
        });
      }
    });

    return true;
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

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
  ): Promise<boolean> {
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
      throw new AppError(
        'New password must be different from old password',
        'NEW_PASS_SAME_OLD_PASS',
      );
    }
    // check old password
    if (!(await PasswordUtils.comparePassword(oldPass, user.password))) {
      throw new AppError(
        'Wrong old password, please try again',
        'WRONG_OLD_PASS',
      );
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
        throw new AppError(
          'username not available, please try another username',
          'USERNAME_DUPLICATED',
        );
      }
    }
  }
}
