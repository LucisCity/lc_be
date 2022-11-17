import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isURL,
  isPhoneNumber,
  IsPostalCode,
  isPostalCode,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsUrl', async: false })
export class IsUrlInput implements ValidatorConstraintInterface {
  validate(value: { set?: string } | string, args: ValidationArguments) {
    if (!value) {
      return true;
    }
    if (typeof value === 'string') {
      return isURL(value);
    }
    if (!value.set) {
      return true;
    }
    return isURL(value.set);
  }

  defaultMessage(args: ValidationArguments) {
    return args.property + ' not valid url';
  }
}

@ValidatorConstraint({ name: 'IsPhoneInput', async: false })
export class IsPhoneInput implements ValidatorConstraintInterface {
  validate(value: { set?: string }, args: ValidationArguments) {
    if (!value || value.set === '' || !value.set) {
      return true;
    }
    return isPhoneNumber(value.set);
  }

  defaultMessage(args: ValidationArguments) {
    return args.property + ' not valid phone';
  }
}

@ValidatorConstraint({ name: 'IsValidateUrlInput', async: false })
export class IsValidateUrlInput implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value || value.length == 0) return true;
    return isURL(value);
  }

  defaultMessage(args: ValidationArguments) {
    return args.property + ' not valid url';
  }
}
@ValidatorConstraint({ name: 'isPostalCodeByCountryCode', async: false })
class IsPostalCodeByCountryCode implements ValidatorConstraintInterface {
  validate(zip: string, args: ValidationArguments) {
    if (!zip || zip.length == 0) return false;
    // @ts-ignore
    return isPostalCode(zip, args.object.countryCode);
  }

  defaultMessage(args: ValidationArguments) {
    // @ts-ignore
    return `Invalid zip "${args.object.zip}" for country "${args.object.countryCode}"`;
  }
}
