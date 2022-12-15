import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';

@ObjectType()
export class Sender {
  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: false })
  subject: string;
}

@ObjectType()
export class Receiver {
  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => String, { nullable: false })
  name: string;

  @Field(() => Int, { nullable: true })
  user_id?: number;
}

export type VerifyInput = {
  email: string;
  userName: string;
  token: string;
};

export enum EventType {
  verifyEmail = 'user.verify',
  forgot = 'user.forgot',
}
