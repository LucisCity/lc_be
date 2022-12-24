import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PubsubModule } from '@libs/pubsub';
import { NotificationResolver } from './notification.resolver';

@Global()
@Module({
  imports: [PubsubModule],
  providers: [NotificationService, NotificationResolver],
  exports: [NotificationService],
})
export class NotificationModule {}
