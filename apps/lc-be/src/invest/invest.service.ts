import { PrismaService } from '@libs/prisma';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_KEY, INVEST_SUBSCRIPTION_KEY } from './invest.config';
import { Cache } from 'cache-manager';
import { Prisma, ProjectOffer } from '@prisma/client';
import {
  AppError,
  BadRequestError,
  InvalidInput,
  NotEnoughBalance,
  NotFoundError,
} from '@libs/helper/errors/base.error';
import { InvestedProjectGql, InvestErrorCode, ProjectFilter, ProjectGql, RateProjectInput } from './invest.dto';
import { KMath } from '@libs/helper/math.helper';
import { PubsubService } from '@libs/pubsub';
@Injectable()
export class InvestService {
  private readonly logger = new Logger(InvestService.name);

  constructor(
    private prisma: PrismaService,
    private pubsubService: PubsubService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getProject(id: string) {
    // get cache
    let offers = (await this.cacheManager.get(CACHE_KEY.offers)) as ProjectOffer[];
    if (!offers) {
      offers = await this.prisma.projectOffer.findMany();
      this.cacheManager.set(CACHE_KEY.offers, offers);
    }

    const result = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
        contract: true,
      },
    });

    if (!result) {
      throw new AppError('project not found!', 'PROJECT_NOT_FOUND');
    }
    // compute offer object
    if (result.profile.offers?.length > 0) {
      const profileOffers = result.profile.offers.split(',').map(Number);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      result.profile.offers = offers.filter((item) => profileOffers.includes(item.id));
    }

    return result;
  }

  async getProjects(filter: ProjectFilter) {
    const where: Prisma.ProjectWhereInput = {};
    if (filter.type) {
      where.type = filter.type;
    }
    const result = await this.prisma.project.findMany({
      where,
      include: {
        profile: true,
        contract: true,
      },
      take: 20,
    });
    return result;
  }

  async isVoted(userId: string, projectId: string) {
    const voter = await this.prisma.projectVoter.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });
    return voter != null;
  }

  async voteProject(userId: string, input: RateProjectInput) {
    // check value valid
    if ((input.value * 10) % 5 !== 0) {
      throw new InvalidInput('Vote value invalid');
    }
    try {
      const projectProfile = await this.prisma.projectProfile.findUnique({
        where: {
          project_id: input.projectId,
        },
      });
      if (!projectProfile) {
        throw new NotFoundError('Project not found');
      }

      await this.prisma.$transaction([
        this.prisma.projectVoter.create({
          data: {
            project_id: input.projectId,
            user_id: userId,
            is_voted: true,
            value: input.value,
          },
        }),
        this.prisma.projectProfile.update({
          where: {
            project_id: input.projectId,
          },
          data: {
            total_vote: {
              increment: 1,
            },
            vote: KMath.plus(projectProfile.vote?.toNumber() ?? 0, input.value)
              .div(2)
              .toNumber(),
          },
        }),
      ]);
    } catch (err) {
      console.log('typeof err: ', JSON.stringify(err.message));
      this.logger.error(err);
      // throw new ExistDataError('You voted');
    }
    return true;
  }

  async toggleFollowProject(userId: string, projectId: string) {
    const follower = await this.prisma.projectFollower.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });

    await this.prisma.$transaction([
      !follower
        ? this.prisma.projectFollower.create({
            data: {
              is_follow: true,
              project_id: projectId,
              user_id: userId,
            },
          })
        : this.prisma.projectFollower.update({
            data: {
              is_follow: !follower.is_follow,
            },
            where: {
              project_id_user_id: {
                project_id: projectId,
                user_id: userId,
              },
            },
          }),
      this.prisma.projectProfile.update({
        where: {
          project_id: projectId,
        },
        data: {
          follows: {
            [follower?.is_follow ? 'decrement' : 'increment']: 1,
          },
        },
      }),
    ]);
    return true;
  }

  async investedProjects(userId: string) {
    return await this.prisma.$transaction(async (prisma) => {
      const nftBought = await prisma.projectNftOwner.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          project_id: 'asc',
        },
      });
      if (nftBought.length > 0) {
        const investedProjectIds = nftBought.map((i) => i.project_id);
        const profitBalance = await prisma.projectProfitBalance.findMany({
          where: {
            project_id: {
              in: investedProjectIds,
            },
          },
          select: {
            balance: true,
          },
          orderBy: {
            project_id: 'asc',
          },
        });
        const projects = await prisma.project.findMany({
          where: {
            id: {
              in: investedProjectIds,
            },
          },
          include: {
            profile: true,
          },
          orderBy: {
            id: 'asc',
          },
        });
        return projects.map((i, idx) => ({
          ...i,
          profit_balance: { ...profitBalance[idx] },
          nft_bought: { ...nftBought[idx] },
        }));
      }
      return [];
    });
  }

  async followingProjects(userId: string) {
    return await this.prisma.$transaction(async (prisma) => {
      const followingProjectIds = await prisma.projectFollower.findMany({
        where: {
          user_id: userId,
          is_follow: true,
        },
      });
      if (followingProjectIds.length > 0) {
        return await prisma.project.findMany({
          where: {
            id: {
              in: followingProjectIds.map((i) => i.project_id),
            },
          },
          include: {
            profile: true,
          },
        });
      }
      return [];
    });
  }

  async recommendedProjects(userId: string) {
    const followingProjects = await this.followingProjects(userId);
    if (followingProjects.length > 0) {
      const followingProjectIds = [];
      const followingProjectTypes = [];
      followingProjects.forEach((i) => {
        followingProjectIds.push(i.id);
        followingProjectTypes.push(i.type);
      });
      return await this.prisma.project.findMany({
        where: {
          id: {
            notIn: followingProjectIds,
          },
          type: {
            in: followingProjectTypes,
          },
        },
        include: {
          profile: true,
        },
      });
    }
    return [];
  }

  async hotProjects() {
    return await this.prisma.project.findMany({
      orderBy: {
        profile: {
          follows: 'desc',
        },
      },
      include: {
        profile: true,
      },
      take: 20,
    });
  }

  async getProfitBalance(userId: string, projectId: string) {
    return this.prisma.projectProfitBalance.findUnique({
      where: {
        user_id_project_id: {
          user_id: userId,
          project_id: projectId,
        },
      },
    });
  }

  async claimProjectProfit(userId: string, projectId: string) {
    const balance = await this.prisma.projectProfitBalance.findUnique({
      where: {
        user_id_project_id: {
          user_id: userId,
          project_id: projectId,
        },
      },
    });
    if (!balance || balance.balance.lte(0)) {
      throw new NotEnoughBalance('Not enough balance to claim');
    }
    // create log, update balance
    const result = await this.prisma.$transaction([
      this.prisma.projectProfitBalanceChangeLog.create({
        data: {
          amount: -balance.balance,
          project_id: projectId,
          user_id: userId,
        },
      }),
      this.prisma.projectProfitBalance.update({
        data: {
          balance: {
            decrement: balance.balance,
          },
        },
        where: {
          user_id_project_id: {
            project_id: projectId,
            user_id: userId,
          },
        },
      }),
    ]);
    this.pubsubService.pubSub.publish(INVEST_SUBSCRIPTION_KEY.profitBalanceChange, {
      [INVEST_SUBSCRIPTION_KEY.profitBalanceChange]: result[1],
    });
    return true;
  }

  async voteSellProject(userId: string, projectId: string, isSell: boolean) {
    const result = await this.prisma.$transaction([
      this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
      }),
      this.prisma.projectNftOwner.findUnique({
        where: {
          project_id_user_id: {
            project_id: projectId,
            user_id: userId,
          },
        },
      }),
    ]);
    const project = result[0];
    const nftBought = result[1];
    const now = new Date();

    if (!project || !nftBought) {
      throw new BadRequestError('Bad request');
    }
    if (
      !project.start_time_vote_sell ||
      !project.end_time_vote_sell ||
      now < project.start_time_vote_sell ||
      now > project.end_time_vote_sell
    ) {
      throw new AppError(InvestErrorCode.INVALID_TIME_VOTE_SELL, "Can't vote now");
    }
    if (nftBought.total_nft < 1) {
      throw new AppError(InvestErrorCode.NOT_ENOUGHT_NFT, "Can't vote now");
    }
    if (!nftBought.is_sell_voted) {
      throw new AppError(InvestErrorCode.SELL_VOTED, "Can't vote now");
    }

    const receiveAmount = project.nft_price.mul(nftBought.total_nft).toNumber();
    await this.prisma.$transaction([
      this.prisma.projectNftOwner.update({
        where: {
          project_id_user_id: {
            project_id: projectId,
            user_id: userId,
          },
        },
        data: {
          is_sell_voted: true,
        },
      }),
      this.prisma.projectSellVoteHistory.create({
        data: {
          is_sell: isSell,
          project_id: projectId,
          user_id: userId,
          receive_amount: receiveAmount,
        },
      }),
    ]);
    return true;
  }

  async getNftBought(userId: string, projectId: string) {
    return this.prisma.projectNftOwner.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });
  }
}
