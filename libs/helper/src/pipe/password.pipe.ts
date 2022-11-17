import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import PasswordValidator = require('password-validator');

// --- Create password validator schema
const schema = new PasswordValidator();
schema.is().min(8).is().max(32).has().letters().has().digits();

@Injectable()
export class IsStrongPassPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!schema.validate(value)) {
      throw new Error('Password invalid: length 8-32, exist letter and degits');
    }
    return value;
  }
}

@ValidatorConstraint({ name: 'IsStrongPass', async: false })
export class IsStrongPass implements ValidatorConstraintInterface {
  validate(text?: string) {
    if (!text) {
      return true
    }
    return schema.validate(text) === true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password invalid: length 8-32, exist letter and degits';
  }
}
