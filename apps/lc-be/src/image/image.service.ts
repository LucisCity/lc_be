import { Injectable } from '@nestjs/common';
import { S3Service } from '@libs/helper/s3.service';
import { randId } from '@libs/helper/string.helper';

@Injectable()
export class ImageService {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service(
      process.env.S3_BUCKET,
      process.env.S3_ACCESS_KEY,
      process.env.S3_SECRET,
      process.env.S3_REGION,
    );
  }

  async uploadImageToS3(image: Express.Multer.File) {
    const filePath = image.originalname + '_' + randId(10);
    return await this.s3Service.upload(filePath, image.buffer, image.mimetype);
  }
}
