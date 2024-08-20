import { Component, OnInit, HostListener, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import {
  MustMatch,
  PasswordStrengthValidator,
} from '@app/shared/_helpers/password-must-match';
import { AlertService, LocalStorageService } from '@app/shared/_services/index';
import {
  BsModalService,
  BsModalRef,
  ModalDirective,
} from 'ngx-bootstrap/modal';
import {
  NoWhitespaceValidator,
  ScrollToTargetService,
} from '@app/shared/_helpers/index';
import Swal from 'sweetalert2';
import { constantVariables } from '@app/shared/_constants/constants';
import { SocialAuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @ViewChild('navTutor', {static: true}) navTutor: ElementRef;
  @ViewChild('navStudent', {static: true}) navStudent: ElementRef;
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  role = 'tutor';
  stu_password: any = false;
  stu_confirm_password: any = false;
  studentRegisterForm: FormGroup;
  password: any = false;
  confirm_password: any = false;
  tutorRegisterForm: FormGroup;
  submitted: boolean = false;
  submittedTutor : boolean = false;
  submittedStudent: boolean = false;
  register_url: string = 'student/register';
  tutor_register_url: string = 'tutor/register';
  loginURL: string = 'social-login';

  response: any;
  model: any = {};
  private user: any;
  private loggedIn: boolean;
  termAndConditionResponse: any;
  term_and_condition_url: string = 'terms-and-conditions';
  privacy_policy_url: string = 'privacy-policy';

  term_and_condition = false;
  term_and_condition_message: String;
  NoSpace: boolean = false;
  isSocialLoginRequest = false;
  roleTutor = 2;
  roleStudent = 1;
  socialLoginFacebook = 'facebook';
  socialLoginGoogle = 'google';
  terms_privacy_conditions : boolean = false;
  terms_privacy_conditions_err: boolean = false;
  timeZoneListArray = [];


  constructor(
    private authService: SocialAuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private asyncRequestService: AsyncRequestService,
    private localStorageService: LocalStorageService,
    private notifierService: AlertService,
    private modalService: BsModalService,
    private scrollToTargetService: ScrollToTargetService,
    private route: ActivatedRoute
  ) {
    this.studentRegisterForm = this.formBuilder.group(
      {
        first_name: [
          null,
          [
            Validators.required,
            NoWhitespaceValidator,
            Validators.maxLength(50),
          ],
        ],
        last_name: [
          null,
          [
            Validators.required,
            NoWhitespaceValidator,
            Validators.maxLength(50),
          ],
        ],
        email: [null, [Validators.required, Validators.email]],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            PasswordStrengthValidator,
          ],
        ],
        confirm_password: [null, Validators.required],
        role_id: [1],
        provider: ['EMAIL'],
        acceptTerms: [true],
        timezone:['',[Validators.required]]
      },
      {
        validator: MustMatch('password', 'confirm_password'),
      }
    );
    this.tutorRegisterForm = this.formBuilder.group(
      {
        first_name: [
          null,
          [
            Validators.required,
            NoWhitespaceValidator,
            Validators.maxLength(50),
          ],
        ],
        last_name: [
          null,
          [
            Validators.required,
            NoWhitespaceValidator,
            Validators.maxLength(50),
          ],
        ],
        email: [null, [Validators.required, Validators.email]],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            PasswordStrengthValidator,
          ],
        ],
        confirm_password: [null, Validators.required],
        acceptTerms: [true],
        role: [4],
        provider: ['EMAIL'],
        timezone:['',[Validators.required]]
      },
      {
        validator: MustMatch('password', 'confirm_password'),
      }
    );
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.role = params.role;
        if (this.role === 'student') {
          this.navStudent.nativeElement.click();
        } else {
          this.navTutor.nativeElement.click();
        }
      }
     
    );
    let timeZones = moment.tz.names();
    let offsetTmz=[];
    for(var i in timeZones)
    {
      offsetTmz.push({"name":"(GMT"+moment.tz(timeZones[i]).format('Z')+")" + timeZones[i] , value : timeZones[i]});
    }
    this.timeZoneListArray = offsetTmz;
    this.studentRegisterForm.patchValue({timezone : Intl.DateTimeFormat().resolvedOptions().timeZone});
    this.tutorRegisterForm.patchValue({timezone: Intl.DateTimeFormat().resolvedOptions().timeZone});
    this.studentRegisterForm.updateValueAndValidity();
    this.tutorRegisterForm.updateValueAndValidity();
    // if you need to force user to read term and condtion uncomment below line and also uncomment from html template
    // this.registerForm.controls.acceptTerms.disable();
  }

  get renderErrors() {
    return this.tutorRegisterForm.controls;
  }

  get studentRenderErrors() {
    return this.studentRegisterForm.controls;
  }

  onSubmit() {
    this.submittedTutor = true;

    if (this.tutorRegisterForm.invalid) {
      return;
    }
    if(!this.terms_privacy_conditions){
      this.notifierService.error("Please accept to Vitutor's terms and conditions");
      return;
    }

    this.asyncRequestService
      .postRequest(this.tutor_register_url, this.tutorRegisterForm.value)
      .subscribe(
        (response) => {
          this.response = response;
          this.notifierService.success(this.response.success_message);
          // resetting form
          this.submittedTutor = false;

          this.localStorageService.set(
            'emailToVerify',
            this.tutorRegisterForm.value.email
          );
  
  
        localStorage.setItem("timezone",JSON.stringify(this.tutorRegisterForm.value.timezone));

          this.tutorRegisterForm.reset();
          // this.router.navigate(['/verify-your-account']);
          setTimeout(() => {
            // this.router.navigate(['/verify-your-account']);
            this.router.navigate(['/verify-email']);
          }, 1000);
        },
        (errorResponse) => {
          if (errorResponse) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      );
  }
  formSubmit() {
    this.submittedStudent = true;

    if (this.studentRegisterForm.invalid) {
      return;
    }
    if(!this.terms_privacy_conditions){
      this.notifierService.error('Please accept terms and conditions');
      return;
    }

    this.asyncRequestService
      .postRequest(this.register_url, this.studentRegisterForm.value)
      .subscribe(
        (response) => {
          this.response = response;
          this.notifierService.success(this.response.success_message);
          // resetting form
          this.submittedStudent = false;

          this.localStorageService.set(
            'emailToVerify',
            this.studentRegisterForm.value.email
          );

          this.studentRegisterForm.reset();
          setTimeout(() => {
            // this.router.navigate(['/verify-your-account']);
            this.router.navigate(['/verify-email']);
          }, 1000);
        },
        (errorResponse) => {
          if (errorResponse) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      );
  }

  Nospace(ev) {
    var k = ev.target.value;
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

  /**
   * @purpose send request to server and show term and condition pop up
   * @param model
   */
  termConditionModalRef: BsModalRef;

  readAgreeWithOurTermAndPrivacy(template: TemplateRef<any>, type: string) {
    let getContentURL = '';
    if (type == 'term-condition') {
      getContentURL = this.term_and_condition_url;
    } else {
      getContentURL = this.privacy_policy_url;
    }

    this.asyncRequestService.getRequest(getContentURL).subscribe(
      (response) => {
        this.termAndConditionResponse = response;
        if (!this.term_and_condition) {
          this.notifierService.destroy();
          this.term_and_condition = true;
          this.tutorRegisterForm.controls.acceptTerms.enable();
        }
        this.termConditionModalRef = this.modalService.show(
          template,
          Object.assign(
            { backdrop: true, ignoreBackdropClick: true },
            {
              class: 'gray modal-lg',
            }
          )
        );
      },
      (errorResponse: any) => {
        if (errorResponse) {
          this.notifierService.error(errorResponse.error.error_message);
        }
      }
    );
  }

  /**
   * Function to fire alert for read terms and condition
   * only fires when user click on LABEL tag
   * */
  clickTermAndCondtion(event) {
    if (this.term_and_condition == false && event.target.nodeName == 'LABEL') {
      this.term_and_condition_message =
        'Please click on Terms and Conditions link first.';
    }
  }

  // Sweetalert on the register button
  registerBtnswal() {
    if (this.tutorRegisterForm.invalid) {
      return;
    }
    // else if (this.term_and_condition == false) {
    //   this.term_and_condition_message =
    //     'You must accept Terms and Conditions first.';
    // }
    else {
      Swal.fire({
        title: 'Registration',
        text:
          `We have sent an email to verify your email account. Please check your inbox and follow the instruction to verify your account. If you don't find the email in inbox, please check spam folder too.`,
        type: 'info',
        customClass: this.swalInfoOption,
        confirmButtonText: 'Confirm',
        showCancelButton: true,
        focusCancel: false,
      }).then((result) => {
        if (result.value) {
          this.onSubmit();
        }
      });
    }
  }

  trimValue() {
    if (this.tutorRegisterForm['controls']['email'].value) {
      this.tutorRegisterForm['controls']['email'].setValue(
        this.tutorRegisterForm['controls']['email'].value.trim()
      );
    }
  }
  stutrimValue() {
    if (this.studentRegisterForm['controls']['email'].value) {
      this.studentRegisterForm['controls']['email'].setValue(
        this.studentRegisterForm['controls']['email'].value.trim()
      );
    }
  }

  /**
   * @purpose scroll to social icons
   * @method scrollToSocial
   * @param event
   */
  isAcceptedTermAndConditions = false;
  acceptTheTermAndConditions(event: any) {
    this.isAcceptedTermAndConditions != this.isAcceptedTermAndConditions;
  }

  /**
   * @purpose to register with social google and facebook account
   * @method signInSocialLogin
   *
   */
  signInSocialLogin(type,role): void {
    let url;
    let provider;
    // here we need to ask term and conditions
    // this.isSocialLoginRequest = true;
    // if (!this.isAcceptedTermAndConditions) {
    //   return;
    // }
    if(role== this.roleStudent){
      url = this.register_url;
    }else if(role==this.roleTutor){
      url = this.tutor_register_url;
    }

    if(type==this.socialLoginFacebook){
      provider = FacebookLoginProvider.PROVIDER_ID;

    }else if(type==this.socialLoginGoogle){
      provider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.authService
      .signIn(provider)
      .then((userData) => {
        const email = userData.email.toLocaleLowerCase();
        this.asyncRequestService
          .postRequest(url, {
            provider: userData.provider,
           // photo: userData.photoUrl,
            first_name: userData.firstName,
            last_name:userData.lastName,
            email: email,
            password: userData.id,
            confirm_password: userData.id,
            acceptTerms: true,
          })
          .subscribe(
            (response) => {
              let token;
              if(type==this.socialLoginFacebook){
                token = userData.authToken;
          
              }else if(type==this.socialLoginGoogle){
                token = userData.idToken;
              }

              // this.isSocialLoginRequest = false;
              // this.isAcceptedTermAndConditions = false;
              // this.modalRef.hide();
              this.signOut();
              this.loginWithGoogle({
                email: userData.email.toLocaleLowerCase(),
                provider: userData.provider,
                remember_me: false,
                authToken: token,
                data: userData,
              });
            },
            (errorResponse) => {
              if (errorResponse) {
                this.notifierService.error(errorResponse.error.error_message);
                this.signOut();
                // this.isSocialLoginRequest = false;
                // this.isAcceptedTermAndConditions = false;
                // this.modalRef.hide();
              }
            }
          );

      });
  }

  signOut(): void {

    // this.authService.signOut();
  }

  LoginWithGoogle = 'GOOGLE';
  LoginWithEmail = 'EMAIL';
  loginWithGoogle(postData: any) {
    this.asyncRequestService.postRequest(this.loginURL, postData).subscribe(
      (response) => {
        this.response = response;
        this.notifierService.success(this.response.success_message);
        // resetting form
        this.submitted = false;
        if (this.response.user) {
          this.localStorageService.set('user', this.response.user);
          // this.localStorageService.remove('notificationClose');
          sessionStorage.setItem('loginUser', postData.email);
        }
        if (this.response.token) {
          this.localStorageService.set('token', this.response.token);
        }
        if (this.response.user.role == 'tutor') {
          var navigateTo = '/tutor/dashboard';
        }
        if (this.response.user.role == 'student') {
          var navigateTo = '/student/dashboard';
        }
        setTimeout(() => {
          this.router.navigate([navigateTo]);
        }, 1000);
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
          this.router.navigate(['account-not-verified']);
          return;
        }
        if (errorResponse) {
          this.notifierService.error(errorResponse.error.error_message);
        }
      }
    );
  }

  modalRef: BsModalRef;
  acceptTermAndConditions(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign(
        { backdrop: true, ignoreBackdropClick: true },
        {
          class: 'gray modal-lg modal_register accept_term_and_condition_modal',
        }
      )
    );
  }

}
