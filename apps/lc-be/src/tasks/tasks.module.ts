import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationService } from '@libs/subscription/notification.service';

@Module({
  imports: [BlockchainModule],
  providers: [TasksService],
})
export class TasksModule {}
