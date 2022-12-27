import { Field, Int, ObjectType, OmitType } from '@nestjs/graphql';
import { Notification } from '@libs/prisma/@generated/prisma-nestjs-graphql/notification/notification.model';

@ObjectType()
export class NotificationGql extends OmitType(Notification, ['updated_at', 'user']) {}

@ObjectType()
export class UnseenNotifications {
  @Field(() => String, { nullable: true })
  user_id: string;

  @Field(() => Int, { nullable: true })
  count: number;
}
