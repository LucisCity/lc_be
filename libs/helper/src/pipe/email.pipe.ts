import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class EmailPipe implements PipeTransform {
  transform(email: any, metadata: ArgumentMetadata) {
    Joi.assert(email, Joi.string().email(), new Error('Email invalid'));
    return email;
  }
}
