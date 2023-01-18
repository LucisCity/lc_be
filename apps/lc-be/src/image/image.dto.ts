import { ObjectType } from '@nestjs/graphql';
import {
  MaxFileSizeValidator as DefaultMaxFileSizeValidator,
  FileTypeValidator as DefaultFileTypeValidator,
} from '@nestjs/common';

export class MaxFileSizeValidator extends DefaultMaxFileSizeValidator {
  isValid(fileOrFiles: Express.Multer.File | Express.Multer.File[]): boolean {
    if (Array.isArray(fileOrFiles)) {
      const files = fileOrFiles;
      return files.every((file) => super.isValid(file));
    }

    const file = fileOrFiles;
    return super.isValid(file);
  }
}

export class FileTypeValidator extends DefaultFileTypeValidator {
  isValid(fileOrFiles: Express.Multer.File | Express.Multer.File[]): boolean {
    if (Array.isArray(fileOrFiles)) {
      const files = fileOrFiles;
      return files.every((file) => super.isValid(file));
    }

    const file = fileOrFiles;
    return super.isValid(file);
  }
}

@ObjectType()
export class ImageDto {
  sizes: string;
}
