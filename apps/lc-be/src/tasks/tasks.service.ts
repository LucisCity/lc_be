import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@libs/prisma';
import { BlockchainService } from '../blockchain/blockchain.service';

const EVERY_2_SECONDS = '*/2 * * * * *';
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly enableCron = process.env.SCAN_BLOCKCHAIN_CRON_ENABLE === 'true';
  constructor(private prismaService: PrismaService, private blockChainService: BlockchainService) {
    this.logger.log(`Cron scan transaction from blockchain ${this.enableCron ? 'ON' : 'OFF'}`);
  }

  @Cron(EVERY_2_SECONDS)
  async listenerTransactionBlockchain() {
    if (!this.enableCron) {
      return;
    }

    const txList = await this.prismaService.blockchainTransaction.findMany({
      where: {
        OR: [
          {
            status: 'PENDING',
          },
          {
            status: 'CONFIRMING',
          },
        ],
      },
    });

    await this.prismaService.blockchainTransaction.updateMany({
      where: {
        OR: [
          {
            status: 'PENDING',
          },
          {
            status: 'CONFIRMING',
          },
        ],
      },
      data: {
        status: 'PROCESSING',
      },
    });

    for (const tx of txList) {
      try {
        // get first element
        const txDetail = await this.blockChainService.getTransactionReceipt(tx.tx_hash);
        // check status transaction
        if (!txDetail) {
          await this.prismaService.blockchainTransaction.update({
            where: {
              id: tx.id,
            },
            data: {
              status: 'PENDING',
            },
          });
          return;
        }
        if (txDetail.status !== 1) {
          await this.prismaService.blockchainTransaction.update({
            where: {
              id: tx.id,
            },
            data: {
              status: 'FAILED',
              message_error: 'Transaction revert: check on explorer (bscscan.com, etherscan.io,...)',
            },
          });
          return;
        }

        // succeed
        if (txDetail.confirmations < 10) {
          await this.prismaService.blockchainTransaction.update({
            where: {
              id: tx.id,
            },
            data: {
              status: 'CONFIRMING',
            },
          });
          return;
        }
        await this.prismaService.blockchainTransaction.update({
          where: {
            id: tx.id,
          },
          data: {
            status: 'SUCCEED',
          },
        });
        // TODO: Add handler here
      } catch (e) {
        this.logger.error(`Error: ${e.message}`);
        if (e.status === 503) {
          await this.prismaService.blockchainTransaction.update({
            where: {
              id: tx.id,
            },
            data: {
              message_error: e.message,
              status: 'PENDING',
            },
          });
          return;
        }
        await this.prismaService.blockchainTransaction.update({
          where: {
            id: tx.id,
          },
          data: {
            message_error: e.message,
            status: 'FAILED',
          },
        });
      }
    }
  }
}
