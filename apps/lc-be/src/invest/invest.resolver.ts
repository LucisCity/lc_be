import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { ProjectNftOwner } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-nft-owner/project-nft-owner.model';
import { ProjectProfitBalance } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-profit-balance/project-profit-balance.model';
import { PubsubService } from '@libs/pubsub';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { INVEST_SUBSCRIPTION_KEY } from './invest.config';
import { InvestedProjectGql, ProjectFilter, ProjectGql, ProjectNftOwnerGql, RateProjectInput } from './invest.dto';
import { InvestJob } from './invest.job';
import { InvestService } from './invest.service';

@Resolver()
export class InvestResolver {
  constructor(private service: InvestService, private pubsubService: PubsubService, private job: InvestJob) {}

  @Query(() => ProjectGql, {
    description: 'Get list referral user',
  })
  async getProject(@Args('id') id: string) {
    return await this.service.getProject(id);
  }

  @Query(() => [ProjectGql], {
    description: 'Get related project',
  })
  async getProjects(
    @Args('filter', { type: () => ProjectFilter, nullable: true }) filter: ProjectFilter,
    @Args('search', { nullable: true }) search: string,
  ) {
    return await this.service.getProjects(filter, search);
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
  @Query(() => ProjectProfitBalance, {
    description: 'Get profit balance',
    nullable: true,
  })
  async getProfitBalance(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string) {
    return this.service.getProfitBalance(user.id, projectId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => ProjectNftOwner, {
    description: 'Get nft bought of user',
    nullable: true,
  })
  async getNftBought(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string) {
    return this.service.getNftBought(user.id, projectId);
  }

  @Query(() => [ProjectNftOwnerGql], {
    description: 'Get nft bought of user',
    nullable: true,
  })
  async getInvestor(@Args('projectId') projectId: string) {
    return this.service.getInvestor(projectId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [ProjectNftOwnerGql], {
    description: 'Get profit rate',
    nullable: true,
  })
  async getProfitRate(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string) {
    return this.service.getProfitRate(user.id, projectId);
  }

  @Query(() => Boolean, {
    description: 'Test compute profit',
    nullable: true,
  })
  async computeProfit() {
    await this.job.computeProfit();
    return true;
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
  async toggleFollowProject(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string): Promise<boolean> {
    return this.service.toggleFollowProject(user.id, projectId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean, {
    nullable: true,
    description: 'get user following project state',
  })
  async isFollowingProject(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string): Promise<boolean> {
    return this.service.isFollowingProject(user.id, projectId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Claim project profit',
  })
  async claimProjectProfit(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string): Promise<any> {
    return this.service.claimProjectProfit(user.id, projectId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Vote sell project',
  })
  async voteSellProject(
    @CurrentUser() user: AppAuthUser,
    @Args('projectId') projectId: string,
    @Args('isSell') isSell: boolean,
  ): Promise<boolean> {
    return this.service.voteSellProject(user.id, projectId, isSell);
  }

  // Subscription
  @Subscription(() => ProjectProfitBalance, {
    name: INVEST_SUBSCRIPTION_KEY.profitBalanceChange,
    filter: (payload, variables, context) => {
      if (!context.user) {
        return null;
      }
      return (
        payload.profitBalanceChange.user_id == context.user.id &&
        payload.profitBalanceChange.project_id == variables.projectId
      );
    },
    nullable: true,
  })
  profitBalanceChange(@Args('projectId') projectId: String) {
    return this.pubsubService.pubSub.asyncIterator(INVEST_SUBSCRIPTION_KEY.profitBalanceChange);
  }
}
