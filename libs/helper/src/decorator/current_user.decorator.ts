/**
 * To get the current authenticated user in your graphql resolver, you can define a @CurrentUser() decorator
 * https://docs.nestjs.com/security/authentication#graphql
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/user-role.enum';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const { req, extra } = ctx.getContext();
  // http: req.user ; ws: extra.user
  const user = req && req.user ? req.user : extra.user;

  if (!!user && user.id == null) {
    user.id = 0;
  }

  return user;
});

export type AppAuthUser = {
  id: string;
  role: UserRole;
};
