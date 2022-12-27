import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ImageDto } from './image.dto';

const TEN_MB = 10000000;

@Controller('image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    // @Body() imageDto: ImageDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: TEN_MB,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
  ) {
    // const sizes = imageDto.sizes;
    // if (sizes) {
    //   //TODO: import service resize image here!!!
    //   /**
    //    * eg: {image_sm, image_md, ...}  = this.resizeService.resizeImage(sizes);
    //    */
    //   return true;
    // }
    await this.imageService.uploadImageToS3(image);
    return true;
  }
}
