import { Module } from '@nestjs/common';
import { InvestResolver } from './invest.resolver';
import { InvestService } from './invest.service';

@Module({
  providers: [InvestResolver, InvestService]
})
export class InvestModule {}
