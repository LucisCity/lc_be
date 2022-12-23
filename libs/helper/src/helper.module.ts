import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  providers: [HelperService],
  exports: [HelperService],
  imports: [BlockchainModule],
})
export class HelperModule {}
