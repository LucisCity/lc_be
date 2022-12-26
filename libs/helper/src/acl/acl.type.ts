import { Ability, InferSubjects } from '@casl/ability';
import { SetMetadata } from '@nestjs/common';
import { User } from '@prisma/client';

interface IAclHandler {
  handle(ability: AppAbility): boolean;
}

type AclHandlerCallback = (ability: AppAbility) => boolean;

export type AclHandler = IAclHandler | AclHandlerCallback;

export enum AclAction {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppAbility = Ability<[AclAction, InferSubjects<any> | 'all']>;
export interface IAclFactory {
  createForUser(user: User): AppAbility;
}

export const CHECK_ACL_KEY = 'check_acl';
export const CheckAcls = (...handlers: AclHandler[]) => SetMetadata(CHECK_ACL_KEY, handlers);

export interface IAclData {
  actions: AclAction[];
  subject: InferSubjects<any> | 'all';
}

export const ACL_DATA_KEY = 'ACL_DATA_KEY';
export const UseAcls = (...aclData: IAclData[]) => SetMetadata(ACL_DATA_KEY, aclData);
