import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountInfo, AccountInfoUpdateInput, ReferralDataResponse } from './user.dto/user.dto';
import { AppError } from '@libs/helper/errors/base.error';
import { PasswordUtils } from '@libs/helper/password.util';
import { ChangePassInput, EventType } from '@libs/helper/email';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from '@libs/notification';
import { ProfileGql } from '../auth/auth.type';
import { UserKycVerification } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-kyc-verification/user-kyc-verification.model';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private rewardReferral = process.env.REWARD_REFERRAL ?? '5';
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private notification: NotificationService,
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

  async getReferralUser(userId: string): Promise<ReferralDataResponse[]> {
    try {
      const list = await this.prisma.user.findMany({
        where: { invited_by: userId },
        include: {
          referral_log: true,
          profile: true,
        },
      });
      return list.map((item) => ({ ...item, reward: this.rewardReferral }));
    } catch (err) {
      throw err;
    }
  }

  async getBalance(userId: string) {
    try {
      return await this.prisma.wallet.findUnique({
        where: { user_id: userId },
      });
    } catch (err) {
      throw err;
    }
  }

  async getTransactionHistory(userId: string, skip: number, take: number) {
    try {
      const count = await this.prisma.transactionLog.count({ where: { user_id: userId } });
      const list = await this.prisma.transactionLog.findMany({
        where: { user_id: userId },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          wallet: true,
          blockchain_transaction: true,
        },
        skip,
        take,
      });
      return {
        count,
        transactionHistory: list,
      };
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

    if (invitee.is_claim) {
      throw new AppError('Referral claimed!', 'CLAIMED');
    }

    const response = await this.prisma.$transaction(async (tx) => {
      await tx.referralLog.update({
        where: { user_id: inviteeId },
        data: { is_claim: true },
      });
      // find invited person
      let wallet = await tx.wallet.findUnique({
        where: { user_id: invitee.invited_by },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            user_id: invitee.invited_by,
            balance: new Prisma.Decimal(this.rewardReferral),
          },
        });
        await tx.transactionLog.create({
          data: {
            type: 'CLAIM_REFERRAL',
            user_id: invitee.invited_by,
            description: 'Claim reward for referral',
            amount: new Prisma.Decimal(this.rewardReferral),
          },
        });
      } else {
        const transaction = await tx.transactionLog.create({
          data: {
            type: 'CLAIM_REFERRAL',
            user_id: invitee.invited_by,
            description: 'Claim reward for referral',
            amount: new Prisma.Decimal(this.rewardReferral),
          },
        });
        wallet = await tx.wallet.update({
          where: { user_id: invitee.invited_by },
          data: {
            balance: wallet.balance.add(new Prisma.Decimal(transaction.amount)),
          },
        });
      }
      return wallet;
    });

    return response;
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
      throw new AppError('User not found', 'USER_NOT_FOUND');
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

  async updateAccountInfo(userId: string, input: AccountInfoUpdateInput): Promise<ProfileGql> {
    try {
      const oldProfile = await this.prisma.userProfile.findUnique({
        where: {
          user_id: userId,
        },
      });
      const given_name = input.given_name ?? oldProfile.given_name;
      const family_name = input.family_name ?? oldProfile.family_name;
      const display_name =
        family_name && given_name ? family_name + ' ' + given_name : !family_name ? given_name : family_name;
      return await this.prisma.userProfile.update({
        where: {
          user_id: userId,
        },
        data: {
          given_name: input.given_name,
          user_name: input.user_name,
          display_name: display_name,
          family_name: input.family_name,
          date_of_birth: input.date_of_birth,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new AppError('Username not available', 'USERNAME_DUPLICATED');
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

  async countUnseenNotifications(userId: string) {
    return this.prisma.notification.count({
      where: {
        user_id: userId,
        is_seen: false,
      },
    });
  }
  async seenNotification(userId: string, notiId: number) {
    const responses = await this.prisma.$transaction([
      this.prisma.notification.update({
        where: {
          id: notiId,
        },
        data: {
          is_seen: true,
        },
      }),
      this.prisma.notification.count({
        where: {
          user_id: userId,
          is_seen: false,
        },
      }),
    ]);
    await this.notification.publishUnseenNotisCount(userId, responses[1]);
    return true;
  }

  async markAllNotisSeen(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        is_seen: true,
      },
    });
    await this.notification.publishUnseenNotisCount(userId, 0);
    return true;
  }

  async getKycImages(userId: string): Promise<UserKycVerification> {
    const userKyc = await this.prisma.userKycVerification.findMany({
      where: {
        user_id: userId,
      },
    });
    if (userKyc.length > 0) {
      return userKyc.find((i) => i.status !== 'FAILED') ?? userKyc[0];
    }
    return null;
  }

  async getVipCard(userId: string) {
    return await this.prisma.vipCard.findUnique({
      where: {
        user_id: userId,
      },
    });
  }
}
