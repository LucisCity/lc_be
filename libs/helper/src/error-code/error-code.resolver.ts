import { Args, Query, Resolver } from '@nestjs/graphql';
import { ErrorCode } from '@libs/helper/error-code/error-code.dto';

@Resolver()
export class ErrorCodeResolver {
  @Query(() => Boolean, { nullable: true })
  async getAppErrorCode(
    @Args('error_code', {
      type: () => ErrorCode,
      nullable: true,
    })
    error: ErrorCode,
  ): Promise<boolean> {
    return true;
  }
}
