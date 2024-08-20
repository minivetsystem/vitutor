import { Component, OnInit } from '@angular/core';
import { TutorService } from '../tutor.service';
import { Router } from '@angular/router';
import { AlertService, LocalStorageService, UserService } from '@app/shared/_services';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import _ from "lodash";
import * as moment from "moment";
import { DomSanitizer} from '@angular/platform-browser';
// import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';

import {
  NoWhitespaceValidator,
  ScrollToTargetService,
  phoneNumberValidator, MinimumAge
} from '@app/shared/_helpers/index';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { CommonService } from '@app/common/services/common.service';
// import { CountryPickerService } from 'ngx-country-picker';


@Component({
  selector: 'app-tutor-profile',
  templateUrl: './tutor-profile.component.html',
  styleUrls: ['./tutor-profile.component.scss']
})

export class TutorProfileComponent implements OnInit {
  _getProfileUrl = "profile/get-basic-information";
  updateBasicProfileUrl = 'profile/update';
  updateProfileImage = 'profile/update-profile-image';
  countries_url = "countries";
  states_url = "states";
  cities_url = "cities";

  basicInformation: FormGroup;
  uploadForm: FormGroup;

  people: any = ["Male", "Female"];
  fileName = "";
  userDetails: any;
  showImage: boolean = true;
  submitted: boolean = false;
  countriesList = [];
  statesList = [];
  citiesList = [];
  fileFormaterror: boolean = false;
  fileToUpload;
  imageUrl;
  telOptions = {initialCountry: 'us', preferredCountries: ['us', 'gb'], utilsScript: 'node_modules/intl-tel-input/build/js/utils.js'};
  phone_number_standard = '';
  validPhoneNumber = false;
  studentLevelArray = [{name:'Elementary'}, {name:'Middle School'}, {name:'High School'}, {name:'College'},{name:'Adult'}]
  menuToggle;
  result:any ={result : {profile_completed: true}}
  getNumber(event){
    this.renderErrors.phone.setValue(event);

  }
  onCountryChange(ev) {
   
  }
  test(){
  }

  hasError(event){
    this.validPhoneNumber = !event;
  }
 
 
  constructor(
    private router: Router,
    private notifierService: AlertService,
    private asyncRequestService: AsyncRequestService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private _tutor : TutorService,
   private sanitizer: DomSanitizer,
   private commonService: CommonService
  //  protected countryPicker: CountryPickerService
  ) {
   this.profileComplete()
  }

  profileComplete(){
    this.asyncRequestService.getRequest(`profile/check-profile-status`).subscribe(res => {
      this.result = res;
     }, err => {
       // this.router.navigate(['/']);
       // return false;
     });
  }


  ngOnInit(){
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    // this.countryPicker.getCountries()
    // .subscribe((countries) => this.countries = countries);
    this.getCountriesList();
    this._getUserBasicInformation();

    const reg = /^(https?):\/\/[^\s$.?#].[^\s]*$/;

    this.basicInformation = this.formBuilder.group({
      first_name: [
        null,
        [
          Validators.required,
          NoWhitespaceValidator,
          Validators.maxLength(50)],
      ],
      last_name: [
        null,
        [
          Validators.required, 
          NoWhitespaceValidator, 
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
        Validators.required, 
        MinimumAge
      ],
      
      gender: [
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
      about_me: [
        '',
        [
          Validators.required, 
          NoWhitespaceValidator, 
         // Validators.minLength(100)
        ],
      ],
      address1: [
        null, 
        [
          Validators.required, 
          NoWhitespaceValidator
        ]
      ],
      address2: [
        null
      ],
      city: [
        '', 
        [
        ]
      ],
      country: [
        '', 
        Validators.required
      ],  
      
      state: [
        '', 
        [
          Validators.required
        ]
      ],
      zip_code: 
      [
        null, 
        [
          Validators.required,
          Validators.minLength(4)
        ]
      ],
      overview_video_link: [
        null,
        [
          Validators.pattern(reg)
        ]
      ],
      photo:[],
      tag_line: ['', [Validators.required, Validators.maxLength(60)]],
      // student_level: ['', [Validators.required]]
     
    });

    // this.uploadForm = this.formBuilder.group({
    //   profile: [this.fileName],
    // });
   
  }


  // ngAfterViewInit(){
  //   this.getStatesList();
  //   this.getCitiesList();
  // }

  getToday() {
    return new Date().toISOString().split('T')[0];
  }
  imageUpload(event) {
    const file = event.target.files[0];
    if((file.type == 'image/jpeg') || (file.type == 'image/jpg') || (file.type == 'image/png')){
      const reader = new FileReader();
      this.fileToUpload = file;
      reader.readAsDataURL(file); // read file as data url
      reader.onload = (eve) => { // called once readAsDataURL is completed
        this.showImage = true;
        this.imageUrl = reader.result;
      };
    } else {
      this.notifierService.error('Image type is invalid. Upload jpg, jpeg or png fie');
    }
  }
  // changePreferredCountries() {
	// 	this.preferredCountries = [CountryISO.India, CountryISO.Canada];
	// }

  _getUserBasicInformation() {
    this.asyncRequestService.getRequest(this._getProfileUrl).subscribe(
      async (response: any) => {
        this.userDetails = response.data;
       
        if (this.userDetails.photo == "") {
            this.showImage = false;
        }else{
          this.showImage = true;
          this.imageUrl = this.userDetails.photo;
        }
     
        if (this.userDetails.overview_video_link != null) {
          this.showVideo =this.sanitizer.bypassSecurityTrustResourceUrl(this.userDetails.overview_video_link);
        }
        let studentLevel = response.data.tutor_class_level.map(e => {
          return e.class_level
        });
        this.basicInformation.setValue({
          first_name : response.data.first_name,
          last_name: response.data.last_name,
          gender : response.data.gender,
          dob: response.data.dob?moment(response.data.dob).format('yyyy-MM-DD'):'',
          photo : response.data.photo,
          email: response.data.email,
          address1 : response.data.address1,
          address2: response.data.address2,
          city : this.userDetails.city,
          state : this.userDetails.state,
          country : response.data.country,
          zip_code : response.data.zip_code,
          phone: response.data.phone,
          about_me : response.data.about_me,
          overview_video_link : response.data.overview_video_link,
          tag_line : response.data.tag_line || '',
          // student_level:  studentLevel
        });

        this.getStatesList(this.userDetails.country);
        this.getCitiesList(this.userDetails.state);
      },
      (error: any) => {}
      );
   
  }

  get renderErrors() {
    return this.basicInformation.controls;
  }


  getCountriesList() {
    this._tutor.getCountries().subscribe((res: any) => {
      this.countriesList = res;
    });
  }

  getStatesList(id : any) {
      if (id) {
      this._tutor.getStates(id).subscribe((res: any) => {
          this.statesList = res;
      });
    }
  }

  getCitiesList(id : any) {
      if (id) {
        this._tutor.getCities(id).subscribe((res: any) => {
          this.citiesList = res;
      });
    }

  }
  telInputObject(obj) {
    obj.setCountry('in');
    if(this.renderErrors.phone.value){
      obj.setNumber(this.renderErrors.phone.value);
    }
  }


  showVideo;

  playVideo() {
    this.notifierService.swalVideoPlayer(this.userDetails, "profile");
  }
   getId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : null;
}
    
// const videoId = getId('http://www.youtube.com/watch?v=zbYf5_S7oJo');
// const iframeMarkup = '<iframe width="560" height="315" src="//www.youtube.com/embed/' 
//     + videoId + '" frameborder="0" allowfullscreen></iframe>';


  courseVideoLink(url) {
    if (
      this.basicInformation.controls.overview_video_link.value != null ||
      this.basicInformation.controls.overview_video_link.value != ""
    ) {
      const regExp = (/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
      const match = url.match(regExp);
      if(match){
        const videoId = (match && match[2].length === 11)
        ? match[2]
        : null;
         url = 'https://www.youtube.com/embed/' + videoId ;
         this.basicInformation['controls']['overview_video_link'].setValue(
          url
        );
      }
      this.showVideo =this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.basicInformation.controls.overviewVideoFile.disable();
    }
  }

  trimAboutMe() {
    if (this.basicInformation["controls"]["about_me"].value) {
      this.basicInformation["controls"]["about_me"].setValue(
        this.basicInformation["controls"]["about_me"].value.replace(
          / {2,}/g,
          " "
        )
      );
    }
  }

  onSubmit() {
    this.submitted = true;
    if (!this.basicInformation.valid) {
      return;
    }
    if(this.validPhoneNumber){
      return;
    }
    let value = this.basicInformation.value;

    delete value.email;
    delete value.photo;
    // value.student_level = value.student_level.join();
    this.asyncRequestService
      .postRequest(this.updateBasicProfileUrl, value)
      .subscribe(
        (response: any) => {
          let user = JSON.parse(this.localStorageService.get("user"));

          user.photo = response.user.photo;
          if (this.fileToUpload) {
            const formData = new FormData();
            formData.append(
              "file",      
              this.fileToUpload,
              this.fileToUpload.name
            );
            this.asyncRequestService
            .uploadFiles(this.updateProfileImage, formData)
            .subscribe((result:any) => {
              if(result.success){
                this.notifierService.success('Profile updated successfully');
                user.photo = result.photo;
                this.localStorageService.set("user", user);
                this.localStorageService.saveData(true);
                this.profileComplete();
                // this.router.navigate(['/tutor/dashboard']);
                // this.router.navigate(['/tutor/dashboard']);
              }
            
            },(errorResponse) => {
              this.notifierService.error(errorResponse.error.error_message);
              return;
            });
          } else {
            this.notifierService.success(response.success_message);
            // this.router.navigate(['/tutor/dashboard']);
          }
          //updating local storage
          user.first_name = this.basicInformation.value.first_name.trim();
          user.last_name = this.basicInformation.value.last_name.trim();
          user.zip_code = this.basicInformation.value.zip_code.trim();
          user.address = this.basicInformation.value.address1.trim();
          user.state = response.user.state.trim();
          user.city = response.user.city.trim();
          this.localStorageService.set("user", user);
          this.localStorageService.saveData(true);
        },
        (errorResponse: any) => {
          this.notifierService.error(errorResponse.error.error_message);
        }
      );
  }

  profilePictureError(event) {
    event.target.src = '../../../assets/img/user.png';
  }
  onChange(event) {
}
onRemove(event) {
}

}
