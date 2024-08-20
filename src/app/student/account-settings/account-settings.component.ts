import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StudentService } from '../student.service';
import { Router } from '@angular/router';
import { AlertService } from '@app/shared/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  MustMatch,
  PasswordStrengthValidator,
} from "@app/shared/_helpers/password-must-match";

import { environment } from '../../../environments/environment.prod';
import { constantVariables } from '@app/shared/_constants/constants';
import {Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { LocalStorageService } from '@app/shared/_services';
import * as moment from 'moment'

declare var $: any;
declare var window: any;

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  @ViewChild('cardModal', {static : false}) cardModal: ElementRef;
  savedCards: Array<any> = [];
  password;
  newPassword = '';
  matchPasswordErr = false;
  loading = false;
  paypalEmailForm: FormGroup;
  changePassForm: FormGroup;
  cardDetailForm: FormGroup;
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  cards$: Observable<any> = this.http.get('/api/cards');
  menuToggle;
  result:any ={result : {profile_completed: true}}
  editCardForm: FormGroup;
  timeZoneListArray = [];
  selectedTimeZone: string;
  timezone
  constructor(private _student: StudentService,
              private router: Router,
              private notifierService: AlertService,
              private http: HttpClient,
              private formBuilder: FormBuilder,
              private commonService: CommonService,
              private async: AsyncRequestService,
              private localStorageService: LocalStorageService
            ) { this.changePasswordForm(); this.initCardDetailForm();this.paypalEmail(); this.initEditCardDetailForm()
              this.checkSTatus();
            
            
            
            }

  ngOnInit() {

    // if ((localStorage.getItem('paypalstudent'))) {
    //   this.connectedPaypal = true;
    // }
    this.commonService.menuToggle.subscribe((res:number) => {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
   this.fetchCards();
   this.timezoneList();
   const params = window.location.href.split('?')[1]
   if (params){
   
    params.token = params.code;
    this._student.addPaypalToken(params).subscribe((res:any) => {
      localStorage.setItem('paypalstudent', JSON.stringify(params));
      // this.connectedPaypal = true;
    }, err => {
      this.notifierService.error('Unable to login into paypal');
    })
  }

  
  }

  checkSTatus(){
    this.async.getRequest(`profile/check-profile-status`).subscribe((res:any) => {
      this.result = res;
     }, err => {
       // this.router.navigate(['/']);
       // return false;
     });
  }
  // paypalLogout() {
  //   localStorage.removeItem('paypalstudent');
  //   this.connectedPaypal = false;
  // }
  timezoneList(){
  var timeZones = moment.tz.names();
    var offsetTmz=[];
    for(var i in timeZones)
    {
      offsetTmz.push({"name":"(GMT"+moment.tz(timeZones[i]).format('Z')+")" + timeZones[i] , value : timeZones[i]});
    }
    this.timeZoneListArray = offsetTmz;
    this.localStorageService.timeZone.subscribe((res:any)=> {
      if(res){
        this.selectedTimeZone = res
      } else {
        this.selectedTimeZone = this.localStorageService.getTimeZone();
      }
    })


}

updateTimeZone(){
  this._student.saveTimeZone({'timezone':this.selectedTimeZone}).subscribe((res:any)=> {
    if(res.success){
      this.notifierService.success(res.success_message || 'Time zone successfully updated')
      this.localStorageService.setTimeZone(this.selectedTimeZone);
    }else {
      this.notifierService.error(res.error_message || 'Time zone unable to update')
    }
  }, err => {
    this.notifierService.error(err.error.error_message || 'Time zone unable to update')
  })
}
  fetchCards() {
    this._student.fetchAllCard().subscribe((res: {data: any, success_message: string, success: boolean}) => {
      this.savedCards = res.data;
    });
  }

  deleteCard(id, lastFour) {
    if(this.savedCards.length <= 1 ){
      this.notifierService.error('Minimum one card is required');
      return;
    }
    Swal.fire({
      title: 'Delete?',
      text: 'You want to delete the card ending with ' + lastFour,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this._student.deleteCard(id).subscribe((res: any) => {
          if (res.success == true) {
            this.fetchCards();
            Swal.fire(
              'Deleted!',
              res.success_message,
              'success'
            );
          } else if (res.success == false) {
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
        // For more information about handling dismissals please visit
        // https://sweetalert2.github.io/#handling-dismissals
      }
    });
  }

  defaultCard(id) {
    this._student.madeCardDefault(id).subscribe((res: {success_message: string}) => {
      if (res.success_message) {
        this.notifierService.success(res.success_message);
        let copyObj = this.savedCards.slice();
        let updatedObj = copyObj.map((obj)=>{
          obj['is_primary'] = false;  
          if(obj.id === id){
            obj['is_primary'] = true;
          }
          return obj; 
        });
        this.savedCards = updatedObj.slice();
        


      }
    } , err => {
      this.notifierService.error(err.error_message);
    });
  }
  paypalEmail() {
    this.paypalEmailForm = this.formBuilder.group({
      paypal_email : [null, [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)]]
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

  initCardDetailForm() {
    this.cardDetailForm = this.formBuilder.group({
      card_holder_name : [null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      card_number : [null, [Validators.required]],
      cvc : [null, [Validators.required,  Validators.pattern(`^[0-9]{3,3}$`)]],
      exp_month : [null, [Validators.required, Validators.pattern(`^[0-9]{2,2}$`)]],
      exp_year : [null, [Validators.required, Validators.pattern(`^[0-9]{4,4}$`)]],
      card_type: ['',[Validators.required]]
    });
  }
  initEditCardDetailForm() {
    this.editCardForm = this.formBuilder.group({
      card_holder_name : [null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      card_number : [null, [Validators.required]],
      cvc : [null, [Validators.required]],
      exp_month : [null, [Validators.required, Validators.pattern(`^[0-9]{2,2}$`)]],
      exp_year : [null, [Validators.required, Validators.pattern(`^[0-9]{4,4}$`)]],
      card_type: ['',[Validators.required]],
      id: [null, [Validators.required]],
      is_primary: [null]
    });
  }

  get form() {
    return this.changePassForm.controls;
  }
  get cardDetail() {
    return this.cardDetailForm.controls;
  }

  get editCard() {
    return this.editCardForm.controls;
  }
  changePassword() {
    this.changePassForm.markAllAsTouched();
    if (this.changePassForm.invalid) {
      this.notifierService.error('Error validating password');
      return;
    }
    this._student.updatePassword(this.changePassForm.value).subscribe((res : any) => {
        if (res.success) {
          this.changePassForm.reset();
          this.notifierService.success(res.success_message);
          this.localStorageService.clearUserData();
          // this.router.navigate(['dashboard']);
        } else {
          this.notifierService.error(res.error_message);
        }
      }, err => {
        this.notifierService.error('Unable to change password');
      });
  }

  changeCardType(event){
    if(event=='visa'){
    // ^4[0-9]{12}(?:[0-9]{3})?$
      this.cardDetail.card_number.setValidators([Validators.required, Validators.pattern(/^4[0-9]{12}(?:[0-9]{3})?$/)])
      this.cardDetail.card_number.updateValueAndValidity();
    }else if (event == 'american_express'){
      this.cardDetail.card_number.setValidators([Validators.required, Validators.pattern(/^3[47][0-9]{13}$/)])
      this.cardDetail.card_number.updateValueAndValidity();
    } else if(event=='master'){
      this.cardDetail.card_number.setValidators([Validators.required, Validators.pattern(/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/)])
      this.cardDetail.card_number.updateValueAndValidity();
    } else {
      this.cardDetail.card_number.setValidators([Validators.required])
      this.cardDetail.card_number.updateValueAndValidity();
    }
  }

  passwordMatch() {
    if (this.form.new_password.value == this.form.confirm_password.value && this.form.new_password.value != '') {
      this.matchPasswordErr = false;
    } else {
      this.matchPasswordErr = true;
    }
  }

  addCard() {
    this.cardDetailForm.markAllAsTouched();
    if (this.cardDetailForm.invalid) {
      return;
    }
    let cardDetail = Object.assign(this.cardDetailForm.value);
    cardDetail.card_exp_year_month = cardDetail.exp_month + '/' + cardDetail.exp_year;
    if (this.savedCards.length == 0) {
      cardDetail = Object.assign(cardDetail, {is_primary: 1});
    } else {
      cardDetail = Object.assign(cardDetail, {is_primary: 0});
    }
    this._student.addCardDetails(cardDetail).subscribe((res: any) => {
      if(res.error || !res.success){
        this.notifierService.error(res.error || res.success_message);
      } else{
        this.notifierService.success(res.success_message);
        this.fetchCards();
        $("#cardModal").modal('hide');
        this.cardDetailForm.reset();
        this.checkSTatus();
      }
      
    }, err => {
      this.notifierService.error(err.error.error_message);
    });
  }

  // paypalConnect() {
  //   const redirectURL = window.encodeURIComponent(window.location.href.split('?')[0]);
  //     const client_id = environment.client_id;
  //     window.open(`https://www.sandbox.paypal.com/connect/?flowEntry=static&client_id=${client_id}&response_type=code&scope=openid email&redirect_uri=${redirectURL}`);
  // }

  addBank(){

  }

  paypalSave(){
    if(this.paypalEmailForm.invalid){
      return
    }
    this._student.savePaypalEmail(this.paypalEmailForm.value).subscribe((res:any)=> {
      if(res.success){
        this.notifierService.success(res.success_message)
        this.paypalEmailForm.reset();
      } else{
        this.notifierService.error('Unable to save email');
      }
    }, err => {
      this.notifierService.error(err.error_message);
    })
  }

  editCardModel(card){
    this.editCardForm.patchValue({id: card.id, 
                                  card_holder_name: card.card_holder_name, 
                                  card_type: card.card_type, 
                                  exp_month: card.card_exp_month,
                                  exp_year: card.card_exp_year,
                                  card_number: '**** **** **** ' + card.card_last_four,
                                  cvc: '***',
                                  is_primary: card.is_primary
                                });

  $('#editCardModal').modal('show');
  }

 


  editCardDetail(){
    this.editCardForm.markAllAsTouched();
    if (this.editCardForm.invalid) {
      return;
    }
    let cardDetail = Object.assign(this.editCardForm.value);
    cardDetail.card_exp_year_month = cardDetail.exp_month + '/' + cardDetail.exp_year;
    
    this._student.editCard(cardDetail).subscribe((res: any) => {
      if(res.error){
        this.notifierService.error(res.error);
      } else{
        this.notifierService.success(res.success_message);
        this.fetchCards();
        $('#editCardModal').modal('hide');
        this.editCardForm.reset();
      }
      
    }, err => {
      this.notifierService.error(err.error.error_message);
    });
  }


}
