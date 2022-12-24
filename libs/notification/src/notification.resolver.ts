import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { PubsubService } from '@libs/pubsub';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { NotificationGql } from '@libs/notification/notification.dto';

@Resolver()
export class NotificationResolver {
  constructor(private pubsubService: PubsubService) {}

  @Subscription(() => NotificationGql, {
    name: 'pushNotification',
    filter: (payload, variables) => payload.user.id == variables.userId,
  })
  pushNotification(@CurrentUser() user: AppAuthUser) {
    return this.pubsubService.pubSub.asyncIterator('pushNotification');
  }
}
