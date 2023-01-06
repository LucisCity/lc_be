import { ProjectProfile } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-profile/project-profile.model';
import { Project } from '@libs/prisma/@generated/prisma-nestjs-graphql/project/project.model';
import { Field, Float, InputType, Int, ObjectType, OmitType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';
import { registerEnumType } from '@nestjs/graphql';
import { ProjectType } from '@libs/prisma/@generated/prisma-nestjs-graphql/prisma/project-type.enum';
@ObjectType()
export class ProjectMediaGql {
  @Field(() => Int, { nullable: false, description: 'Width of image' })
  width: number;
  @Field(() => Int, { nullable: false, description: 'Height of image' })
  height: number;
  @Field(() => String, { nullable: false, description: 'Media url' })
  url: string;
  @Field(() => String, { nullable: true, description: 'Thumbnail url' })
  thumbnail: string;
}

@ObjectType()
export class ProjectOfferGql {
  @Field(() => String, { nullable: false, description: 'Title' })
  title: string;
  @Field(() => String, { nullable: false, description: 'Icon' })
  icon: string;
}

@ObjectType()
export class ProjectEventGql {
  @Field(() => String, { nullable: false, description: 'Event start time' })
  start_at: string;
  @Field(() => String, { nullable: false, description: 'Event title' })
  title: string;
  @Field(() => String, { nullable: false, description: 'Event description' })
  description: string;
}

@ObjectType()
export abstract class ProjectProfileGql extends OmitType(ProjectProfile, [
  'created_at',
  'project',
  'updated_at',
  'events',
  'offers',
  'medias',
]) {
  @Field(() => [ProjectEventGql], { nullable: true, description: '' })
  events: ProjectEventGql[];

  @Field(() => [ProjectOfferGql], { nullable: true, description: '' })
  offers: ProjectOfferGql[];

  @Field(() => [ProjectMediaGql], { nullable: true, description: '' })
  medias: ProjectMediaGql[];
}

@ObjectType()
export abstract class ProjectGql extends OmitType(Project, ['created_at', 'enable', 'updated_at', 'profile']) {
  @Field(() => ProjectProfileGql, { nullable: false, description: '' })
  profile: ProjectProfileGql;
}

@InputType()
export class RateProjectInput {
  @Field(() => String, { nullable: false })
  projectId: string;

  @Field(() => Float, { nullable: false })
  @Min(1)
  @Max(10)
  value: number;
}

@InputType()
export class ProjectFilter {
  @Field(() => ProjectType, { nullable: true })
  type: ProjectType;
}

export enum InvestErrorCode {
  INVALID_TIME_VOTE_SELL = 'INVALID_TIME_VOTE_SELL',
  NOT_ENOUGHT_NFT = 'NOT_ENOUGHT_NFT',
  SELL_VOTED = 'SELL_VOTED',
}

registerEnumType(InvestErrorCode, { name: 'InvestErrorCode', description: undefined });
