import { PrismaService } from '@libs/prisma';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, Project } from '@prisma/client';

const PROFIT_RATE = 0.1; // 10%

@Injectable()
export class InvestJob {
  private readonly logger = new Logger(InvestJob.name);

  constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async computeProfit() {
    // get all project
    const projects = await this.prisma.project.findMany({
      where: {
        ended: false,
        take_profit_at: {
          lt: new Date(),
        },
      },
    });
    if (!projects || projects.length == 0) {
      return;
    }
    // get all user bought nft of project
    const nftBoughts = await this.prisma.projectNftBought.findMany({
      where: {
        project_ended: false,
      },
    });
    const projectById: { [key: string]: Project } = {};
    const now = new Date().getTime();

    for (let item of projects) {
      // get duration (exp: 1, 2)
      const profitDays = (now - item.take_profit_at.getTime()) / (1000 * 24 * 60 * 60);
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

    const profitBalanceInputs: Prisma.ProjectProfitBalanceUpsertArgs[] = [];
    const profitBalanceChangeLogInputs: Prisma.ProjectProfitBalanceChangeLogCreateArgs[] = [];

    for (let item of nftBoughts) {
      if (!projectById[item.project_id]) {
        // project can not compute profit
        continue;
      }
      const profitAmount = item.currency_amount.mul(PROFIT_RATE).toNumber();
      // prepare data to create log, update amount
      profitBalanceInputs.push({
        create: {
          project_id: item.project_id,
          user_id: item.user_id,
          balance: profitAmount,
        },
        update: {
          balance: {
            increment: profitAmount,
          },
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
          period_index: projectById[item.project_id].profit_period_index,
        },
      });
    }
    this.logger.log(`Compute profit in previous period in project ${Object.keys(projectById).join(', ')}`);

    await this.prisma.$transaction([
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
  }
}
