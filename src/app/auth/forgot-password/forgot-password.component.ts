import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AsyncRequestService } from "../../../app/core/services/async-request.service";
import { AlertService, LocalStorageService } from '../../shared/_services';
import { NotifierService } from 'angular-notifier';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotEmail: FormGroup;
  submitted = false;
  url = 'password/email';

  private readonly notifier: NotifierService;
  response: any;
  emailNotVerified = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private asyncRequestService: AsyncRequestService,
    private notifierService: AlertService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.forgotEmail = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
    });
  }

  /**
   * To check validations and render to html
   * handle client side validations
   * Function Name : f()
   * Date : 2019-07-23
   * @param forgotEmail FormGroup
   */
  get f() {
    return this.forgotEmail.controls;
  }

  /**
   * To submit forgot passwor request to server
   * handle client side validations
   * Function Name : onSubmit()
   * Date : 2019-07-23
   * @param forgotEmail FormGroup
   */
  onSubmit() {
    this.submitted = true;

    if (this.forgotEmail.invalid) {
      return;
    }

    this.asyncRequestService
      .postRequest(this.url, this.forgotEmail.value)
      .subscribe(
        (response) => {
          this.response = response;

          // resetting form
          if (this.response.success) {
            this.notifierService.success(this.response.success_message);
          } else {
            this.notifierService.error(this.response.error_message);
          }
          this.submitted = false;
          this.forgotEmail.reset();
          this.router.navigate(['login']);
        },
        (errorResponse) => {
          if (errorResponse) {
            // email not verified
            if (errorResponse.status == 403) {
              this.emailNotVerified = true;
              this.notifierService.error(errorResponse.error.error_message);
              return;
            }
            if (errorResponse.status == 400) {
              this.notifierService.error(errorResponse.error.error_message);}
          }
        }
      );
  }

  trimValue() {
    if (this.forgotEmail.controls.email.value) {
      this.forgotEmail.controls.email.setValue(
        this.forgotEmail.controls.email.value.trim()
      );
    }
  }
}
