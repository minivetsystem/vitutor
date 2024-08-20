import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TutorService } from '../tutor.service';
import { Router } from '@angular/router';
import { AlertService , LocalStorageService } from '@app/shared/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MustMatch,
  PasswordStrengthValidator,
} from "@app/shared/_helpers/password-must-match";
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
// import { constantVariables } from '@app/shared/_constants/constants';
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import {BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {constantVariables} from '@app/shared/_constants/constants'
// import {StripDetailComponent} from '../../shared/_components/strip-detail/strip-detail.component'
declare var window: any;
declare var $: any;


@Component({
  selector: 'app-account-settings1',
  templateUrl: './account-settings1.component.html',
  styleUrls: ['./account-settings1.component.scss']
})
export class AccountSettings1Component implements OnInit {

  savedCards;
  password;
  newPassword = '';
  matchPasswordErr = false;
  loading = false;
  changePassForm: FormGroup;
  bankAccountForm: FormGroup;
  pricing;
  tutorProfile;
  bankAccountList;
  connectedPaypal = false;
  countriesList: any;
  validCountry:boolean = true;
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  paypalEmailForm: FormGroup;
  paypalAccountEmail={email:null, is_default: false};
  paypalEmailErr:string;
  paymentModeDefault: FormGroup;
  attachmentTypeFrontError: boolean = false;
  attachmentsizeLimitFrontError: boolean = false;
  attachmentTypeBackError: boolean = false;
  attachmentsizeLimitBackError: boolean = false;
  attachmentFileFront: File
  attachmentFileBack: File
  attachmentForm: FormGroup;
  menuToggle;
  result:any ={result : {profile_completed: true}}
  stripModal : BsModalRef;
  userdata;
  accountErr:any = {eventually_due : []}
  formTypeData = constantVariables.FORM_TYPE;
  formType;
  isStripeConnectRegistered: boolean =  false;
  constructor(private tutor$: TutorService,
              private router: Router,
              private notifierService: AlertService,
              private formBuilder: FormBuilder,
              private commonService: CommonService,
              private async: AsyncRequestService,
              private localStorageService: LocalStorageService,
              private modalService: BsModalService ) { 
                this.changePasswordForm(); 
                this.initBankAccountForm(); 
                this.paypalEmail();
                this.paymetMode();
                this.initDocumentsForm();  // To send documents in case of stripe add bank verification
                this.getProfileStatus();
              }

              getProfileStatus(){
                this.async.getRequest(`profile/check-profile-status`).subscribe(res => {
                  this.result = res;
                 }, err => {
                   // this.router.navigate(['/']);
                   // return false;
                 });
              }

  ngOnInit() {
    if ((localStorage.getItem('paypal'))){
      this.connectedPaypal = true;
    }
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.getPaypalEmail();
    this.getCountriesList();
   this.getBankAccount();
   this.getProfile();
   const paypal = window.location.href.split('?')[1]
   if (paypal){
     paypal.token = paypal.code;
     this.tutor$.addPaypalToken(paypal).subscribe((res:any)=> {
      localStorage.setItem('paypal', JSON.stringify(paypal));
     this.connectedPaypal = true;
     }, err => {
       this.notifierService.error('Unable to login into Paypal');
     });
     
   }
  }

  paypalLogout() {
    localStorage.removeItem('paypal');
    this.connectedPaypal = false;
  }

  getCountriesList(){
    this.tutor$.getCountries().subscribe((res:any)=>{
      this.countriesList = res;
    })
  }
  paypalEmail() {
    this.paypalEmailForm = this.formBuilder.group({
      paypal_email : [null, [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)]]
    });
  }
  paymetMode() {
    this.paymentModeDefault = this.formBuilder.group({
      mode : ['Stripe', [Validators.required]]
    });
  }
  changePasswordForm() {
    this.changePassForm = this.formBuilder.group({
      old_password : [null, [Validators.required]],
      new_password : [null, [Validators.required, Validators.minLength(8), PasswordStrengthValidator]],
      confirm_password : [null, [Validators.required, Validators.minLength(8), PasswordStrengthValidator]]
    }, {
      validator: MustMatch('new_password', 'confirm_password')
    });
  }


  initBankAccountForm() {
    this.bankAccountForm = this.formBuilder.group({
      account_holder_name : [null, [Validators.required]],
      bank_account_number : [null, [Validators.required, Validators.pattern(`^[0-9]{0,16}$`)]],
      re_account_number: [null, [Validators.required, Validators.pattern(`^[0-9]{0,16}$`)]],
      routing_number : [null, [Validators.required, Validators.pattern(`^[0-9]{6,15}$`)]],
      currency :[''],
      country : ['US', [Validators.required]],
      account_holder_type: ['individual', [Validators.required]],
      is_primary: [0]
      
    }, {
      validator: MustMatch('bank_account_number', 're_account_number'),
    });
  }
  resetBankForm(){
    this.bankAccountForm.setValue({
      account_holder_name: '',
      bank_account_number: '',
      re_account_number: '',
      routing_number: '',
      currency: '',
      country : 'US',
      account_holder_type: 'individual',
      is_primary : 0
    })
  }

  initDocumentsForm() {
    this.attachmentForm = this.formBuilder.group({
      identity_front: [null, [Validators.required]],
      identity_back: [null, [Validators.required]],
      id:[null]
    });
  }
  get form() {
    return this.changePassForm.controls;
  }
 
  get bankDetail() {
    return this.bankAccountForm.controls;
  }
  changePassword() {
    if (this.changePassForm.invalid) {
      this.notifierService.error('Change password is incorrect');
      return;
    }

    this.tutor$.updatePassword(this.changePassForm.value).subscribe((res: any) => {
      if (res.success) {
        this.changePassForm.reset();
        this.notifierService.success(res.success_message);
        this.localStorageService.clearUserData();
        // setTimeout(() => {
        //   // this.location.back();
        //   this.router.navigate(['logout']);
        // }, 1000);
        
      } else {
        this.notifierService.error(res.error_message);
      }
    }, err => {
      this.notifierService.error('Unable to change password');
    });

  }

  passwordMatch() {
    if (this.form.new_password.value == this.form.confirm_password.value) {
      this.matchPasswordErr = false;
    } else {
    this.matchPasswordErr = true;
    }
  }

  setPricing() {
    if (this.pricing === '') {
      return;
    }

    this.tutor$.updateProfile({hourly_rate: this.pricing}).subscribe((res: any) => {
      this.notifierService.success('Hourly price has been updated successfully');
    }, err => {
      this.notifierService.error(err.error_message);
    });
  }

    getProfile() {
      this.tutor$.getStudentProfile().subscribe((res: any) => {
        this.tutorProfile = res.data;
        if (this.tutorProfile.hourly_rate) {
          this.pricing = this.tutorProfile.hourly_rate;
        }
      });
    }

    paypalConnect() {
      const redirectURL = window.encodeURIComponent(window.location.href.split('?')[0]);
      const client_id = environment.client_id;
      window.open(`https://www.sandbox.paypal.com/connect/?flowEntry=static&client_id=${client_id}&response_type=code&scope=openid&redirect_uri=${redirectURL}`);
    }

    addBankDetails() {
      if (this.bankAccountForm.invalid) {
        this.bankAccountForm.markAllAsTouched();
        return;
      } 
      if(!this.validCountry) {
        return;
      }
      if ( this.bankDetail.bank_account_number.value !== this.bankDetail.re_account_number.value) {
        this.notifierService.error('Re-enter Account number is incorrect');
        return;
      }
      this.tutor$.addBankAccount(this.bankAccountForm.value).subscribe((res: any) => {
        // this.notifierService.success(res.success_message);
        if(res.success){
          this.getBankAccount();
          $('#bankModal').modal('hide');
         
          // this.showAttachmentModal(res.data.id); //To show upload documents modal
          this.resetBankForm();
          this.notifierService.success(res.success_message || 'Successfully added Bank');
        } else {
          this.notifierService.error(res.success_message || res.error_message);
        }
        
      }, err => {
        this.notifierService.error(err.error.error_message);
      });
    }

    getBankAccount() {
      this.tutor$.getBankAccount().subscribe((res: any) => {
        this.accountErr = res.check_capability
        this.bankAccountList = res.data.data;
        this.isStripeConnectRegistered = res.is_connect_created 
        this.getProfileStatus();
      }, err => {
        this.bankAccountList = [];
      });
    }

    uploadDocument(){
      this.attachmentForm.markAllAsTouched();
      if(this.attachmentForm.invalid){
        return;
      }
      if(this.attachmentTypeBackError || this.attachmentTypeFrontError|| this.attachmentsizeLimitBackError || this.attachmentsizeLimitFrontError){
        return;
      }
      let attachments = new FormData();
      attachments.append('front_screen', this.attachmentFileFront);
      attachments.append('back_screen', this.attachmentFileFront);
      attachments.append('id', this.attachmentForm.get('id').value);
      this.tutor$.uploadBankDocuments(attachments).subscribe((res:any)=> {
        if(res.success){
          this.notifierService.success(res.success_message)
          this.hideAttachmentModal();
          this.attachmentForm.reset();
          this.getBankAccount();
        } else {
          this.notifierService.error(res.success_message || res.error_message);
        }
      }, err => this.notifierService.error(err.error.error_message)
      )
    }

    showAttachmentModal(id){
      this.attachmentForm.patchValue({id: id});
      this.attachmentForm.updateValueAndValidity();
      $('#documentModal').modal('show');
      
    }
    hideAttachmentModal(){
      $('#documentModal').modal('hide');
    }

    deleteBank(id, lastFour) {

      Swal.fire({
        title: 'Delete?',
        text: 'You want to remove the bank ending with ' + lastFour,
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.value) {
          this.tutor$.removeBankAccount(id).subscribe((res: any) => {
            if (res.success_message) {
              this.getBankAccount();
              Swal.fire(
                'Deleted!',
                res.success_message,
                'success'
              );
            }else if(!res.success_message) {
              Swal.fire(
                'Error',
                res.error_message,
                'error'
              );
            }
          }, err => {
            Swal.fire(
              'Error',
              err.error.error_message,
              'error'
            );
          });
        }
      });
    }

    makeAccountPrimary(account) {
      this.tutor$.makePrimary(account.id).subscribe((res: any) => {
          this.notifierService.success(res.success_message);
          this.getBankAccount();
          // this.paypalAccountEmail['is_default'] = false;
          // this.paymentModeDefault.patchValue({mode: 'Stripe'});
          // this.paymentModeDefault.updateValueAndValidity();
      }, err => {
        this.notifierService.error(err.error.error_message);
      });
    }

    validateCountry(event){
      let country = event.target.value;
      let body = {
        "country_code": country
      };
      this.tutor$.stripeValidCountry(body).subscribe((res:any)=> {
        this.validCountry = true;
      }, err => {
        this.validCountry = false;
      });
    }

    paypalSave(){
      if(this.paypalEmailForm.invalid){
        this.paypalEmailForm.markAllAsTouched();
        return
      }
      this.tutor$.savePaypalEmail(this.paypalEmailForm.value).subscribe((res:any)=> {
        if(res.success){
          this.paypalEmailErr = 'email';
          this.paypalAccountEmail['email'] = this.paypalEmailForm.value.paypal_email;
          this.notifierService.success(res.success_message)
          // this.paypalEmailForm.reset();
          
        } else{
          this.notifierService.error('Unable to save email');
        }
      }, err => {
        this.notifierService.error(err.error_message);
      })
    }

    getPaypalEmail(){
      this.tutor$.getPaypalEmail().subscribe((res:any)=> {
        if(res.email && res.success){
          this.paypalAccountEmail = res;
          this.paypalEmailForm.patchValue({paypal_email : res.email});
          this.paypalEmailForm.controls.paypal_email.updateValueAndValidity();
          this.paypalEmailErr = 'email';
          if(res.is_default){
            this.paymentModeDefault.patchValue({mode: 'Paypal'})
            this.paymentModeDefault.controls.mode.updateValueAndValidity();
          }
        }else if(res.is_default && res.success && !res.email){
          this.paypalAccountEmail = {email:null, is_default: false};
          this.paypalEmailForm.patchValue({paypal_email : null});
          this.paypalEmailForm.controls.paypal_email.updateValueAndValidity();
          this.paymentModeDefault.patchValue({mode: 'Paypal'})
          this.paymentModeDefault.controls.mode.updateValueAndValidity();
          this.paypalEmailErr = 'email';
        } else {
          this.paypalAccountEmail = {email:null, is_default: false};
          this.paypalEmailErr = 'error';
        }
      }, err => {
        this.paypalAccountEmail = {email:null, is_default: false};
        this.paypalEmailErr = 'error';
      })
    }

    editPaypal(){
      this.paypalEmailErr = this.paypalEmailErr == 'edit' ? 'email': 'edit';
    }

    makePrimary(){
      if(this.paymentModeDefault.invalid){
        
        return;
      }
    
      if( this.paymentModeDefault.value.mode == 'Paypal'){
        this.paypalEmailForm.markAllAsTouched();
        if(this.paypalEmailForm.invalid || this.paypalEmailForm.value.paypal_email== null || this.paypalEmailForm.value.paypal_email == ''){
          this.notifierService.error('Please fill valid Paypal email to make Paypal as default payment mode');
          return;
        }
       
      }else if (this.bankAccountList.length == 0 && this.paymentModeDefault.value.mode == 'Stripe'){
        this.notifierService.error('Please add atleast one bank account to make Stripe as default payment mode');
        return;
      }

      Swal.fire({
        title: 'Make Default',
        text: 'You want to make paypal your default payment mode? ',
        showCancelButton: true,
        confirmButtonText: 'Make Default',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.value) {
          this.tutor$.makeDefaultPaymentMethod(this.paymentModeDefault.value).subscribe((res: any) => {
            if (res.success_message) {
              // this.getBankAccount();
              Swal.fire(
                'Make Default',
                res.success_message,
                'success'
              );
              
              if(this.paymentModeDefault.value.mode == 'Paypal'){
                this.paypalAccountEmail['is_default'] = true
              } else {
                this.paypalAccountEmail['is_default'] = false;
              }

              
              // this.paypalAccountEmail['is_default'] = true
            } else {
              Swal.fire(
                'Error',
                res.error_message,
                'error'
              );
            }
          }, err => {
            Swal.fire(
              'Error',
              err.error_message,
              'error'
            );
          });
        }
      });
    }


    onSelectAttachment(evt) {
      // this.sizeLimitError = false;
      this.attachmentTypeFrontError = false;
      this.attachmentsizeLimitFrontError = false;
      this.attachmentFileFront = evt.target.files[0];
      const fileSize = parseFloat(Number(this.attachmentFileFront.size/1024/1024).toFixed(2));
      if(this.attachmentFileFront.type != 'image/png' && this.attachmentFileFront.type != 'image/jpeg' && this.attachmentFileFront.type !='application/pdf') {
        this.attachmentFileFront = null;
        this.attachmentTypeFrontError = true;
      }
      if(fileSize > 5) {
        this.attachmentFileFront = null;
        this.attachmentsizeLimitFrontError = true;
      }                
    }
    onSelectAttachmentBack(evt) {
      // this.sizeLimitError = false;
      this.attachmentTypeBackError = false;
      this.attachmentsizeLimitBackError = false;
      this.attachmentFileBack = evt.target.files[0];
      const fileSize = parseFloat(Number(this.attachmentFileBack.size/1024/1024).toFixed(2));
      if(this.attachmentFileBack.type != 'image/png' && this.attachmentFileBack.type != 'image/jpeg' && this.attachmentFileBack.type !='application/pdf') {
        this.attachmentFileBack = null;
        this.attachmentTypeBackError = true;
      }
      if(fileSize > 5) {
        this.attachmentFileBack = null;
        this.attachmentsizeLimitBackError = true;
      }                
    }

    openStripeModal(value){
      if(value == 'new'){
        this.formType = this.formTypeData.ALL;
        this.tutor$.getStudentProfile().subscribe((res:any)=> {
          this.userdata = res.data;
          this.userdata = Object.assign(this.userdata, {profileType: 'basic'})
          this.commonService.setAccountDetail(this.userdata);
          $('#basicModal').modal('show')
        })
      } else if (value == 'old') {
        this.tutor$.getStripeAccountDetail().subscribe((res:any)=> {
          this.userdata = res.data;
          this.userdata = Object.assign(this.userdata, {profileType: 'connect'})
          this.commonService.setAccountDetail(this.userdata)
          $('#basicModal').modal('show')
        })
      } else {
        $('#bankModal').modal('show');
      }
      
      // this.stripModal = this.modalService.show(StripDetailComponent)
      
      
    }

    getStripResult(event){
      if(event.success){
        $('#basicModal').modal('hide')
      }

      if(this.formType == this.formTypeData.ALL){
        $('#bankModal').modal('show')
      }

      this.getBankAccount();
    }

    stripeError(code){
      if(code.includes('verification_failed_keyed_identity') ){
        this.formType = this.formTypeData.DOCUMENT;
       this.openStripeModal('old');
      }else if(code.includes('individual.address.city')){
        this.formType = this.formTypeData.BASIC;
       this.openStripeModal('old');
      }else if(code.includes('individual.address.line1')){
        this.formType = this.formTypeData.BASIC;
       this.openStripeModal('old');
      }else if(code.includes('individual.address.postal_code')){
        this.formType = this.formTypeData.BASIC;
       this.openStripeModal('old');
      }else if(code.includes('individual.address.state')){
        this.formType = this.formTypeData.BASIC;
       this.openStripeModal('old');
      }else if(code.includes('individual.id_number')){
        this.formType = this.formTypeData.BASIC;
       this.openStripeModal('old');
      }else if(code.includes('individual.verification.document')){
        this.formType = this.formTypeData.DOCUMENT;
       this.openStripeModal('old');
      }
    }

    openBankModal(){
      $('#bankModal').modal('show')
    }
  }




