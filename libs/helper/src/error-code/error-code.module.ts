import { Module } from '@nestjs/common';
import { ErrorCodeResolver } from './error-code.resolver';

@Module({
  providers: [ErrorCodeResolver]
})
export class ErrorCodeModule {}
