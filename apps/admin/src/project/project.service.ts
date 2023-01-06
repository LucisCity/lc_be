import { AppError, BadRequestError, InvalidInput, NotFoundError } from '@libs/helper/errors/base.error';
import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { ProjectCreateInputGql } from './project.dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private prisma: PrismaService) {}

  async uploadProject(input: ProjectCreateInputGql) {
    // Check timeline
    if (new Date(input.take_profit_at) <= new Date(input.open_sale_at)) {
      throw new InvalidInput('Take profit start time must greater than open for sale time');
    }
    // check valid offer
    const offers = await this.prisma.projectOffer.findMany();
    const offerIds = offers.map((item) => item.id);
    if (input.profile?.create?.offers && input.profile.create.offers.length > 0) {
      if (offerIds.length === 0) {
        throw new NotFoundError('Offer not found');
      }
      if (input.profile.create.offers.some((v) => !offerIds.includes(v))) {
        throw new InvalidInput('Invalid offer');
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      input.profile.create.offers = input.profile.create.offers.join(',');
    }
    await this.prisma.project.create({
      data: input as any,
    });
    return true;
  }

  async finishProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    if (project.ended === true) {
      throw new BadRequestError('Project ended');
    }

    // send money bought nft back to user
    const histories = await this.prisma.projectSellVoteHistory.findMany({
      where: {
        project_id: projectId,
      },
    });
    await this.prisma.$transaction([
      ...histories.map((item) =>
        this.prisma.wallet.update({
          data: {
            balance: {
              increment: item.receive_amount,
            },
          },
          where: {
            user_id: item.user_id,
          },
        }),
      ),
      this.prisma.project.update({
        data: {
          ended: true,
        },
        where: {
          id: projectId,
        },
      }),
    ]);

    return true;
  }
}
