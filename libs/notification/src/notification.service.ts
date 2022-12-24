import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { PubsubService } from '@libs/pubsub';
import { Prisma } from '@prisma/client';
import { NotificationGql } from './notification.dto';

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

    const newNoti: NotificationGql = await this.prisma.notification.create({
      data: notiInput as any,
    });

    // this.logger.log(`newNoti ${JSON.stringify(newNoti)}`);
    this.pubsubService.pubSub.publish('pushNotification', { pushNotification: newNoti });
  }
}
