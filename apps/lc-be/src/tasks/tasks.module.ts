import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PubsubService } from '@libs/pubsub';

@Module({
  imports: [BlockchainModule, PubsubService],
  providers: [TasksService],
})
export class TasksModule {}
