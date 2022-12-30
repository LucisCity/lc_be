import { Injectable } from '@nestjs/common';
import { S3Service, S3UploadParams, S3UploadReturnObject } from '@libs/helper/s3.service';
import { randId } from '@libs/helper/string.helper';
import { AppError } from '@libs/helper/errors/base.error';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@libs/prisma';
import { UserKycVerification } from '@libs/prisma/@generated/prisma-nestjs-graphql/user-kyc-verification/user-kyc-verification.model';

@Injectable()
export class ImageService {
  private s3Service: S3Service;

  constructor(private prisma: PrismaService) {
    this.s3Service = new S3Service(
      process.env.S3_BUCKET,
      process.env.S3_ACCESS_KEY,
      process.env.S3_SECRET,
      process.env.S3_REGION,
    );
  }

  async uploadKycImages(userId: string, files: Array<Express.Multer.File>) {
    const existedKyc = await this.prisma.userKycVerification.findFirst({
      where: {
        user_id: userId,
        status: {
          not: 'FAILED',
        },
      },
    });
    if (existedKyc) {
      throw new AppError('Kyc is being processed or has succeed', 'KYC_PENDING_OR_SUCCEED');
    }
    // throw new AppError('Test Server Error', 'TEST_SERVER_ERROR');
    // console.log(`upload files image service ${files}`);
    if (files.length !== 3) {
      throw new AppError('Kyc images must be exactly 3', 'BAD_REQUEST');
    }
    // files.forEach((i) => {
    //   console.log(`file fieldName ${i.fieldname}`);
    // });
    const params: S3UploadParams[] = files.map((i) => ({
      fieldName: i.fieldname,
      filePath: i.originalname + '_' + randId(10),
      fileContent: i.buffer,
      contentType: i.mimetype,
    }));
    const returnedPromises: S3UploadReturnObject[] = await this.s3Service.uploadMultiple(params);
    await this.prisma.userKycVerification.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        front_id: returnedPromises.find((i) => i.label === 'front_id').url,
        back_id: returnedPromises.find((i) => i.label === 'back_id').url,
        holding_id: returnedPromises.find((i) => i.label === 'holding_id').url,
      },
    });
  }
}
