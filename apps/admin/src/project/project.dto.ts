import { ProjectProfileCreateNestedOneWithoutProjectInput } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-profile/project-profile-create-nested-one-without-project.input';
import { ProjectProfileCreateWithoutProjectInput } from '@libs/prisma/@generated/prisma-nestjs-graphql/project-profile/project-profile-create-without-project.input';
import { ProjectCreateInput } from '@libs/prisma/@generated/prisma-nestjs-graphql/project/project-create.input';
import { Field, InputType, Int, OmitType } from '@nestjs/graphql';
import { IsLatLong, MinDate } from 'class-validator';

@InputType()
export class ProjectMedia {
  @Field(() => Int, { nullable: false, description: 'Width of image' })
  width: number;
  @Field(() => Int, { nullable: false, description: 'Height of image' })
  height: number;
  @Field(() => String, { nullable: false, description: 'Media url' })
  url: string;
  @Field(() => String, { nullable: true, description: 'Thumbnail url' })
  thumbnail: string;
}

@InputType()
export class ProjectOffer {
  @Field(() => String, { nullable: false, description: 'Title' })
  title: string;
  @Field(() => String, { nullable: false, description: 'Icon' })
  icon: string;
}

@InputType()
export class ProjectEvent {
  @Field(() => Date, { nullable: false, description: 'Event start time' })
  start_at: Date;
  @Field(() => String, { nullable: false, description: 'Event title' })
  title: string;
  @Field(() => String, { nullable: false, description: 'Event description' })
  description: string;
}

@InputType()
export class ProjectProfileCreateWithoutProjectInputGql extends OmitType(ProjectProfileCreateWithoutProjectInput, [
  'created_at',
  'updated_at',
  'events',
  'medias',
  'vote',
  'total_vote',
  'follows',
  'offers',
]) {
  @Field(() => [ProjectMedia], { nullable: false })
  medias!: ProjectMedia[];

  @Field(() => [Int], { nullable: false })
  offers!: number[];

  @Field(() => [ProjectEvent], { nullable: false })
  events!: ProjectEvent[];
}

@InputType()
export class ProjectProfileCreateInputGql extends OmitType(ProjectProfileCreateNestedOneWithoutProjectInput, [
  'connect',
  'connectOrCreate',
  'create',
]) {
  @Field(() => ProjectProfileCreateWithoutProjectInputGql, { nullable: true })
  // @Type(() => ProjectProfileCreateWithoutProjectInputGql)
  create: ProjectProfileCreateWithoutProjectInputGql;
}

@InputType()
export class ProjectCreateInputGql extends OmitType(ProjectCreateInput, [
  'enable',
  'ended',
  'id',
  'location',
  'open_sale_at',
  'take_profit_at',
  'start_time_vote_sell',
  'end_time_vote_sell',
  'profile',
]) {
  @Field(() => String, { nullable: false })
  @IsLatLong()
  location: string;

  @Field(() => Date, { nullable: false })
  @MinDate(new Date())
  open_sale_at!: string;

  @Field(() => Date, { nullable: false })
  @MinDate(new Date())
  take_profit_at!: string;

  @Field(() => ProjectProfileCreateInputGql, { nullable: false })
  profile: ProjectProfileCreateInputGql;

  @Field(() => String, { nullable: true })
  contract_address: string;

  // @Field(() => [ProjectMedia], { nullable: false })
  // @ArrayMinSize(5)
  // @ArrayMaxSize(5)
  // medias!: ProjectMedia[];

  // @Field(() => [ProjectOffer], { nullable: false })
  // @ArrayMaxSize(20)
  // offers!: ProjectOffer[];
}
