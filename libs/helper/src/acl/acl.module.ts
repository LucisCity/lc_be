import { Global, Module } from '@nestjs/common';
import { AclFactory } from './acl.base';
import { AclService } from './acl.service';

@Global()
@Module({
  providers: [AclService, AclFactory],
  exports: [AclFactory],
})
export class AclModule {}
