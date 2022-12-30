import { Args, Int, Resolver, Subscription } from '@nestjs/graphql';
import { PubsubService } from '@libs/pubsub';
import { NotificationGql, UnseenNotifications } from './subscription.dto';
import { BlockchainTransaction } from '@libs/prisma/@generated/prisma-nestjs-graphql/blockchain-transaction/blockchain-transaction.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { AuthWsGuard } from '@libs/helper/guards/authWs.guard';

@Resolver()
export class SubscriptionResolver {
  /**
   * filter receiver message
   * @param payload always have field `listReceiverId` as Array<string> that is a list receiver
   * @param context
   */
  public static _filter(payload, context) {
    const user = context?.extra?.user;
    if (user && user.id) {
      const receiver = (payload?.listReceiverId ?? []).find((id) => id === user.id);
      return !!receiver;
    }
    return false;
  }
  constructor(private pubsubService: PubsubService) {}

  @UseGuards(AuthWsGuard)
  @Subscription(() => NotificationGql, {
    name: 'pushNotification',
    filter: SubscriptionResolver._filter,
  })
  pushNotification() {
    return this.pubsubService.pubSub.asyncIterator('pushNotification');
  }

  @UseGuards(AuthWsGuard)
  @Subscription(() => UnseenNotifications, {
    name: 'unseenNotifications',
    filter: SubscriptionResolver._filter,
  })
  unseenNotifications() {
    return this.pubsubService.pubSub.asyncIterator('unseenNotifications');
  }

  @UseGuards(AuthWsGuard)
  @Subscription(() => BlockchainTransaction, {
    name: 'blockchainWatcher',
    filter: SubscriptionResolver._filter,
  })
  blockchainWatcher() {
    return this.pubsubService.pubSub.asyncIterator('blockchainWatcher');
  }
}
