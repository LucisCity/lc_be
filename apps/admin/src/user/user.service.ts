import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { KycStatus } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/kyc-status.enum';
import { AppError } from '@libs/helper/errors/base.error';
import { VipCardTier } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/vip-card-tier.enum';
import { VipCardCreateInputGql, VipCardUpdateInputGql } from './user.dto';
import { randString } from '@libs/helper/string.helper';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getPendingKycs() {
    return await this.prisma.userKycVerification.findMany({
      where: {
        status: 'PENDING',
      },
    });
  }

  async getKycs(id?: number, user_id?: string, status?: KycStatus) {
    return await this.prisma.userKycVerification.findMany({
      where: {
        user_id,
        id,
        status,
      },
    });
  }

  async updateKyc(user_id: string, status: KycStatus) {
    await this.prisma.$transaction(async (prisma) => {
      const pendingUserKyc = await prisma.userKycVerification.findFirst({
        where: {
          user_id,
          status: 'PENDING',
        },
      });
      if (!pendingUserKyc) {
        throw new AppError('No pending kycs with this user id', 'KYC_NOT_FOUND');
      }
      await prisma.userKycVerification.update({
        where: {
          id: pendingUserKyc.id,
        },
        data: {
          status: status,
        },
      });
    });
    return true;
  }

  async getVipCards(id?: string, userId?: string, number?: string, tier?: VipCardTier) {
    return await this.prisma.vipCard.findMany({
      where: {
        id,
        number,
        tier,
        user_id: userId,
      },
    });
  }

  async createVipCard(input: VipCardCreateInputGql) {
    return await this.prisma.$transaction(async (tx) => {
      const vipcard = await tx.vipCard.create({
        data: {
          ...input,
          number: randString(16, '1234567890'),
        },
      });

      await tx.user.update({
        where: { id: vipcard.user_id },
        data: {
          role: 'VIP_USER',
        },
      });

      return vipcard;
    });
  }

  async updateVipCard(number: string, input: VipCardUpdateInputGql) {
    await this.prisma.vipCard.update({
      where: {
        number,
      },
      data: input as any,
    });
    return true;
  }

  async deleteVipCard(number: string) {
    await this.prisma.vipCard.delete({
      where: {
        number,
      },
    });
    return true;
  }
}
