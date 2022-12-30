import { Args, Int, Resolver, Subscription } from '@nestjs/graphql';
import { PubsubService } from '@libs/pubsub';
import { NotificationGql, UnseenNotifications } from './notification.dto';
import { BlockchainTransaction } from '@libs/prisma/@generated/prisma-nestjs-graphql/blockchain-transaction/blockchain-transaction.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { AuthWsGuard } from '@libs/helper/guards/authWs.guard';

@Resolver()
export class NotificationResolver {
  constructor(private pubsubService: PubsubService) {}

  @UseGuards(AuthWsGuard)
  @Subscription(() => NotificationGql, {
    name: 'pushNotification',
    filter: (payload, variables) => payload.pushNotification.user.id == variables.userId,
  })
  pushNotification(@CurrentUser() user: AppAuthUser) {
    return this.pubsubService.pubSub.asyncIterator('pushNotification');
  }

  @UseGuards(AuthWsGuard)
  @Subscription(() => UnseenNotifications, {
    name: 'unseenNotifications',
    filter: (payload, variables) => payload.unseenNotifications.user.id == variables.userId,
  })
  unseenNotifications(@CurrentUser() user: AppAuthUser) {
    return this.pubsubService.pubSub.asyncIterator('unseenNotifications');
  }

  @UseGuards(AuthWsGuard)
  @Subscription(() => BlockchainTransaction, {
    name: 'blockchainWatcher',
    filter: (payload, variables) => payload.blockchainWatcher.user.id == variables.userId,
  })
  blockchainWatcher(@CurrentUser() user: AppAuthUser) {
    return this.pubsubService.pubSub.asyncIterator('blockchainWatcher');
  }
}
