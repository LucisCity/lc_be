import { UserProfile } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile.model';
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';
import { Field, ObjectType, OmitType } from '@nestjs/graphql';

@ObjectType()
export class ProfileGql extends OmitType(UserProfile, ['created_at', 'updated_at', 'country_code', 'phone', 'user']) {}

@ObjectType()
export class UserGql extends OmitType(User, [
  'created_at',
  'updated_at',
  'facebook_id',
  'google_id',
  'invited_by',
  'password',
  'profile',
  'role',
  'status',
]) {
  @Field(() => ProfileGql, { nullable: false })
  'profile': ProfileGql;
}
