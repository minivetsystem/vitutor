import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AsyncRequestService } from '@app/core/services/async-request.service';
import * as moment from "moment";
import { AlertService } from '@app/shared/_services';
import {constantVariables} from '../../_constants/constants';
import {CommonService} from 'src/app/common/services/common.service'


@Component({
  selector: 'app-strip-detail',
  templateUrl: './strip-detail.component.html',
  styleUrls: ['./strip-detail.component.scss']
})
export class StripDetailComponent implements OnInit {
  formTypeData = constantVariables.FORM_TYPE
  @Input() data:any;
  @Input() formType: any = this.formTypeData.ALL
  @Output() result : EventEmitter<any> = new EventEmitter<any>()
  userData;
  countries_url = "countries";
  states_url = "states";
  cities_url = "cities";
  basicInformation: FormGroup;
  statesList = []
  citiesList=[]
  validPhoneNumber;
  attachmentTypeFrontError: boolean = false;
  attachmentsizeLimitFrontError: boolean = false;
  attachmentTypeBackError: boolean = false;
  attachmentsizeLimitBackError: boolean = false;
  attachmentFileFront: File
  attachmentFileBack: File;
  submitted: boolean = false;
  countryCode='231' //For stripe US country is hardcoded
  constructor(
    private router: Router,
    private notifierService: AlertService,
    private asyncRequestService: AsyncRequestService,
    private formBuilder: FormBuilder,
    private commonService: CommonService
  ) { 
    this.formInit();
  }

  ngOnInit() {
    if(!this.formType || this.formType == 'All'){
      this.formType = this.formTypeData.ALL
    } 
   this.commonService.getAccountDetail().subscribe((res:any)=> {
     this.userData = res
    if(this.userData && this.userData.profileType == 'basic'){
      this.setUserData()
    } else {
      this.setEditableUserData()
      if(this.formType == this.formTypeData.DOCUMENT){
        this.form.first_name.clearValidators();
        this.form.last_name.clearValidators();
        this.form.id_number.clearValidators();
        this.form.phone.clearValidators();
        this.form.city.clearValidators();
        this.form.country.clearValidators();
        this.form.state.clearValidators();
        this.form.line1.clearValidators();
        this.form.line2.clearValidators();
        this.form.postal_code.clearValidators();
        this.form.identity_doc_front.setValidators([Validators.required]);
        this.form.identity_doc_back.setValidators([Validators.required]);

        this.form.first_name.updateValueAndValidity();
        this.form.last_name.updateValueAndValidity();
        this.form.id_number.updateValueAndValidity();
        this.form.phone.updateValueAndValidity();
        this.form.city.updateValueAndValidity();
        this.form.country.updateValueAndValidity();
        this.form.state.updateValueAndValidity();
        this.form.line1.updateValueAndValidity();
        this.form.line2.updateValueAndValidity();
        this.form.postal_code.updateValueAndValidity();
        this.form.identity_doc_front.updateValueAndValidity();
        this.form.identity_doc_back.updateValueAndValidity();
      } else if (this.formType == this.formTypeData.BASIC){
        this.form.first_name.setValidators([ Validators.required,  Validators.maxLength(50)]);
        this.form.last_name.setValidators([ Validators.required,  Validators.maxLength(50)]);
        this.form.id_number.clearValidators();
        this.form.phone.setValidators([Validators.required]);
        this.form.city.setValidators([Validators.required]);
        this.form.country.setValidators([Validators.required]);
        this.form.state.setValidators([Validators.required]);
        this.form.line1.setValidators([Validators.required]);
        // this.form.line2.setValidators();
        this.form.postal_code.setValidators([Validators.required]);
        this.form.identity_doc_front.clearValidators();
        this.form.identity_doc_back.clearValidators();
        this.basicInformation.updateValueAndValidity();
       
      } else {
        this.form.first_name.setValidators([ Validators.required,  Validators.maxLength(50)]);
        this.form.last_name.setValidators([ Validators.required,  Validators.maxLength(50)]);
        this.form.id_number.setValidators([Validators.required]);
        this.form.phone.setValidators([Validators.required]);
        this.form.city.setValidators([Validators.required]);
        this.form.country.setValidators([Validators.required]);
        this.form.state.setValidators([Validators.required]);
        this.form.line1.setValidators([Validators.required]);
        // this.form.line2.setValidators();
        this.form.postal_code.setValidators([Validators.required]);
        this.form.identity_doc_front.clearValidators();
        this.form.identity_doc_back.clearValidators();
        this.basicInformation.updateValueAndValidity();
      }
    }
   })
   
    
    
  }


  getNumber(event){
    this.form.phone.setValue(event);
  }
  onCountryChange(ev) {
  }
  hasError(event){
    this.validPhoneNumber = !event;
  }

  telInputObject(obj) {
    obj.setCountry('in');
    if(this.form.phone.value){
      obj.setNumber(this.form.phone.value);
    }
  }

  getStates(id, state){
    this.asyncRequestService.getRequest(this.states_url+'/' + id).subscribe((res:any)=> {
      this.statesList = res;
        if(typeof state == 'string'){
          let find = this.statesList.find(x => x.sortname == state)
        if(find){this.basicInformation.patchValue({state: find}) 
                   this.getCitiesList() 
          }
      }
     
    })
  }

  getCitiesList(){
    let id=this.form.state.value.id
    let city;
    if(this.userData.city_name){
      city=this.userData.city_name
    }else if (this.userData && this.userData.address && this.userData.address.city){
      city = this.userData.address.city
    }
    
    this.asyncRequestService.getRequest(this.cities_url+'/' + id).subscribe((res:any)=> {
      this.citiesList = res;
      if(city){
        let find=this.citiesList.find(x => x.name == city);
        find?this.basicInformation.patchValue({city: find}): null
      }
        
    })
  }

  setUserData(){
    if(this.data){
      this.basicInformation.patchValue({
        first_name: this.userData.first_name,
        last_name: this.userData.last_name,
        email: this.userData.email,
        dob: moment(this.userData.dob).format('yyyy-MM-DD'),
        phone: this.userData.phone,
        line1: this.userData.address1,
        line2:this.userData.address2,
        postal_code: this.userData.zip_code

      });

      this.getStates(this.countryCode, this.userData.state_name)

      

    }
    else {
      // this.notifierService.error('data is missing');
      
    }
  }

  setEditableUserData(){
    this.basicInformation.patchValue({
      first_name: this.userData.first_name,
        last_name: this.userData.last_name,
        email: this.userData.email,
        dob: moment(this.userData.dob.day+'-'+this.userData.dob.month+'-'+this.userData.dob.year,'DD-MM-YYYY').format('yyyy-MM-DD'),
        phone: this.userData.phone,
        line1: this.userData.address.line1,
        line2:this.userData.address.line2,
        postal_code: this.userData.address.postal_code,
        id_number : this.userData.id_number || null
    })
    this.getStates(this.countryCode, this.userData.address.state)
  }

  get form() {
    return this.basicInformation.controls
  }

  formInit() {
    this.basicInformation = this.formBuilder.group({
      first_name: [
        null,
        [
          Validators.required,
          Validators.maxLength(50)],
      ],
      last_name: [
        null,
        [
          Validators.required,
          Validators.maxLength(50)
        ],
      ],
      email: [
        null, 
        [
          Validators.required, 
          Validators.email
        ]
      ],
     
      dob: [
        null, 
        Validators.required
      ],
      
      phone: [
        null,
        [
          Validators.required,
          Validators.maxLength(15),
          Validators.min(1),
          Validators.pattern(/[0-9]+$/)
        ],
      ],
     
      line1: [
        null, 
        [
          Validators.required,
        ]
      ],
      line2: [
        null
      ],
      city: [
        '', 
        [
        ]
      ],
      country: [
        'US', [
        Validators.required
        ]
      ],  
      
      state: [
        '', 
        [
          Validators.required
        ]
      ],
      postal_code: 
      [null, [ Validators.required,Validators.minLength(4)]],
      identity_doc_front: [null, [Validators.required]],
      identity_doc_back: [null, [Validators.required]],
      id_number : [null, [Validators.required, Validators.pattern(/^\d{9}$/)]]     
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

  getToday(){
    return moment().toDate();
  }

  onSubmit(){
    this.submitted = true;
    if(this.basicInformation.invalid){
      this.basicInformation.markAllAsTouched()
      return;
    }

    let url='tutor/addConnectAccount'

    let value = this.basicInformation.value;
    let formdata = new FormData();
    for(let data in value){
      if(data != 'city' && data != 'state' && data != 'identity_doc_front' && data != 'identity_doc_back'){
        formdata.append(data, value[data]);
      }else if (data == 'city' || data == 'state'){
        if(data == 'state')formdata.append(data, value[data].sortname || 'MA' );
        else if(data == 'city') formdata.append(data, value[data].name || 'Billings' );
      } else if ( data == 'identity_doc_front'){
        formdata.append(data, this.attachmentFileFront);
      } else if (data == 'identity_doc_back'){
        formdata.append(data, this.attachmentFileBack);
      }
    }

    this.asyncRequestService.postRequest(url,formdata).subscribe((res:any)=> {
      if(res.success){
        this.result.emit(res);
        this.notifierService.success(res.success_message || 'Detail added successfully')
      } else {
        this.notifierService.error(res.error_message)
      }
      
    }, err => {
      this.notifierService.error(err.error.error_message)
    });


  }
  

}
