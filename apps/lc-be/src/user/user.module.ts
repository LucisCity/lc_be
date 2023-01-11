import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserJob } from './user.job';

@Module({
  providers: [UserResolver, UserService, UserJob],
  exports: [UserService],
})
export class UserModule {}
