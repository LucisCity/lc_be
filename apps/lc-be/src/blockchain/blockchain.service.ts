import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL ?? 'localhost';
@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  }
  public setProvider(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  public getProvider() {
    return this.provider;
  }

  public async getTransactionReceipt(txHash: string) {
    const txReceipt = await this.provider.getTransactionReceipt(txHash);
    if (txReceipt && txReceipt.blockNumber) {
      return txReceipt;
    }
    return null;
  }

  public async getBlockNumber() {
    return await this.provider.getBlockNumber();
  }

  /***
   * @param to
   * @param amount want to send. Exp: 0.1 bnb
   * @param privateKey
   *  ***/
  public async sendCoin(to: string, amount: string, privateKey: string) {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    return await wallet.sendTransaction({
      to,
      value: ethers.utils.parseUnits(amount, 18),
    });
  }

  public async getLogs(from: number, to: number, address?: string, topics?: string[]) {
    const req: {
      fromBlock: number;
      toBlock: number;
      address?: string;
      topics?: string[];
    } = {
      fromBlock: from,
      toBlock: to,
    };
    if (address) {
      req.address = address;
    }
    if (topics) {
      const _topics: string[] = [];
      for (const item of topics) {
        if (item.indexOf('(') >= 0) {
          _topics.push(ethers.utils.id(item));
        } else {
          _topics.push(item);
        }
      }
      req.topics = _topics;
    }
    // console.log(req)
    return this.getProvider().getLogs(req);
  }
}
