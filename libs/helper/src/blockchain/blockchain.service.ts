import { Injectable } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { Chain, ETH } from '@libs/helper/blockchain/_utils/eth';
import { ERC_20_ABI } from '@libs/helper/blockchain/_utils/abi/erc20_abi';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: Contract;

  public setProvider(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  public getProvider() {
    return this.provider;
  }

  public setContract(contractAddress: string, abi: any) {
    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  public getContract() {
    return this.contract;
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
}
