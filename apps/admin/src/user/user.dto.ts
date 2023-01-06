import { UserProfile } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile.model';
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';
import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { VipCardCreateInput } from '@libs/prisma/@generated/prisma-nestjs-graphql/vip-card/vip-card-create.input';
import { VipCardUpdateInput } from '@libs/prisma/@generated/prisma-nestjs-graphql/vip-card/vip-card-update.input';
import { IsNumberString, Length } from 'class-validator';

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

@InputType()
export class VipCardCreateInputGql extends OmitType(VipCardCreateInput, [
  'created_at',
  'updated_at',
  'id',
  'number',
  'password',
]) {
  @Field(() => String, { nullable: false })
  @Length(6, 6, { message: 'password must be exactly 6 characters, containing only numbers' })
  @IsNumberString()
  'password': string;
}

@InputType()
export class PasswordUpdate {
  @Field(() => String, { nullable: true })
  @Length(6, 6, { message: 'password must be exactly 6 characters, containing only numbers' })
  @IsNumberString()
  set?: string;
}

@InputType()
export class VipCardUpdateInputGql extends OmitType(VipCardUpdateInput, [
  'created_at',
  'updated_at',
  'id',
  'password',
]) {
  @Field(() => PasswordUpdate, { nullable: true })
  password: PasswordUpdate;
}
