import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { Erc20Service } from './erc20.service';
import { BlockchainResolver } from './blockchain.resolver';
import { TransactionService } from './transaction.service';

@Module({
  providers: [
    BlockchainService,
    Erc20Service,
    BlockchainResolver,
    TransactionService,
  ],
  exports: [BlockchainService, Erc20Service],
})
export class BlockchainModule {}
