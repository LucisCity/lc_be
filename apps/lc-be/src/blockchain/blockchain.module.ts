import { CacheModule, Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { Erc20Service } from './erc20.service';
import { BlockchainResolver } from './blockchain.resolver';
import { TransactionService } from './transaction.service';

@Module({
  imports: [CacheModule.register()],
  providers: [BlockchainService, BlockchainResolver, TransactionService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
