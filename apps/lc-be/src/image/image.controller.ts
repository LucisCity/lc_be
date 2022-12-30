import { Controller, ParseFilePipe, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { FileTypeValidator, MaxFileSizeValidator } from './image.dto';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';

const MAX_SIZE = 5000000;

@Controller('upload')
@UseGuards(GqlAuthGuard)
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('kyc')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadKycImages(
    // @Body() imageDto: ImageDto,
    @CurrentUser() user: AppAuthUser,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png|gif)/ }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    // const sizes = imageDto.sizes;
    // if (sizes) {
    //   //TODO: import service resize image here!!!
    //   /**
    //    * eg: {image_sm, image_md, ...}  = this.resizeService.resizeImage(sizes);
    //    */
    //   return true;
    // }
    await this.imageService.uploadKycImages(user.id, files);
    return true;
  }
}
