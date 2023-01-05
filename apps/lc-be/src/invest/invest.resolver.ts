import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { ProjectProfitBalance } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-profit-balance/project-profit-balance.model';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InvestedProjectGql, ProjectFilter, ProjectGql, RateProjectInput } from './invest.dto';
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

  @UseGuards(GqlAuthGuard)
  @Query(() => [InvestedProjectGql], {
    description: 'get list of projects user has invested',
  })
  async investedProjects(@CurrentUser() user: AppAuthUser) {
    return await this.service.investedProjects(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ProjectGql], {
    description: 'get list of projects user is following',
  })
  async followingProjects(@CurrentUser() user: AppAuthUser) {
    return await this.service.followingProjects(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ProjectGql], {
    description: 'get list of projects to recommend to user',
  })
  async recommendedProjects(@CurrentUser() user: AppAuthUser) {
    return await this.service.recommendedProjects(user.id);
  }

  @Query(() => [ProjectGql], {
    description: 'get list of hot projects',
  })
  async hotProjects() {
    return await this.service.hotProjects();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ProjectProfitBalance], {
    description: 'Get profit balance',
  })
  async getProfitBalance(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string) {
    return this.service.getProfitBalance(user.id, projectId);
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Claim project profit',
  })
  async claimProjectProfit(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string): Promise<any> {
    return this.service.claimProjectProfit(user.id, projectId);
  }
}
