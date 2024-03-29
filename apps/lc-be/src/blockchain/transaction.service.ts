import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { decrypt, encrypt } from '@libs/helper/crypto/crypto';
import { Cache } from 'cache-manager';
import { randString } from '@libs/helper/string.helper';
import { AppError } from '@libs/helper/errors/base.error';
import { Prisma } from '@prisma/client';
import { Erc20Service } from './erc20.service';
import { BlockchainService } from './blockchain.service';
import { erc20ABI } from './abi/erc20ABI';
import { BigNumber, ethers } from 'ethers';
import { ErrorCode } from '@libs/helper/error-code/error-code.dto';

const usdtAddress = process.env.USDT_ADDRESS ?? '0xa9Ee5E11f26E9F6F9A1952AEbd5A91C138380B82';
@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prismaService: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async getOneTimePassword(address: string) {
    const password = randString(10);
    await this.cacheManager.set(address, password, 5 * 60);
    return password;
  }

  async addTransaction(txhash: string, abi?: string) {
    await this.prismaService.blockchainTransaction.create({
      data: {
        tx_hash: txhash,
        abi: abi,
      },
    });
  }

  async withdrawBalance(userId: string, address: string, amount: string, signatureOTP: string) {
    const password = await this.cacheManager.get<string>(address);
    if (!password) {
      throw new AppError('claim time expired!', ErrorCode.SIGNATURE_EXPIRED);
    }
    await this.cacheManager.del(address);
    const signer = ethers.utils.verifyMessage(password, signatureOTP);
    if (signer !== address) {
      throw new AppError('signature was wrong!', ErrorCode.SIGNATURE_WRONG);
    }
    const wallet = await this.prismaService.wallet.findUnique({
      where: { user_id: userId },
    });
    if (!wallet) {
      throw new AppError('wallet not exist!', ErrorCode.WALLET_NOT_FOUND);
    }

    if (wallet.balance.lessThan(amount)) {
      throw new AppError('Balance not enough!', ErrorCode.BALANCE_NOT_ENOUGH);
    }

    const erc20Service = new Erc20Service(this.blockchainService);
    erc20Service.setContract(usdtAddress, erc20ABI);

    const poolWallet = await this.prismaService.poolWallet.findFirst({ where: { type: 'USDT_POOL' } });
    const balancePool = await erc20Service.balanceOf(poolWallet.address);

    if (ethers.utils.parseUnits(balancePool.toString()).lt(ethers.utils.parseUnits(amount))) {
      this.logger.error('Out of money');
      throw new AppError('Balance pool not enough!', ErrorCode.BALANCE_POOL_NOT_ENOUGH);
    }

    // add transaction hash to db
    const response = await this.prismaService.$transaction(async (tx) => {
      await this.prismaService.wallet.update({
        where: { user_id: userId },
        data: { balance: wallet.balance.minus(amount) },
      });

      const prk = await decrypt(poolWallet.prv);
      const hash = await erc20Service.transfer(address, ethers.utils.parseUnits(amount).toString(), prk);
      return await tx.transactionLog.create({
        data: {
          type: 'WITHDRAW_BALANCE',
          user_id: userId,
          description: 'withdraw balance to real wallet',
          amount: new Prisma.Decimal(amount),
          blockchain_transaction: {
            create: {
              tx_hash: hash,
            },
          },
        },
        include: {
          blockchain_transaction: true,
          user: true,
        },
      });
    });

    return response;
  }
}
