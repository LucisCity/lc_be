import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

import { PrismaService } from '@libs/prisma';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PubsubService } from '@libs/pubsub';
import { ContractType } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/contract-type.enum';
import { Erc721Service } from '../blockchain/erc721.service';
import { erc721ABI } from '../blockchain/abi/erc721ABI';
import { BigNumber, ethers } from 'ethers';
import { Prisma } from '@prisma/client';
import { TransactionType } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/transaction-type.enum';
import { NotificationService } from '@libs/subscription/notification.service';
import { InvestService } from '../invest/invest.service';
import { lucisCity721Abi } from '../blockchain/abi/lucisCity721Abi';

const EVERY_3_SECONDS = '*/3 * * * * *';
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
    private investService: InvestService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.logger.log(`Cron scan transaction from blockchain ${this.enableCron ? 'ON' : 'OFF'}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
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
        if (e.status == 500 || e.status == 501 || e.status == 502 || e.status == 503 || e.status == 504) {
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
        this.logger.error(`Error: ${e.message}`);
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

  @Cron(EVERY_3_SECONDS)
  async listenerEventNft() {
    if (!this.enableCron) {
      return;
    }
    try {
      const blockNumber = await this.blockChainService.getBlockNumber();
      if (this.startBlock === 0) {
        // rada 4000 blocks
        this.startBlock = blockNumber - 4000;
      } else if (this.startBlock === blockNumber) {
        return;
      }

      const contractsString = await this.cacheManager.get('contractsList');
      let contracts = [];
      if (!contractsString) {
        const contractsList = await this.prismaService.contract.findMany({
          where: {
            OR: [
              {
                type: ContractType.NFT,
              },
            ],
          },
        });

        if (contractsList.length > 0) {
          await this.cacheManager.set('contractsList', JSON.stringify(contractsList), 84600);
        }
        contracts = contractsList;
      } else {
        contracts = JSON.parse(contractsString);
      }

      const listNftInstance: Erc721Service[] = [];
      for (const c of contracts) {
        const nft = new Erc721Service(this.blockChainService);
        nft.setContract(c.address, lucisCity721Abi);
        listNftInstance.push(nft);
      }

      listNftInstance.forEach((instance) => {
        const contractAddress = instance.getContract().address;
        instance
          .filterEvents('Transfer', this.startBlock, 'latest')
          .then((listEvents) => {
            listEvents.forEach(async (event) => {
              const from = event.args[0];
              const to = event.args[1];
              const tokenId = event.args[2] as BigNumber;
              // transfer
              const nft = await this.prismaService.nft.findFirst({
                where: { token_id: tokenId.toString(), address: contractAddress },
              });
              if (!nft) {
                await this.prismaService.nft.create({
                  data: {
                    token_id: tokenId.toString(),
                    owner: to,
                    address: contractAddress,
                  },
                });
              }
              // mint
              if (from === '0x0000000000000000000000000000000000000000') {
                const floorPrice = await instance.getContract().floorPrice();
                const normalizeFloorPrice = Number(ethers.utils.formatUnits(BigNumber.from(floorPrice))).toString();

                const user = await this.prismaService.user.findUnique({ where: { wallet_address: to } });
                // find and update total sold project
                const project = await this.prismaService.project.update({
                  where: { contract_address: contractAddress },
                  data: {
                    total_nft_sold: { increment: 1 },
                  },
                });
                if (user) {
                  await this.prismaService.transactionLog.create({
                    data: {
                      type: TransactionType.BUY_NFT,
                      user_id: user?.id,
                      description: `Buy nft ${tokenId} in contract: ${contractAddress}`,
                      amount: new Prisma.Decimal(normalizeFloorPrice),
                    },
                  });
                  if (project?.id) {
                    await this.investService.updateProjectNftOwner(user.id, project.id);
                  }
                  await this.notificationService.createAndPushNoti(
                    user.id,
                    'You just bought one nft',
                    `Buy nft #${tokenId} in contract: ${contractAddress}`,
                  );
                }

                return;
              }
              if (nft.owner === from && to !== nft.owner) {
                await this.prismaService.nft.updateMany({
                  where: {
                    token_id: tokenId.toString(),
                    address: contractAddress,
                  },
                  data: {
                    owner: to,
                  },
                });
              }
            });
          })
          .catch((e) => {
            // this.logger.error(`Error: ${e.message}`);
          })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .finally(() => {});
      });
      this.startBlock = blockNumber;
    } catch (e) {
      // this.logger.error(`Error: ${e.message}`);
    }
  }
}
