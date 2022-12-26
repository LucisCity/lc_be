import { AppAuthUser } from '@libs/helper/decorator/current_user.decorator';
import { AppError, InvalidInput } from '@libs/helper/errors/base.error';
import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { ProjectCreateInputGql } from './project.dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private prisma: PrismaService) {}

  async uploadProject(input: ProjectCreateInputGql, user: AppAuthUser) {
    // Check timeline
    if (new Date(input.take_profit_at) <= new Date(input.open_sale_at)) {
      throw new InvalidInput('Take profit start time must greater than open for sale time');
    }
    // if (new Date(input.wait_transfer_at) <= new Date(input.take_profit_at)) {
    //   throw new InvalidInput('Take profit start time must greater than open for sale time');
    // }
    await this.prisma.project.create({
      data: input as any,
    });
    return true;
  }
}
