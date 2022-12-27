import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [TasksService],
})
export class TasksModule {}
