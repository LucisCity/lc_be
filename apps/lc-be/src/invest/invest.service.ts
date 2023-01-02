import { PrismaService } from '@libs/prisma';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_KEY } from './invest.config';
import { Cache } from 'cache-manager';
import { Prisma, ProjectOffer } from '@prisma/client';
import { ProjectFilter, RateProjectInput } from './invest.dto';
import { ExistDataError, InvalidInput, NotFoundError } from '@libs/helper/errors/base.error';
import { KMath } from '@libs/helper/math.helper';

@Injectable()
export class InvestService {
  private readonly logger = new Logger(InvestService.name);

  constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

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
      },
    });
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
            [follower.is_follow ? 'decrement' : 'increment']: 1,
          },
        },
      }),
    ]);
    return true;
  }
}
