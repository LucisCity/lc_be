import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { PubsubService } from '@libs/pubsub';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService, private pubsubService: PubsubService) {}

  async createAndPushNoti(userId: string, title: string, content: string, link?: string) {
    // this.logger.log('createAndPushNoti reached');
    const notiInput: Prisma.NotificationCreateInput = {
      user: {
        connect: {
          id: userId,
        },
      },
      title: title,
      content: content,
      link: link,
    };

    const responses = await this.prisma.$transaction([
      this.prisma.notification.create({
        data: notiInput as any,
      }),
      this.prisma.notification.count({
        where: {
          user_id: userId,
          is_seen: false,
        },
      }),
    ]);

    // this.logger.log(`newNoti ${JSON.stringify(newNoti)}`);
    await this.pubsubService.pubSub.publish('pushNotification', {
      pushNotification: responses[0],
      listReceiverId: [userId],
    });
    await this.pubsubService.pubSub.publish('unseenNotifications', {
      unseenNotifications: { user_id: userId, count: responses[1] },
      listReceiverId: [userId],
    });
  }

  async publishUnseenNotisCount(userId: string, count: number) {
    await this.pubsubService.pubSub.publish('unseenNotifications', {
      unseenNotifications: { user_id: userId, count: count },
      listReceiverId: [userId],
    });
  }
}
