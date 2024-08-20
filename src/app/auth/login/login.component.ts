import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  AsyncRequestService
} from '../../core/services/async-request.service';
import {
  LocalStorageService,
  AlertService,
  UserService
} from '@app/shared/_services/index';
import {
  CookieService
} from 'ngx-cookie-service';
import {
  SocialAuthService
} from 'angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider
} from 'angularx-social-login';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: []
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loginURL = 'login';
  socialLoginUrl = 'social-login';
  private user: any;

  private loggedIn: boolean;
  resendVerifyEmail = 'resend-verify-email';
  response: any;
  emailNotVerified = false;
  returnUrl: any;
  NoSpace = false;
  timezone = '';
  passwordType = 'password';
  navigateTo;
  LoginWithGoogle = 'GOOGLE';
  LoginWithEmail = 'EMAIL';
  LoginWithFacebook = 'FACEBOOK';
  constructor(
    private authService: SocialAuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private asyncRequestService: AsyncRequestService,
    private notifierService: AlertService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private userService: UserService

  ) {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '';
  }

  signInWithSocial(type): void {
    let provider;
    if (type == this.LoginWithFacebook) {
      provider = FacebookLoginProvider.PROVIDER_ID;

    } else if (type == this.LoginWithGoogle) {
      provider = GoogleLoginProvider.PROVIDER_ID;
    }
    this.authService
      .signIn(provider)
      .then((userData) => {
        const email = userData.email.toLocaleLowerCase();
        let token;
        if (type == this.LoginWithFacebook) {
          token = userData.authToken;

        } else if (type == this.LoginWithGoogle) {
          token = userData.idToken;
        }

        this.asyncRequestService
          .postRequest(this.socialLoginUrl, {
            email,
            provider: provider,
            remember_me: 'false',
            authToken: token,
            data: userData,
          })
          .subscribe(
            (success) => {
              console.log(success)
              this.response = success;
              this.notifierService.success(this.response.success_message);
              // resetting form
              this.submitted = false;
              this.loginForm.reset();
              if (this.response.ref_id) {
                this.localStorageService.set('ref_id', this.response.ref_id);
                this.userService.getRefId(this.response.ref_id);
                
              }
              if (this.response.user ) {
              
                this.localStorageService.set("user", this.response.user);
                this.userService.getUserDetail(this.response.user);
                // this.localStorageService.remove("notificationClose");
                sessionStorage.setItem("loginUser", this.loginForm.value.email);
              }
               if (this.response.token) {
                this.localStorageService.set("token", this.response.token);
              }
              if (this.response.user.remember_me) {
                this.cookieService.set(
                  'remember_me',
                  this.response.user.remember_me,
                  120
                );
                this.cookieService.set('user', this.response.user);
              }

              if(this.response.user.timezone){
                this.localStorageService.setTimeZone(this.response.user.timezone);
              } else {
                this.localStorageService.setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
              }

              // if (this.returnUrl.trim() != "") {
              //   this.redirectAfterLogin();
              //   return false;
              // }


              
              if (this.response.user.role == 'tutor') {
                this.navigateTo = "/tutor/dashboard";
                if(this.response.user.firsttime_login){
                  this.navigateTo = "/tutor/tutor-profile";
                } 
              } else if (this.response.user.role == "student") {
                this.navigateTo = "/student/dashboard";
                if(this.response.user.firsttime_login){
                  this.navigateTo = " /student/student-profile";
                } 
              }
              // this.asyncRequestService
              //   .getRequest("tooltips")
              //   .subscribe((response) => {
              //     localStorage.setItem("tooltipData", JSON.stringify(response));
              //   });
              // setTimeout(() => {
              //   this.router.navigate([navigateTo]);
              // }, 1000);
              this.router.navigate([this.navigateTo]);
            },
            (errorResponse) => {
              // email not verified
              if (errorResponse.status == 403) {
                if (errorResponse.error.verification_id) {
                  this.localStorageService.set(
                    "verification_id",
                    errorResponse.error.verification_id
                  );
                }
                this.router.navigate(["verify-email"]);
                return;
              }
              if (errorResponse.error && errorResponse.error.error_message) {
                this.notifierService.error(errorResponse.error.error_message || 'Unable to login');
              }
            }
          );
      });
  }



  signOut(): void {
    // this.authService.signOut();
  }

  ngOnInit() {
    this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      remember_me: ['false'],
      provider: [null],
      // timezone: [this.timezone]
      timeZone: [null],
    });
    // this.authService.authState.subscribe((user) => {
    //   this.user = user;
    //   this.loggedIn = user != null;
    // });
    const checkUser = this.localStorageService.getRole();

    if (checkUser) {
      this.router.navigate([checkUser + '/dashboard']);
      // if (this.returnUrl.length > 0) {
      //   this.redirectAfterLogin();
      // } else {
      //   this.router.navigate([checkUser + '/dashboard']);
      // }
    }
  }

  /**
   * To render validations to html
   * handle client side validations
   * Function Name : renderErrors()
   * Date : 2019-07-26
   */
  get renderErrors() {
    return this.loginForm.controls;
  }

  /**
   * To submit login  request to server
   * handle client side validations
   * Function Name : onSubmit()
   * Date : 2019-07-26
   * @param loginForm FormGroup
   */
  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    // subscribe service
    this.loginForm.controls.timeZone.setValue(this.timezone);

    this.loginForm.controls.provider.setValue(this.LoginWithEmail);
    if (this.loginForm.controls.remember_me.value == null) {
      this.loginForm.controls.remember_me.setValue('false');
    }
    this.asyncRequestService
      .postRequest(this.loginURL, this.loginForm.value)
      .subscribe(
        (response) => {
          this.response = response;
          // resetting form
          if (this.response.user) {
            this.localStorageService.set('user', this.response.user);
            // this.localStorageService.remove("notificationClose");
            sessionStorage.setItem('loginUser', this.loginForm.value.email);
          }
          if (this.response.ref_id) {
            this.localStorageService.set('ref_id', this.response.ref_id);
            this.userService.getRefId(this.response.ref_id);
          }
          if(this.response.user.timezone){
            this.localStorageService.setTimeZone(this.response.user.timezone);
          }
         
          if (this.response.token) {
            this.localStorageService.set('token', this.response.token);
          }
          this.cookieService.set(
            'remember_me',
            this.response.user.remember_me,
            120
          );
          this.notifierService.success(this.response.success_message);
          // if (this.returnUrl.trim() != '') {
          //   this.redirectAfterLogin();
          //   return false;
          // }

          if (this.response.user.role == 'tutor') {
            this.navigateTo = "/tutor/dashboard";
            if(this.response.user.firsttime_login){
              this.navigateTo = "/tutor/tutor-profile";
            } 
          } else if (this.response.user.role == "student") {
            this.navigateTo = "/student/dashboard";
            if(this.response.user.firsttime_login){
              this.navigateTo = " /student/student-profile";
            } 
          }
          this.submitted = false;
          this.loginForm.reset();
          // this.notifierService.success(this.response.success_message);
          this.router.navigate([this.navigateTo]);
          // this.asyncRequestService
          //   .getRequest("tooltips")
          //   .subscribe((response) => {
          //     localStorage.setItem("tooltipData", JSON.stringify(response));
          //   });
          // setTimeout(() => {
          //   this.router.navigate([this.navigateTo]);
          // }, 1000);
        },
        (errorResponse) => {
          // email not verified
          if (errorResponse.status == 403) {
            if (errorResponse.error.verification_id) {
              this.localStorageService.set(
                'verification_id',
                errorResponse.error.verification_id
              );
            }
            this.notifierService.error(errorResponse.error.error_message);
            // this.router.navigate(['account-not-verified']);
            return;
          }
          if (errorResponse.error && errorResponse.error.error_message) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      );
  }

  Nospace(ev: any) {
    const k = ev.target.value.trim();
    if (k.split(' ')) {
      if (k[0] == ' ' && k.length >= 1) {
        return (this.NoSpace = true);
      } else {
        return (this.NoSpace = false);
      }
    } else {
      return (this.NoSpace = false);
    }
  }

  redirectAfterLogin() {
    this.router.navigateByUrl(this.returnUrl);
  }

  typePassword() {
    if (this.passwordType == 'password') {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }

  trimValue() {
    if (this.loginForm.controls.email.value) {
      this.loginForm.controls.email.setValue(
        this.loginForm.controls.email.value.trim()
      );
    }
  }

  openRegisterAsModel() {
    document.getElementById('registerAs').click();
  }

}
