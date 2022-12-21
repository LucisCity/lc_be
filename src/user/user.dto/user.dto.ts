import { Field, ObjectType, PickType } from "@nestjs/graphql";
import { UserProfile } from "@libs/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile.model";
import { EmailPipe } from "@libs/helper/pipe/email.pipe";
import { Validate } from "class-validator";


@ObjectType()
export class AccountInfo extends PickType(UserProfile, [
  'user_id',
  'family_name',
  'given_name',
  'display_name',
  'user_name',
  'date_of_birth',
] as const) {
  @Field(() => String, { nullable: true })
  @Validate(EmailPipe)
  'email': string;
}