import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PubsubModule } from '@libs/pubsub';

@Module({
  imports: [PubsubModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
