import { PrismaService } from '@libs/prisma';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PubsubService } from '@libs/pubsub';

const PROFIT_RATE = 0.1; // 10%

@Injectable()
export class UserJob {
  private readonly logger = new Logger(UserJob.name);

  constructor(
    private prisma: PrismaService,
    private pubsubService: PubsubService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async computeProfit() {
    const vipUsersList = await this.prisma.vipCard.findMany({
      include: {
        user: true,
        change_log: true,
      },
    });

    const now = Date.now();
    const aQuarter = 3 * 30 * 86400 * 1000;
    for (const vipCard of vipUsersList) {
      if (vipCard?.valid_from) {
        continue;
      }
      const validFrom = new Date(vipCard.valid_from).getTime();

      // not time to take profit
      if (validFrom > now) {
        continue;
      }

      if (now - validFrom < aQuarter) {
        continue;
      }
      const numberQuarterClaimed = vipCard.change_log.reduce((pre, current) => pre + current.number_quarter, 0);
      const numberQuarterWillClaim = Math.floor((now - validFrom) / aQuarter) - numberQuarterClaimed;
      // receipted profit
      if (numberQuarterWillClaim < 1) {
        continue;
      }

      const profitAQuarter = vipCard.card_value.mul(PROFIT_RATE).div(4);

      const userProfit = profitAQuarter.mul(numberQuarterWillClaim);

      await this.prisma.vipUserClaimProfitChangeLog.create({
        data: {
          number_quarter: numberQuarterWillClaim,
          card_id: vipCard.id,
          amount: userProfit,
        },
      });
    }
  }
}
