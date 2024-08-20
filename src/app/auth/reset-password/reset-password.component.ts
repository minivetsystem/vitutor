// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-reset-password',
//   templateUrl: './reset-password.component.html',
//   styleUrls: ['./reset-password.component.scss']
// })
// export class ResetPasswordComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }
import {
  Component,
  OnInit,
  ViewEncapsulation
} from "@angular/core";
import {
  AsyncRequestService
} from "@app/core/services/async-request.service";
import {
  Router,
  ActivatedRoute
} from "@angular/router";
import {
  AlertService,
  LocalStorageService
} from "@app/shared/_services/index";
import {
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";
import {
  MustMatch,
  NoWhitespaceValidator, PasswordStrengthValidator
} from "@app/shared/_helpers";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resendVerifyEmail = 'resend-verify-email';
  response: any;
  params: any;
  verifyParams = {};
  token;
  url = 'reset-password/';
  verifytoken = 'verify-token';
  request_response = false;
  loginBtn = false;
  parameters: any;
  resetForm: FormGroup;
  submitted: boolean = false;
  objectKeysCount = 1;
  notVerified = true;
  password: any = false;
  confirm_password: any = false;
  linkExpire = false;

  constructor(
    private router: Router,
    private asyncRequestService: AsyncRequestService,
    private notifierService: AlertService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {this.initResetForm();}
    initResetForm() {
      this.resetForm = this.fb.group({
        password: ['', [Validators.required, PasswordStrengthValidator, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]]
      }, {
        validator: MustMatch('password', 'confirm_password'),
      });
    }
  ngOnInit() {
    this.fetchRouteParams(2);

  }
  /**
   * To resend verification mail request to server
   * handle client side validations
   * Function Name : resendEmail()
   * Date : 2019-07-26
   */
  get renderErrors() {
    return this.resetForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.asyncRequestService.postRequest(this.url + this.token, this.resetForm.value)
      .subscribe(
        response => {
          this.response = response;
          this.notifierService.success(this.response.success_message);
          setTimeout( () => {
            this.router.navigate(['login']);
          }, 2000);
          // resetting form
          this.submitted = false;
          this.resetForm.reset();
        },
        errorResponse => {
          if (errorResponse) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      );

  }

  fetchRouteParams(init: any) {
    this.route.params.subscribe((params) => {
      this.token = params.token;
      this.verifyEmail(params);
    });

  }

  /**
   * To send verify email request to server
   * handle client side validations
   * Function Name : verifyEmail()
   * Date : 2019-07-26
   */
  verifyEmail(params: any) {
      this.asyncRequestService
        .getRequest(`${this.verifytoken}/${params.token}`)
        .subscribe(
          (response: any) => {
            this.response = response;
            this.loginBtn = this.response.login;
            this.request_response = true;
            this.notifierService.success(this.response.message);
          },
          (errorResponse) => {
            this.linkExpire = true;
            if (errorResponse.status === 404) {
              this.router.navigate(['page-not-found']);
              return;
            }

            if (errorResponse) {
              this.response = errorResponse.error;
              this.request_response = true;
              this.notifierService.error(this.response.error_message
              );
            }
          }
        );
  }

}

