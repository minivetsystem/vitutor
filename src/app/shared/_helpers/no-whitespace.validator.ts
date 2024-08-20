import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import * as moment from 'moment';
import { of } from 'rxjs';
export const NoWhitespaceValidator = (
  control: AbstractControl
): ValidationErrors | null  => {
  const value: string = control.value || '';
  let validationFalse = false;
  // check empty value
  if (!value) {
    validationFalse = true;
  }

  // trim whitespace and check again for required value
  const trimed = value.trim();

  if (!trimed) {
    validationFalse = true;
  }

  if (validationFalse) {
    return { required: validationFalse };
  }

  return null;
};

export function MinimumAge(control: AbstractControl) {
  const date = moment(control.value).startOf('day');
  const now = moment().startOf('day');
  const yearsDiff = date.diff(now, 'years');
  const age = 18;

  if (age > -yearsDiff) {
    return of({ minimum_age: true });
  }

  return of(null);
}

export function phoneNumberValidator(control: AbstractControl) {
  const valid = /^\d+$/.test(control.value);
  return valid
    ? null
    : { invalidNumber: { valid: false, value: control.value } };
}
