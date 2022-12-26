import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { UserProfile } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile.model';

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
  'email': string;
}

@InputType()
export class AccountInfoUpdateInput {
  @Field(() => String, { nullable: true })
  user_name!: string | null;

  @Field(() => String, { nullable: true })
  display_name!: string | null;

  @Field(() => String, { nullable: true })
  given_name!: string | null;

  @Field(() => String, { nullable: true })
  family_name!: string | null;

  @Field(() => Date, { nullable: true })
  date_of_birth!: Date | null;
}
