import { IsStrongPass } from '@libs/helper/pipe/password.pipe';
import { UserProfile } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile.model';
import { User } from '@libs/prisma/@generated/prisma-nestjs-graphql/user/user.model';
import { ArgsType, Field, ObjectType, OmitType } from '@nestjs/graphql';
import { IsEmail, Validate } from 'class-validator';

@ObjectType()
export class ProfileGql extends OmitType(UserProfile, [
  'created_at',
  'updated_at',
  'country_code',
  'phone',
  'user',
]) {}

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

@ObjectType()
export class AuthGql {
  @Field(() => String, { nullable: false })
  'token': string;
  @Field(() => UserGql, { nullable: false })
  'user': UserGql;
}

@ArgsType()
export class LoginInput {
  @Field(() => String, { nullable: false })
  'email': string;

  @Field(() => String, { nullable: false })
  'password': string;
}

@ArgsType()
export class RegisterInput {
  @Field(() => String, { nullable: false })
  @IsEmail({ message: 'Email not valid' })
  'email': string;

  @Field(() => String, { nullable: false })
  @Validate(IsStrongPass, { message: 'Password not strong enough' })
  'password': string;

  @Field(() => String, { nullable: true })
  'ref_code': string;
}

export type FbDebugResponse = {
  app_id: number;
  type: string;
  application: string;
  expires_at: number;
  is_valid: boolean;
  issued_at: number;
  metadata: {
    sso: string;
  };
  scopes: string[];
  user_id: string;
  error: any;
};

export interface LoginLogInput {
  ip?: string;
}
