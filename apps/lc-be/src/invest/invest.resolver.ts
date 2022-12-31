import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProjectFilter, ProjectGql, RateProjectInput } from './invest.dto';
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

  @Query(() => [ProjectGql], {
    description: 'Get related project',
  })
  async getProjects(@Args('filter', { type: () => ProjectFilter, nullable: true }) filter: ProjectFilter) {
    return await this.service.getProjects(filter);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean, {
    description: '',
  })
  async isVoted(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string) {
    return await this.service.isVoted(user.id, projectId);
  }

  // Mutation

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Vote project',
  })
  async voteProject(@CurrentUser() user: AppAuthUser, @Args('input') input: RateProjectInput): Promise<any> {
    return this.service.voteProject(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Toggle follow project',
  })
  async toggleFollowProject(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string): Promise<any> {
    return this.service.toggleFollowProject(user.id, projectId);
  }
}
