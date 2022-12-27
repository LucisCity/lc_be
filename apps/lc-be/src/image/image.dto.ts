import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImageDto {
  sizes: string;
}
