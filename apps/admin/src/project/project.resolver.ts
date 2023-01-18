import { AclAction, CanAclGuard, UseAcls } from '@libs/helper/acl';
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
  async uploadProject(@Args('input') input: ProjectCreateInputGql): Promise<any> {
    return this.service.uploadProject(input);
  }

  @UseGuards(CanAclGuard)
  @UseAcls({ actions: [AclAction.Create], subject: 'Project' })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Finish project',
  })
  async finishProject(@Args('projectId') projectId: string): Promise<boolean> {
    return this.service.finishProject(projectId);
  }

  // @UseGuards(CanAclGuard)
  // @UseAcls({ actions: [AclAction.Create], subject: 'ProjectEvent' })
  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => Boolean, {
  //   nullable: true,
  //   description: 'Create project event',
  // })
  // async updateProjectEvent(
  //   @Args('input', { type: () => [ProjectEventCreateManyInputGql] }) input: [ProjectEventCreateManyInputGql],
  // ) {
  //   return this.service.updateProjectEvent(input);
  // }
}
