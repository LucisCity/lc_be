import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@libs/prisma';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PubsubService } from '@libs/pubsub';
import { ContractType } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/contract-type.enum';
import { Erc721Service } from '../blockchain/erc721.service';
import { erc721ABI } from '../blockchain/abi/erc721ABI';
import { BigNumber } from 'ethers';
import { Prisma } from '@prisma/client';
import { TransactionType } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/transaction-type.enum';
import { NotificationService } from '@libs/subscription/notification.service';

const EVERY_2_SECONDS = '*/2 * * * * *';
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly enableCron = process.env.SCAN_BLOCKCHAIN_CRON_ENABLE === 'true';
  private startBlock = 0;
  constructor(
    private prismaService: PrismaService,
    private blockChainService: BlockchainService,
    private pubsubService: PubsubService,
    private notificationService: NotificationService,
  ) {
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
          const transaction = await this.prismaService.blockchainTransaction.update({
            where: {
              id: tx.id,
            },
            data: {
              status: 'FAILED',
              message_error: 'Transaction revert: check on explorer (bscscan.com, etherscan.io,...)',
            },
            include: {
              transaction_log: true,
            },
          });
          await this.pubsubService.pubSub.publish('blockchainWatcher', {
            blockchainWatcher: transaction,
            listReceiverId: [transaction.transaction_log?.user_id],
          });
          return;
        }

        // succeed
        if (txDetail.confirmations < 10) {
          const transaction = await this.prismaService.blockchainTransaction.update({
            where: {
              id: tx.id,
            },
            data: {
              status: 'CONFIRMING',
            },
            include: {
              transaction_log: true,
            },
          });
          await this.pubsubService.pubSub.publish('blockchainWatcher', {
            blockchainWatcher: transaction,
            listReceiverId: [transaction.transaction_log?.user_id],
          });
          return;
        }
        const transaction = await this.prismaService.blockchainTransaction.update({
          where: {
            id: tx.id,
          },
          data: {
            status: 'SUCCEED',
          },
          include: {
            transaction_log: true,
          },
        });
        await this.pubsubService.pubSub.publish('blockchainWatcher', {
          blockchainWatcher: transaction,
          listReceiverId: [transaction.transaction_log?.user_id],
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
        const transaction = await this.prismaService.blockchainTransaction.update({
          where: {
            id: tx.id,
          },
          data: {
            message_error: e.message,
            status: 'FAILED',
          },
          include: {
            transaction_log: true,
          },
        });

        await this.pubsubService.pubSub.publish('blockchainWatcher', {
          blockchainWatcher: transaction,
          listReceiverId: [transaction.transaction_log?.user_id],
        });
      }
    }
  }

  @Cron(EVERY_2_SECONDS)
  async listenerEventNft() {
    if (!this.enableCron) {
      return;
    }

    const blockNumber = await this.blockChainService.getBlockNumber();
    if (this.startBlock === 0) {
      // rada 3000 blocks
      this.startBlock = blockNumber - 3000;
    }
    if (blockNumber === this.startBlock) {
      return;
    } else {
      this.startBlock = blockNumber;
    }
    const contracts = await this.prismaService.contract.findMany({
      where: {
        OR: [
          {
            type: ContractType.NFT,
          },
        ],
      },
    });

    const listNftInstance: Erc721Service[] = [];
    for (const c of contracts) {
      const nft = new Erc721Service(this.blockChainService);
      nft.setContract(c.address, c?.abi ?? erc721ABI);
      listNftInstance.push(nft);
    }

    listNftInstance.forEach((instance) => {
      instance.filterEvents('Transfer', this.startBlock, 'latest').then((listEvents) => {
        listEvents.forEach(async (event) => {
          const from = event.args[0];
          const to = event.args[1];
          const tokenId = event.args[2] as BigNumber;
          // transfer
          const nft = await this.prismaService.nft.findUnique({ where: { token_id: tokenId.toString() } });
          if (!nft) {
            await this.prismaService.nft.create({
              data: {
                token_id: tokenId.toString(),
                owner: to,
                address: instance.getContract().address,
              },
            });
          }
          // mint
          if (from === '0x0000000000000000000000000000000000000000') {
            const floorPrice = await instance.getContract().floorPrice();
            const normalizeFloorPrice = BigNumber.from(floorPrice).toString();

            const user = await this.prismaService.user.findUnique({ where: { wallet_address: to } });
            await this.prismaService.transactionLog.create({
              data: {
                type: TransactionType.BUY_NFT,
                user_id: user?.wallet_address ?? '0000000000000000000000000',
                description: 'Claim reward for referral',
                amount: new Prisma.Decimal(normalizeFloorPrice),
              },
            });
            if (user) {
              await this.notificationService.createAndPushNoti(
                user.id,
                'you just bought one nft',
                `you just bought one nft`,
              );
            }

            return;
          }
          if (nft.owner === from && to !== nft.owner) {
            await this.prismaService.nft.update({
              where: {
                token_id: tokenId.toString(),
              },
              data: {
                owner: to,
              },
            });
          }
        });
      });
    });
  }
}
