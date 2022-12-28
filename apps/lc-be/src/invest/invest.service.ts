import { PrismaService } from '@libs/prisma';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InvestService {
  private readonly logger = new Logger(InvestService.name);

  constructor(private prisma: PrismaService) {}

  getProject(id: string) {
    return this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });
  }
}
