import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AclHandler, AppAbility, CHECK_ACL_KEY, IAclFactory } from './acl.type';

@Injectable()
export class BaseAclGuard implements CanActivate {
  constructor(public reflector: Reflector, public factory: IAclFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<AclHandler[]>(CHECK_ACL_KEY, context.getHandler()) || [];

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    const ability = this.factory.createForUser(user);

    return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));
  }

  private execPolicyHandler(handler: AclHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
