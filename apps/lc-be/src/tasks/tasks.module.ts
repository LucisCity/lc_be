import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationService } from '@libs/subscription/notification.service';
import { InvestModule } from '../invest/invest.module';

@Module({
  imports: [BlockchainModule, InvestModule],
  providers: [TasksService],
})
export class TasksModule {}
