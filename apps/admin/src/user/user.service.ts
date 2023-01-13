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

  async updatePendingKyc(user_ids: string[], status: KycStatus): Promise<string> {
    return await this.prisma.$transaction(async (prisma) => {
      const pendingUserKycs = await prisma.userKycVerification.findMany({
        where: {
          user_id: {
            in: user_ids,
          },
          status: 'PENDING',
        },
      });
      if (pendingUserKycs.length === 0) {
        throw new AppError('No pending kycs found with these user_ids', 'KYC_NOT_FOUND');
      }
      await prisma.userKycVerification.updateMany({
        where: {
          id: {
            in: pendingUserKycs.map((i) => i.id),
          },
        },
        data: {
          status: status,
        },
      });
      return `pending kycs ${status} for user_ids: ${pendingUserKycs.map((i) => i.user_id)}`;
    });
  }

  async revertKycToPending(id: number) {
    await this.prisma.userKycVerification.update({
      where: {
        id,
      },
      data: {
        status: 'PENDING',
      },
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
