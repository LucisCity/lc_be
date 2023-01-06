import { randString } from '@libs/helper/string.helper';
import { PrismaModule, PrismaService } from '@libs/prisma';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { InvestJob } from './invest.job';
import { InvestService } from './invest.service';

describe('InvestService', () => {
  let service: InvestJob;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestService],
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({ isGlobal: true, ttl: 5 * 60 }),
        ScheduleModule.forRoot(),
        PrismaModule,
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
    }).compile();

    service = module.get<InvestJob>(InvestJob);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('Compute profit sucess', async () => {
    const receiveProfitDae = new Date();
    const startDate = new Date(receiveProfitDae.setHours(-90 * 24 - 1));
    // create user and project nft bought
    const result = await prisma.$transaction([
      prisma.user.create({
        data: {
          ref_code: randString(6),
        },
      }),
      prisma.project.create({
        data: {
          address: '',
          location: '',
          open_sale_at: startDate,
          policy_link: '',
          price: 1000000,
          take_profit_at: startDate,
          thumbnail: '',
          title: 'test project',
          enable: true,
        },
      }),
    ]);
    const user = result[0];
    const project = result[1];

    const nftBought = await prisma.projectNftOwner.create({
      data: {
        project_id: project.id,
        user_id: user.id,
        total_nft: 1,
        currency_amount: 100,
        project_ended: false,
      },
    });
    await service.computeProfit();
    await prisma.$transaction([
      prisma.projectNftOwner.delete({
        where: {
          project_id_user_id: {
            project_id: nftBought.project_id,
            user_id: nftBought.user_id,
          },
        },
      }),
      prisma.project.delete({
        where: {
          id: project.id,
        },
      }),
      prisma.user.delete({
        where: {
          id: user.id,
        },
      }),
    ]);
  });
});
