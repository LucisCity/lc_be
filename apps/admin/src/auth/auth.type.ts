import { IsStrongPass } from '@libs/helper/pipe/password.pipe';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { IsEmail, Validate } from 'class-validator';
import { UserGql } from '../user/user.dto';

@ObjectType()
export class AuthGql {
  @Field(() => String, { nullable: false })
  'token': string;
  @Field(() => UserGql, { nullable: false })
  'user': User;
}

@ArgsType()
export class LoginInput {
  @Field(() => String, { nullable: false })
  @IsEmail()
  'email': string;

  @Field(() => String, { nullable: false })
  'password': string;
}

@ArgsType()
export class RegisterInput {
  @Field(() => String, { nullable: false })
  @IsEmail()
  'email': string;

  @Field(() => String, { nullable: false })
  @Validate(IsStrongPass)
  'password': string;
}
