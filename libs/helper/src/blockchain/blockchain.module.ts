import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { Erc20Service } from '@libs/helper/blockchain/erc20.service';

@Module({
  providers: [BlockchainService, Erc20Service],
})
export class BlockchainModule {}
