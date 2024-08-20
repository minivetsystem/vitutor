import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import { Router } from '@angular/router';
import { AlertService, LocalStorageService } from '../../shared/_services/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {environment} from '../../../environments/environment';
import {
  NoWhitespaceValidator,
  ScrollToTargetService,
  phoneNumberValidator
} from '../../shared/_helpers/index';
import * as moment from 'moment';
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss']
})
export class StudentProfileComponent implements OnInit {
  imageSrc: any = '../../../assets/img/user.png';
  imageUpload;
  ProfileForm: FormGroup;
  object = {email: '', dob: ''};
  countriesList = [];
  statesList = [];
  citiesList = [];
  fileUplaod;
  telOptions = {initialCountry: 'us', preferredCountries: ['us', 'gb'], utilsScript: 'node_modules/intl-tel-input/build/js/utils.js'};
  phone_number_standard = '';
  validPhoneNumber = false;
  menuToggle;
  result:any ={result : {profile_completed: true}};
  ngTelObj;
  
  constructor(private _student: StudentService,
              private router: Router,
              // private localStorageService: LocalStorageService,
              private notifierService: AlertService,
              private formBuilder: FormBuilder,
              private scrollToTargetService: ScrollToTargetService,
    private localStorageService: LocalStorageService,
    private commonService:CommonService,
    private async: AsyncRequestService
    ) { this.formInitialize(); 
      this.checkSTatus();
     }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    // this.object = JSON.parse(localStorage.getItem('userData')) || this.object1;
    this.getCountriesList();
   
    this._student.getStudentProfile().subscribe((result: {success: boolean, message: string, data: {dob, image_url, photo}}) => {
      result.data.dob = result.data.dob ? new Date(result.data.dob) : '';
      // result.data.dob = undefined;
      this.formValueSet(result.data);
      if (result.data.photo && result.data.photo !== '') {
        this.imageSrc = result.data.photo;
      }
      // this.object = Object.assign({}, result.data);
    }, err => {
    }, () => {
      this.getStatesList();
      this.getCitiesList();
    });
  }
  getCountriesList() {
    this._student.getContouries().subscribe((res: []) => {
      this.countriesList = res;
    });
  }
  updateLocalstorage(fullName, photo?) {
    if (this.localStorageService.getUserData()) {
      let userData = this.localStorageService.getUserData();
      if (photo) {
        userData.photo = photo;
      }
      userData.full_name = fullName;

      this.localStorageService.set('user', userData);
    }
  }
  getStatesList() {
    let id = this.profile.country.value;
    if (id) {
    this._student.getStates(id).subscribe((res: any) => {
        this.statesList = res;
    });
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

  getCitiesList() {
    let id = this.profile.state.value;
    if (id) {
      this._student.getCities(id).subscribe((res: any) => {
        this.citiesList = res;
    });
    }

  }
  formInitialize() {
    this.ProfileForm = this.formBuilder.group(
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
        gender: ['', [Validators.required]],
        phone: [null, [phoneNumberValidator]],
        dob : [null, [Validators.required]],
        address1 : ['', [Validators.required]],
        address2 : ['', []],
        city : ['', [Validators.required]],
        state : ['', [Validators.required]],
        country: ['', [Validators.required]],
        zip_code : ['', [Validators.required, Validators.minLength(4)]],
        country_code:['us']
      }
    );
  }

  get profile() {
    return this.ProfileForm.controls;
  }

  formValueSet(object) {
    this.ProfileForm.setValue({
      first_name : object.first_name,
      last_name: object.last_name,
      gender : object.gender,
      dob: object.dob ? moment(object.dob).format('YYYY-MM-DD') : '',
      email: object.email,
      address1 : object.address1,
      address2: object.address2,
      city : object.city,
      state : object.state,
      country : object.country,
      zip_code : object.zip_code,
      phone: object.phone,
      country_code: object.country_code || 'us'
    });
    this.ngTelObj.setNumber(object.phone);
  }

  onSubmit() {
    this.object = Object.assign(this.ProfileForm.value, {is_guardian : 'false'} );
    delete this.object.email;
    // this.object.dob = this.object.dob.split('T')[0];
    this._student.updateProfile(this.object).subscribe((res: any) => {
      // let errorMsg = false;
      let user = JSON.parse(this.localStorageService.get("user"));
      user.first_name = this.ProfileForm.value.first_name.trim();
      user.last_name = this.ProfileForm.value.last_name.trim();
      user.zip_code = this.ProfileForm.value.zip_code.trim();
      user.address = this.ProfileForm.value.address1.trim();
      user.state = res.user.state.trim();
      user.city = res.user.city.trim();
      if (this.fileUplaod) {
        const formData = new FormData();
        formData.append('file', this.fileUplaod);
        this._student.uploadImage(formData).subscribe((result:any) => {

          this.notifierService.success('Profile updated successfully');
          user.photo = result.photo;
          this.localStorageService.set("user", user);
          this.localStorageService.saveData(true);
        }, err => {
          this.notifierService.error('Error updating profile');
          return;
        });
      } else {
        this.notifierService.success(res.success_message);
        this.checkSTatus();
        this.localStorageService.set("user", user);
        this.localStorageService.saveData(true);
        // this.router.navigate(['/student/dashboard']);
      }
     
    }, err => {
      this.notifierService.error('Error updating profile');
    });
    // localStorage.setItem('userData', JSON.stringify(this.object));
    // this.notifierService.success('Successfully updated');
  }
  profilePicture(event) {
    const file = event.target.files[0];
    if((file.type == 'image/jpeg') || (file.type == 'image/jpg') || (file.type == 'image/png')){
      const reader = new FileReader();
      this.fileUplaod = file;
      reader.readAsDataURL(file); // read file as data url
      reader.onload = (eve) => { // called once readAsDataURL is completed
        this.imageUpload = reader.result;
      };
    } else {
      this.notifierService.error('Image type is invalid. Upload jpg, jpeg or png fie');
    }
    
  }
  getToday() {
    return new Date().toISOString().split('T')[0];
  }

  onError(event) {
    this.imageSrc = 'assets/img/user.png';
  }

  // NG2 Tel Input
  getNumber(event){
    this.profile.phone.setValue(event);

  }
 
  onCountryChange(ev) {
  }
 
  hasError(event){
    this.validPhoneNumber = !event;
  }
  telInputObject(obj) {
    this.ngTelObj = obj;
    obj.setCountry('us');
    if(this.profile.phone.value){
      obj.setNumber(this.profile.phone.value);
    }
  }

}
