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
  NoWhitespaceValidator
} from "@app/shared/_helpers";

@Component({
  selector: 'app-verify-email1',
  templateUrl: './verify-email1.component.html',
  styleUrls: ['./verify-email1.component.scss']
})
export class VerifyEmail1Component implements OnInit {
  resendVerifyEmail = 'resend-verify-email';
  response: any;
  params: any;
  verifyParams;
  token;
  url = 'reset-password/';
  verifytoken = "verify-email";
  request_response = false;
  loginBtn = false;
  parameters: any;
  resentVerifyEmail: FormGroup;
  submitted: boolean = false;
  objectKeysCount = 1;
  notVerified = false;

  constructor(
    private router: Router,
    private asyncRequestService: AsyncRequestService,
    private notifierService: AlertService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.verifyParams = params;
        const emailToVerify = this.localStorageService.get('emailToVerify');
        if (emailToVerify) {
          this.params = JSON.parse(emailToVerify).trim();
        } else {
          this.router.navigate(['/verify-email', this.verifyParams]);
        }
      });
    this.fetchRouteParams(2);


  }
  /**
   * To resend verification mail request to server
   * handle client side validations
   * Function Name : resendEmail()
   * Date : 2019-07-26
   */
  resendEmail() {
    this.asyncRequestService
      .getRequest(this.resendVerifyEmail, {
        email: this.params
      })
      .subscribe(
        (data) => {
          if (data) {
            this.response = data;
            // this.notifierService.SwalSuccessAlert(
            //   this.response.success_message,
            //   2000
            // );
            this.notifierService.success(this.response.success_message);
            setTimeout(e => {
              this.router.navigate(['/login']);
            }, 5000);
          }
        },
        (errorResponse) => {
          this.notifierService.error(errorResponse.error.error_message);
        }
      );
  }
  fetchRouteParams(init: any) {
    this.route.queryParamMap.subscribe((params) => {
      this.token = {
        ...params.keys,
        ...params
      };
    });
    let params = this.token.params;
    this.parameters = this.token.params;
    this.objectKeysCount = Object.keys(params).length;
    this.verifyEmail(params);
  }

  /**
   * To send verify email request to server
   * handle client side validations
   * Function Name : verifyEmail()
   * Date : 2019-07-26
   */
  verifyEmail(params: any) {
    if (Object.keys(params).length > 1) {
      this.asyncRequestService
        .getRequest(`${this.verifytoken}`, params)
        .subscribe(
          (response: any) => {
            this.response = response;
            this.loginBtn = this.response.login;
            this.request_response = true;
            this.notifierService.success(this.response.message);
            this.localStorageService.clearUserData();
            setTimeout(e=> {
              this.notVerified = true;
            }, 1000);
           
          },
          (errorResponse) => {
            if (errorResponse.status === 404) {
              this.router.navigate(['page-not-found']);
              return;
            }

            if (errorResponse) {
              this.response = errorResponse.error;
              this.request_response = true;
              this.notifierService.error(errorResponse.message);
            }
          }
        );
    }
  }

}
