import { Args, Int, Resolver, Subscription } from '@nestjs/graphql';
import { PubsubService } from '@libs/pubsub';
import { NotificationGql, UnseenNotifications } from './notification.dto';

@Resolver()
export class NotificationResolver {
  constructor(private pubsubService: PubsubService) {}

  @Subscription(() => NotificationGql, {
    name: 'pushNotification',
    filter: (payload, variables) => payload.pushNotification.user_id == variables.userId,
  })
  pushNotification(@Args('userId') userId: String) {
    return this.pubsubService.pubSub.asyncIterator('pushNotification');
  }

  @Subscription(() => UnseenNotifications, {
    name: 'unseenNotifications',
    filter: (payload, variables) => payload.unseenNotifications.user_id == variables.userId,
  })
  unseenNotifications(@Args('userId') userId: String) {
    return this.pubsubService.pubSub.asyncIterator('unseenNotifications');
  }
}
