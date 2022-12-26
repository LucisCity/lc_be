import { AclAction, CanAclGuard, UseAcls } from '@libs/helper/acl';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProjectCreateInputGql } from './project.dto';
import { ProjectService } from './project.service';

@Resolver()
export class ProjectResolver {
  constructor(private service: ProjectService) {}

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Create], subject: 'Project' })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Upload new project',
  })
  async uploadProject(@CurrentUser() user: AppAuthUser, @Args('input') input: ProjectCreateInputGql): Promise<any> {
    return this.service.uploadProject(input, user);
    return true;
  }
}
