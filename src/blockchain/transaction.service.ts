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
      throw new AppError('claim time expired!', 'SIGNATURE_EXPIRED');
    }

    const signer = ethers.utils.verifyMessage(password, signatureOTP);
    if (signer !== address) {
      throw new AppError('signature was wrong!', 'SIGNATURE_WRONG');
    }
    const wallet = await this.prismaService.wallet.findUnique({
      where: { user_id: userId },
    });
    if (!wallet) {
      throw new AppError('wallet not exist!', 'WALLET_NOT_EXIST');
    }

    if (wallet.balance.lessThan(amount)) {
      throw new AppError('Balance not enough!', 'BALANCE_NOT_ENOUGH');
    }

    const erc20Service = new Erc20Service(this.blockchainService);
    erc20Service.setContract(usdtAddress, erc20ABI);

    const poolWallet = await this.prismaService.poolWallet.findFirst({ where: { type: 'USDT_POOL' } });
    const balancePool = erc20Service.balanceOf(poolWallet.address);

    if (BigNumber.from(balancePool).lt(BigNumber.from(amount))) {
      this.logger.error('Out of money');
      throw new AppError('Balance pool not enough!', 'BALANCE_POOL_NOT_ENOUGH');
    }

    const prk = await decrypt(poolWallet.prv);
    const hash = await erc20Service.transfer(address, ethers.utils.formatUnits(amount, 'ether'), prk);
    // add transaction hash to db
    await this.addTransaction(hash);

    await this.prismaService.wallet.update({
      where: { user_id: userId },
      data: { balance: wallet.balance.minus(amount) },
    });
  }

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
}
