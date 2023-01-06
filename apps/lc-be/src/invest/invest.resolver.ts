import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { ProjectNftBought } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-nft-bought/project-nft-bought.model';
import { ProjectProfitBalance } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-profit-balance/project-profit-balance.model';
import { PubsubService } from '@libs/pubsub';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { INVEST_SUBSCRIPTION_KEY } from './invest.config';
import { InvestedProjectGql, ProjectFilter, ProjectGql, RateProjectInput } from './invest.dto';
import { InvestService } from './invest.service';

@Resolver()
export class InvestResolver {
  constructor(private service: InvestService, private pubsubService: PubsubService) {}

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
  @Query(() => ProjectProfitBalance, {
    description: 'Get profit balance',
    nullable: true,
  })
  async getProfitBalance(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string) {
    return this.service.getProfitBalance(user.id, projectId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => ProjectNftBought, {
    description: 'Get nft bought of user',
    nullable: true,
  })
  async getNftBought(@CurrentUser() user: AppAuthUser, @Args('projectId') projectId: string) {
    return this.service.getNftBought(user.id, projectId);
  }

  // @Query(() => Boolean, {
  //   description: 'Test compute profit',
  //   nullable: true,
  // })
  // async computeProfit() {
  //   // await this.job.computeProfit();
  //   this.pubsubService.pubSub.publish(INVEST_SUBSCRIPTION_KEY.profitBalanceChange, {
  //     profitBalanceChange: {
  //       user_id: 'clasiqhjt0000o0pwb4mc5yhf',
  //       project_id: 'clcavhniw0000qalfi1sn8738',
  //       balance: 30,
  //       from: new Date(),
  //       to: new Date(),
  //       created_at: new Date(),
  //       updated_at: new Date(),
  //     },
  //   });
  //   return true;
  // }

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
