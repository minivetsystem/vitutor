import { FormGroup } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import * as moment from 'moment';

/**
 * @purpose custom validator to check that two fields match that must be same
 * @method MustMatch
 * @param control
 */
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}

export function checkTime2(controlName: string, matchingControlName: string) {
  return;
}

/**
 * @purpose custom validator to check that two fields match that not equal be same
 * @method MustMatch
 * @param control
 */
export function checkTime(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.checkTime) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    if (!control.value || !matchingControl.value) {
      return;
    }

    const start_Time = control.value.split(' ');
    const end_Time = matchingControl.value.split(' ');
    const startTime_hour = start_Time[0].split(':', 1);
    const startTime_minute = start_Time[0].split(':', 2);
    const startTime_M = start_Time[1];
    const endTime_hour = end_Time[0].split(':', 1);
    const endTime_M = end_Time[1];
    const endTime_minute = start_Time[0].split(':', 2);

    if (
      Number(startTime_hour[0]) == 12 &&
      startTime_M[0] == endTime_M[0] &&
      Number(endTime_hour[0]) < Number(startTime_hour[0])
    ) {
      matchingControl.setErrors(null);
    } else if (
      Number(startTime_hour[0]) < 12 &&
      Number(startTime_minute[1]) != Number(endTime_minute[1]) &&
      startTime_M[0] == endTime_M[0] &&
      Number(endTime_hour[0]) == Number(startTime_hour[0])
    ) {
      matchingControl.setErrors(null);
    } else if (
      Number(startTime_hour) <= 12 &&
      Number(endTime_hour) <= 12 &&
      startTime_M[0] != endTime_M[0]
    ) {
      const startTime = moment(control.value, 'h:mm:ss a');
      const endTime = moment(matchingControl.value, 'h:mm:ss a');
      const defaultTime = moment('12:00 am', 'h:mm:ss a');
      if (startTime.isAfter(defaultTime) && endTime.isBefore(startTime)) {
       matchingControl.setErrors({ checkTime: true });

      } else {
        matchingControl.setErrors(null);
      }
    } else {
      const startTime = moment(control.value, 'h:mm:ss a');
      const endTime = moment(matchingControl.value, 'h:mm:ss a');

      if (startTime.isBefore(endTime)) {
        matchingControl.setErrors(null);
      } else {
       matchingControl.setErrors({ checkTime: true });
      }
    }
  };
}


export function checkTimeForBooking(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors.checkTime) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    if (!control.value || !matchingControl.value) {
      return;
    }

    const start_Time = control.value.split(' ');
    const end_Time = matchingControl.value.split(' ');
    const startTime_hour = start_Time[0].split(':', 1);
    const startTime_minute = start_Time[0].split(':', 2);
    const startTime_M = start_Time[1];
    const endTime_hour = end_Time[0].split(':', 1);
    const endTime_M = end_Time[1];
    const endTime_minute = start_Time[0].split(':', 2);

    if (
      Number(startTime_hour[0]) == 12 &&
      startTime_M[0] == endTime_M[0] &&
      Number(endTime_hour[0]) < Number(startTime_hour[0])
    ) {
      matchingControl.setErrors(null);
    } else if (
      Number(startTime_hour[0]) < 12 &&
      Number(startTime_minute[1]) != Number(endTime_minute[1]) &&
      startTime_M[0] == endTime_M[0] &&
      Number(endTime_hour[0]) == Number(startTime_hour[0])
    ) {
      matchingControl.setErrors(null);
    } else if (
      Number(startTime_hour) <= 12 &&
      Number(endTime_hour) <= 12 &&
      startTime_M[0] != endTime_M[0]
    ) {

      const startTime = moment(control.value, 'h:mm:ss a');
      const endTime = moment(matchingControl.value, 'h:mm:ss a');
      const defaultTime = moment('12:00 am', 'h:mm:ss a');

      const startTimeFormat = startTime.format('a');
      const endtimeFormat = endTime.format('a');

      if (startTimeFormat == 'pm' && endtimeFormat == 'am') {
        matchingControl.setErrors(null);
      } else {
        if (startTime.isAfter(defaultTime) && endTime.isBefore(startTime)) {
          matchingControl.setErrors({ checkTime: true });
        } else {
          matchingControl.setErrors(null);
        }
      }
    } else {
      const startTime = moment(control.value, 'h:mm:ss a');
      const endTime = moment(matchingControl.value, 'h:mm:ss a');
      if (startTime.isBefore(endTime)) {
        matchingControl.setErrors(null);
      } else {
        matchingControl.setErrors({ checkTime: true });
      }
    }
  };
}

// function to contact hours and time
function convertTimeFormat(format, str) {
  const time = str;
  let hours = Number(time.match(/^(\d+)/)[1]);
  const minutes = Number(time.match(/:(\d+)/)[1]);
  const AM_PM = time.match(/\s(.*)$/)[1];
  if (AM_PM == 'PM' && hours <= 11) {
    hours = hours + 12;
  }
  if (AM_PM == 'AM' && hours == 12) {
    hours = hours;
  }
  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if (hours < 10) { sHours = '0' + sHours; }
  if (minutes < 10) { sMinutes = '0' + sMinutes; }
  return sHours + sMinutes;
}
/**
 * @purpose to render error message for password checks like required contain spacial character upper case etc
 * @method PasswordStrengthValidator
 * @param control
 */
export const PasswordStrengthValidator = function(
  control: AbstractControl
): ValidationErrors | null {
  const value: string = control.value || '';
  let validationFalse = false;
  let errors = '<ul>';
  if (!value) {
    validationFalse = true;
    errors += `<li>  Password should not be blank</li>`;
  }

  const upperCaseCharacters = /[A-Z]+/g;
  if (upperCaseCharacters.test(value) === false) {
    validationFalse = true;
    errors += `<li>  Password should contain upper case character</li>`;
  }

  const numberCharacters = /[0-9]+/g;
  if (numberCharacters.test(value) === false) {
    errors += `<li>  Password should contain number </li>`;
  }

  const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (specialCharacters.test(value) === false) {
    validationFalse = true;
    errors += `<li>  Password should contain  special character </li>`;
  }

  if (value.length < 8) {
    validationFalse = true;
    errors += `<li>  Password should be 8 characters long </li>`;
  }

  if (validationFalse) {
    errors += '</ul>';
    return { passwordStrength: errors };
  }

  return null;
};
