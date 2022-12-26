import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { CanActivate, ExecutionContext, Global, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { BaseAclGuard } from './acl.guard';
import { AclAction, ACL_DATA_KEY, AppAbility, IAclData, IAclFactory } from './acl.type';

type Subjects = InferSubjects<any> | 'all';

@Global()
@Injectable()
export class AclFactory implements IAclFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<Ability<[AclAction, Subjects]>>(Ability as AbilityClass<AppAbility>);

    if (user.role == 'ADMIN') {
      can(AclAction.Manage, 'all'); // read-write access to everything
    } else {
      can(AclAction.Read, 'all'); // read-only access to everything
    }

    // can(Action.Update, Model, { authorId: user.id });
    // cannot(Action.Delete, Model, { isPublished: true });

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    }) as AppAbility;
  }
}

@Injectable()
export class AclGuard extends BaseAclGuard {
  constructor(public reflector: Reflector, public factory: AclFactory) {
    super(reflector, factory);
  }
}

@Injectable()
export class CanAclGuard implements CanActivate {
  constructor(public reflector: Reflector, public factory: AclFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const aclData = this.reflector.get<IAclData[]>(ACL_DATA_KEY, context.getHandler()) || [];

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    const ability = this.factory.createForUser(user);

    return aclData.every((acl) => {
      return acl.actions.every((action) => ability.can(action, acl.subject));
    });
  }
}
