import {
  Controller,
  HttpStatus,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Post,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { FileTypeValidator, MaxFileSizeValidator } from './image.dto';
import { GqlAuthGuard } from '@libs/helper/guards/auth.guard';
import { AppAuthUser, CurrentUser } from '@libs/helper/decorator/current_user.decorator';

const MAX_SIZE = 5000000;

@Controller('api')
@UseGuards(GqlAuthGuard)
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('upload_kyc')
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

  @Post('upload_avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    // @Body() imageDto: ImageDto,
    @CurrentUser() user: AppAuthUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /image\/(jpg|jpeg|png|gif)/,
        })
        .addMaxSizeValidator({
          maxSize: MAX_SIZE,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    // const sizes = imageDto.sizes;
    // if (sizes) {
    //   //TODO: import service resize image here!!!
    //   /**
    //    * eg: {image_sm, image_md, ...}  = this.resizeService.resizeImage(sizes);
    //    */
    //   return true;
    // }
    return await this.imageService.uploadAvatar(user.id, file);
  }
}
