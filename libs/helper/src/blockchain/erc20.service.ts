import { Contract, ethers } from 'ethers';
import { KMath } from '@libs/helper/math.helper';
import { BlockchainService } from '@libs/helper/blockchain/blockchain.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Erc20Service {
  private readonly provider: ethers.providers.JsonRpcProvider;
  private contract: Contract;

  constructor(private blockchainService: BlockchainService) {
    this.provider = blockchainService.getProvider();
  }

  public setContract(contractAddress: string, abi: any) {
    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  public getContract() {
    return this.contract;
  }

  public async getTransactionReceipt(txHash: string) {
    const txReceipt = await this.provider.getTransactionReceipt(txHash);
    if (txReceipt && txReceipt.blockNumber) {
      return txReceipt;
    }
    return null;
  }

  public async totalSupply() {
    return await this.getContract().totalSupply();
  }
  public async balanceOf(address: string) {
    return await this.getContract().balanceOf(address);
  }
  public async allowance(owner: string, spender: string) {
    const _decimals = await this.getContract().decimals();
    const decimals = Math.pow(10, _decimals);
    const result = await this.getContract().allowance(owner, spender);
    // console.log('result: ', result);
    return KMath.div(result.toString(), decimals).toNumber();
  }
  public async transfer(recipient: string, amount: string, prvKey: string) {
    const wallet = new ethers.Wallet(prvKey, this.provider);
    const contractWithSigner = this.getContract().connect(wallet);
    const tx = await contractWithSigner.transfer(recipient, amount);
    return tx.hash;
  }
  public async approve(spender: string, amount: string, prvKey: string) {
    const wallet = new ethers.Wallet(prvKey, this.provider);
    const contractWithSigner = this.getContract().connect(wallet);

    return await contractWithSigner.approve(spender, amount, {
      gasLimit: 150000,
    });
  }
  public async getDecimals() {
    const contract = this.getContract();
    const _decimals = await contract.decimals();
    return Math.pow(10, _decimals);
  }

  /***
   * @param event
   * @param fromBlock
   * @param toBlock
   *  ***/
  public async filterEvents(
    event: string,
    fromBlock: number,
    toBlock: number,
  ): Promise<ethers.Event[]> {
    const filterFrom = this.getContract().filters[event]();
    return await this.getContract().queryFilter(filterFrom, fromBlock, toBlock);
  }
}
