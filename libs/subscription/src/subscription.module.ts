import { Global, Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PubsubModule } from '@libs/pubsub';
import { SubscriptionResolver } from './subscription.resolver';
import { NotificationService } from '@libs/subscription/notification.service';

@Global()
@Module({
  imports: [PubsubModule],
  providers: [SubscriptionService, SubscriptionResolver, NotificationService],
  exports: [SubscriptionService, NotificationService],
})
export class SubscriptionModule {}
