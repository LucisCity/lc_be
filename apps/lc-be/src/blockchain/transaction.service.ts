import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { encrypt } from '@libs/helper/crypto/crypto';

@Injectable()
export class TransactionService {
  constructor(private prismaService: PrismaService) {}

  async sendTransaction(txhash: string, abi?: string) {
    await this.prismaService.blockchainTransaction.create({
      data: {
        tx_hash: txhash,
        abi: abi,
      },
    });
  }

  async setPoolWallet(address: string, privateKey: string) {
    const prvKeyHash = await encrypt(privateKey);
    await this.prismaService.poolWallet.create({
      data: {
        prv: prvKeyHash,
        address,
      },
    });
  }
}
