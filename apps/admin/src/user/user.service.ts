import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { KycStatus } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/kyc-status.enum';
import { AppError } from '@libs/helper/errors/base.error';

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
      const pendingUserKyc = await this.prisma.userKycVerification.findFirst({
        where: {
          user_id,
          status: 'PENDING',
        },
      });
      if (!pendingUserKyc) {
        throw new AppError('No pending kycs with this user id', 'KYC_NOT_FOUND');
      }
      await this.prisma.userKycVerification.update({
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
}
