import { IsStrongPass } from '@libs/helper/pipe/password.pipe';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, Validate } from 'class-validator';

@ObjectType()
export class AuthGql {
  @Field(() => String, { nullable: false })
  'token': string;
  // @Field(() => UserGraphql, { nullable: false })
  // 'user': any;
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
  @IsEmail()
  'email': string;

  @Field(() => String, { nullable: false })
  @Validate(IsStrongPass)
  'password': string;

  @Field(() => String, { nullable: true })
  'ref_code': string;
}
