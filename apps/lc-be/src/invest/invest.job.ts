import { PrismaService } from '@libs/prisma';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, Project } from '@prisma/client';
import { PubsubService } from '@libs/pubsub';
import { INVEST_SUBSCRIPTION_KEY } from './invest.config';

const PROFIT_RATE = 0.1; // 10%

@Injectable()
export class InvestJob {
  private readonly logger = new Logger(InvestJob.name);

  constructor(
    private prisma: PrismaService,
    private pubsubService: PubsubService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async computeProfit() {
    // get all project
    const result = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where: {
          ended: false,
          take_profit_at: {
            lt: new Date(),
          },
        },
      }),
      this.prisma.projectNftBought.findMany({
        where: {
          project_ended: false,
        },
      }),
    ]);
    const projects = result[0];
    if (!projects || projects.length == 0) {
      return;
    }
    // get all user bought nft of project
    const nftBoughts = result[1];

    const projectById: { [key: string]: Project } = {};
    const currentDate = new Date();
    const now = currentDate.getTime();
    const MS_IN_DAY = 1000 * 24 * 60 * 60;

    for (let item of projects) {
      if (item.start_time_vote_sell != null && currentDate >= item.start_time_vote_sell) {
        // not allow take profit
        continue;
      }
      // get duration (exp: 1, 2)

      const profitDays = (now - item.take_profit_at.getTime()) / MS_IN_DAY;
      // compute period index: 1, 2, 3
      const profitPeriod = profitDays / item.profit_period;
      // check in new period: last: 1 -> 2.3 >= last + 1
      if (profitPeriod - item.profit_period_index < 1) {
        continue;
      }

      // save profit period index to save later to prevent duplicate handle
      const profitPeriodIndex = Math.floor(profitPeriod);
      item.profit_period_index = profitPeriodIndex;
      projectById[item.id] = item;
    }
    const projectKeyValids = Object.keys(projectById);
    if (projectKeyValids.length === 0) {
      this.logger.verbose('Compute profit: not exist project valid');
      return;
    }

    const profitBalanceInputs: Prisma.ProjectProfitBalanceUpsertArgs[] = [];
    const profitBalanceChangeLogInputs: Prisma.ProjectProfitBalanceChangeLogCreateArgs[] = [];

    for (let item of nftBoughts) {
      const project = projectById[item.project_id];
      if (!project) {
        // project can not compute profit
        continue;
      }
      const profitAmount = item.currency_amount.mul(PROFIT_RATE).toNumber();
      if (profitAmount <= 0) {
        continue;
      }
      // prepare data to create log, update amount
      const endPeriodDate = new Date(
        project.take_profit_at.getTime() + project.profit_period_index * project.profit_period * MS_IN_DAY,
      );
      profitBalanceInputs.push({
        create: {
          project_id: item.project_id,
          user_id: item.user_id,
          balance: profitAmount,
          from: project.take_profit_at,
          to: endPeriodDate,
        },
        update: {
          balance: {
            increment: profitAmount,
          },
          to: endPeriodDate,
        },
        where: {
          user_id_project_id: {
            project_id: item.project_id,
            user_id: item.user_id,
          },
        },
      });
      profitBalanceChangeLogInputs.push({
        data: {
          project_id: item.project_id,
          user_id: item.user_id,
          amount: profitAmount,
          period_index: project.profit_period_index,
        },
      });
    }
    this.logger.verbose(`Compute profit in previous period in project ${Object.keys(projectById).join(', ')}`);
    const txResults = await this.prisma.$transaction([
      ...profitBalanceInputs.map((item) => this.prisma.projectProfitBalance.upsert(item)),
      ...profitBalanceChangeLogInputs.map((item) => this.prisma.projectProfitBalanceChangeLog.create(item)),
      ...Object.values(projectById).map((item) =>
        this.prisma.project.update({
          where: {
            id: item.id,
          },
          data: {
            profit_period_index: item.profit_period_index,
          },
        }),
      ),
    ]);

    // public to client
    for (let item of profitBalanceInputs) {
      this.pubsubService.pubSub.publish(INVEST_SUBSCRIPTION_KEY.profitBalanceChange, {
        [INVEST_SUBSCRIPTION_KEY.profitBalanceChange]: item.create,
      });
    }
  }
}
