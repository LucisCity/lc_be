import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { Erc20Service } from '@libs/helper/blockchain/erc20.service';

@Module({
  providers: [HelperService],
  exports: [HelperService],
  imports: [BlockchainModule, Erc20Service],
})
export class HelperModule {}
