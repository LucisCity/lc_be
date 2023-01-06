import { Contract, ethers } from 'ethers';
import { BlockchainService } from './blockchain.service';

export class Erc721Service {
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

  public async totalSupply() {
    return await this.getContract().totalSupply();
  }
  public async balanceOf(address: string) {
    return await this.getContract().balanceOf(address);
  }

  public async transfer(recipient: string, amount: string, prvKey: string): Promise<string> {
    const wallet = new ethers.Wallet(prvKey, this.provider);
    const contractWithSigner = this.getContract().connect(wallet);
    const tx = await contractWithSigner.transfer(recipient, amount);
    return tx.hash;
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
  public async filterEvents(event: string, fromBlock: number, toBlock: number | string): Promise<ethers.Event[]> {
    const filterFrom = this.getContract().filters[event]();
    return await this.getContract().queryFilter(filterFrom, fromBlock, toBlock);
  }
}
