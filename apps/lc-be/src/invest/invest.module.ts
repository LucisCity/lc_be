import { Module } from '@nestjs/common';
import { InvestJob } from './invest.job';
import { InvestResolver } from './invest.resolver';
import { InvestService } from './invest.service';

@Module({
  providers: [InvestResolver, InvestService, InvestJob],
})
export class InvestModule {}
