import { ObjectType, OmitType } from '@nestjs/graphql';
import { Notification } from '@libs/prisma/@generated/prisma-nestjs-graphql/notification/notification.model';

@ObjectType()
export class NotificationGql extends OmitType(Notification, ['updated_at', 'user']) {}
