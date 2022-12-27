import { Args, Query, Resolver } from '@nestjs/graphql';
import { ProjectGql } from './invest.dto';
import { InvestService } from './invest.service';

@Resolver()
export class InvestResolver {
  constructor(private service: InvestService) {}

  @Query(() => ProjectGql, {
    description: 'Get list referral user',
  })
  async getProject(@Args('id') id: string) {
    return await this.service.getProject(id);
  }
}
