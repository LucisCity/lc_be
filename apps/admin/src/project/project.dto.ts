import { ProjectCreateInput } from '@libs/prisma/@generated/prisma-nestjs-graphql/project/project-create.input';
import { Field, InputType, Int, OmitType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, IsLatLong, MinDate } from 'class-validator';

@InputType()
export class ProjectCreateInputGql extends OmitType(ProjectCreateInput, [
  'enable',
  'ended',
  'id',
  'rate',
  'total_rate',
  'location',
  'open_sale_at',
  'take_profit_at',
  'wait_transfer_at',
  'medias',
  'offers',
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

  @Field(() => [ProjectMedia], { nullable: false })
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  medias!: ProjectMedia[];

  @Field(() => [ProjectOffer], { nullable: false })
  @ArrayMaxSize(20)
  offers!: ProjectOffer[];
}

@InputType()
export class ProjectMedia {
  @Field(() => Int, { nullable: false, description: 'Width of image' })
  width: number;
  @Field(() => Int, { nullable: false, description: 'Height of image' })
  height: number;
  @Field(() => String, { nullable: false, description: 'Media url' })
  url: string;
  @Field(() => String, { nullable: false, description: 'Thumbnail url' })
  thumbnail: string;
}

@InputType()
export class ProjectOffer {
  @Field(() => String, { nullable: false, description: 'Title' })
  title: string;
  @Field(() => String, { nullable: false, description: 'Icon' })
  icon: string;
}
