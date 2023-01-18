import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { encrypt } from '@libs/helper/crypto/crypto';

@Injectable()
export class BlockchainService {
  constructor(private prismaService: PrismaService) {}

  async setPoolWallet(address: string, privateKey: string) {
    const prvKeyHash = await encrypt(privateKey);
    await this.prismaService.poolWallet.create({
      data: {
        prv: prvKeyHash,
        address,
        type: 'USDT_POOL',
      },
    });
  }

  async setProjectContract(address: string, abi?: string) {
    await this.prismaService.contract.create({
      data: {
        address,
        abi: abi,
      },
    });
  }
}
