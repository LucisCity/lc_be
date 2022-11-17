import { Ability } from '@casl/ability';

interface AppAbility {
  createForUser(user: any): any;
}
interface IPolicyHandler {
  handle(ability: Ability): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
