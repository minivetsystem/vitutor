import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { constantVariables } from '@app/shared/_constants/constants';
import { NoWhitespaceValidator } from '@app/shared/_helpers';
import { AlertService, AttachmentService } from '@app/shared/_services';

@Component({
  selector: 'app-work-and-education',
  templateUrl: './work-and-education.component.html',
  styleUrls: ['./work-and-education.component.scss']
})
export class WorkAndEducationComponent implements OnInit {
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;

  educationSubmit = false;
  workExperienceSubmit = false;
  attachmentSubmit = false;

  add_education_url = "profile/save-education";
  add_word_experience_url = "profile/save-work-experience";
  add_attachment_url = "profile/save-attachments";
  get_user_work_qualification = "profile/get-qualification-work-experience";
  years: any = ["2019", "2018"];

  endEducationalYears: any;
  endWorkAndExperienceYears: any;

  addEducationForm: FormGroup;
  educationArray = [];

  addWordExperience: FormGroup;
  workExperienceArray = [];

  addAttachmentForm: FormGroup;
  attachmentArray = [];

  fileToUpload;
  isToggleFlag: boolean = false;

  workExperienceToggle: boolean = false;

  toggle = false
  educationFormToggle = true

  addMoreToggle = false
  workFormToggle = true

  menuToggle;
  result:any ={result : {profile_completed: true}}
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private asyncRequestService: AsyncRequestService,
    private notifierService: AlertService,
    private attachmentService: AttachmentService,
    private commonService: CommonService
  ) { 
    this.profileCheckStatus();
  }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    //init edutcation form validations
    this.addEducationForm = this.formBuilder.group({
      institute_name: [null, [Validators.required, NoWhitespaceValidator]],
      session_end: [null, Validators.required],

    });

    //init work experience form
    this.addWordExperience = this.formBuilder.group({
      designation: [null, [Validators.required, NoWhitespaceValidator]],
      institute_name: [null, [Validators.required, NoWhitespaceValidator]],
      start_from: [null, Validators.required],
      end_to: [null, Validators.required],
      current: [null],
    });

    //init attachment form
    this.addAttachmentForm = this.formBuilder.group({
      certificate_file: ["", [Validators.required]],
      title: [null, [Validators.required, NoWhitespaceValidator]],
      is_public: [null]
    });
    if (window.location.pathname == "/tutor/work-education") {
      this.getUserWorkAndQualificationAttachments();
    }
  }

  profileCheckStatus(){
    this.asyncRequestService.getRequest(`profile/check-profile-status`).subscribe(res => {
      this.result = res;
     }, err => {
       // this.router.navigate(['/']);
       // return false;
     });
  }

  /**
   * Render validation error to view
   */
  get educationFormErros() {
    return this.addEducationForm.controls;
  }

  /**
   * Render validation error to view
   */
  get workExperienceFormErros() {
    return this.addWordExperience.controls;
  }

  /**
   * Render validation error to view
   */
  get attachmentFormErros() {
    return this.addAttachmentForm.controls;
  }



  /**
   * Submit education or qualification form
   * method : submitEducationForm()
   * date : 2020-10-14
   */
  submitEducationForm() {
    this.educationSubmit = true;
    if (!this.addEducationForm.valid) {
      return;
    }
    // subscribe service
    this.asyncRequestService
      .postRequest(this.add_education_url, this.addEducationForm.value)
      .subscribe(
        (response: any) => {
          this.notifierService.success(response.success_message);
          this.getUserWorkAndQualificationAttachments();
          this.educationSubmit = false;
          this.addEducationForm.reset();
          this.addEducationForm.controls.session_end.enable();
          this.toggle = true
        },
        (errorResponse: any) => {
          this.notifierService.success(errorResponse.error.error_message);
        }
      );
  }

  ShowEducationForm() {
    this.educationFormToggle = true
    this.toggle = false
  }

  ShowWorkExperinceForm() {
    this.workFormToggle = true
    this.addMoreToggle = false
  }

  /**
   * Submit Work experience form
   * method : submitWorkExperienceForm()
   * date : 2020-10-14
   */
  submitWorkExperienceForm() {
    this.workExperienceSubmit = true;

    if (!this.addWordExperience.valid) {
      return;
    }

    // subscribe subscription
    this.asyncRequestService
      .postRequest(this.add_word_experience_url, this.addWordExperience.value)
      .subscribe(
        (response: any) => {
          if(response.success){
            this.notifierService.success(response.success_message);
            this.getUserWorkAndQualificationAttachments();
            this.workExperienceSubmit = false;
            this.addWordExperience.reset();
            this.addWordExperience.controls.end_to.enable();
            this.addMoreToggle = true;
          } else {
            this.notifierService.error(response.error_message);
          }
          
        },
        (errorResponse: any) => {
          this.notifierService.success(errorResponse.error.error_message);
        }
      );
  }

  /**
  * Submit retreve data for attachment qualification and work experience
  * method : getUserWorkAndQualificationAttachments()
  * date : 2020-10-14
  */

  getUserWorkAndQualificationAttachments() {
    this.asyncRequestService
      .getRequest(this.get_user_work_qualification)
      .subscribe(
        (response: any) => {
          this.profileCheckStatus();
          this.educationArray = response.qualification || [];
          this.workExperienceArray = response.work_experience || [];
          this.years = response.years;
          this.endEducationalYears = this.years;
          this.attachmentArray = response.attachments;

          if (this.educationArray.length > 0) {
            this.educationFormToggle = false
            this.toggle = true
          }



          if (this.workExperienceArray.length > 0) {

            this.workFormToggle = false
            this.addMoreToggle = true
          }


        },
        (errorResponse: any) => {
          this.notifierService.error(errorResponse.error.error_message);
        }
      );
  }

  /**
   * Submit delete request to serve
   * method : getUserWorkAndQualificationAttachments()
   * date : 2020-10-14
   * @param type string
   * @param index key
   */

  removeRecord(type: string, index) {
    var id: number;
    var url: string;
    var current = [];
    if (type == "education") {
      id = this.educationArray[index].id;
      url = "profile/delete/qualification/" + id;
    }
    if (type == "workExperience") {
      id = this.workExperienceArray[index].id;
      url = "profile/delete/work-experience/" + id;
    }
    if (type == "remove-attachment") {
      id = this.attachmentArray[index].id;
      url = "profile/delete/remove-attachment/" + id;
    }
    if (id) {
      this.asyncRequestService.deleteRequest(url).subscribe(
        (response: any) => {
          if (response.type == "qualification") {
            this.educationArray.splice(index, 1);
          }
          if (response.type == "work-experience") {
            this.workExperienceArray.splice(index, 1);
          }
          if (response.type == "remove-attachment") {
            this.attachmentArray.splice(index, 1);
          }
          if (this.educationArray.length == 0) {
            this.educationFormToggle = true
            this.toggle = false
          }

          if (this.workExperienceArray.length == 0) {
            this.workFormToggle = true
            this.addMoreToggle = false
          }
          this.profileCheckStatus();
          this.notifierService.success(response.success_message);
        },
        (errorResponse: any) => {
          this.notifierService.error(errorResponse.error.error_message);
        }
      );


    }
  }

  /**
   * Submit  upload attachment to server
   * method : onSubmitUploadAttachment()
   * date : 2020-10-14
   * @param type string
   * @param index key
   */

  onSubmitUploadAttachment() {
    this.attachmentSubmit = true;
    if (!this.addAttachmentForm.valid) {
      return;
    }
    let formData = new FormData();
    formData.append(
      "certificate_file",
      this.fileToUpload,
      this.fileToUpload.name
    );
    formData.append("title", this.addAttachmentForm.controls.title.value);
    formData.append("is_public", this.addAttachmentForm.controls.is_public.value);

    // subscribe service
    this.asyncRequestService
      .uploadFiles(this.add_attachment_url, formData)
      .subscribe(
        (response: any) => {
          this.notifierService.success(response.success_message);
          this.getUserWorkAndQualificationAttachments();
          this.attachmentSubmit = false;
          this.addAttachmentForm.reset();
          this.fileToUpload = false;
        },
        (errorResponse: any) => {
          this.notifierService.error(errorResponse.error.error_message);
        }
      );
  }
  /**
   * Get imageUpload file
   * method : imageUpload()
   * @param files
   */
  imageUpload(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  /**
   * set current year disabled for eduacation form
   * Method curretToggle()
   */
  toggleCurrentEducation() {
    this.isToggleFlag = !this.isToggleFlag;
    if (!this.isToggleFlag) {
      this.addEducationForm.controls.session_end.enable();
    } else {
      this.addEducationForm.controls.session_end.disable();
    }
  }

  /**
   * set current year disabled for work experience form
   * Method curretToggle()
   */
  toggleCurrentWorkExperience() {
    this.workExperienceToggle = !this.workExperienceToggle;
    if (!this.workExperienceToggle) {
      this.addWordExperience.controls.end_to.enable();
    } else {
      this.addWordExperience.controls.end_to.disable();
    }
  }

  onChangeEducationalYears(event: any) {
    var date = new Date();
    var year = date.getFullYear();
    this.endEducationalYears = [];
    this.addEducationForm.controls.session_end.reset();
    for (let index = event; index <= year; index++) {
      this.endEducationalYears.push(index);
    }
    this.endEducationalYears.sort();
    this.endEducationalYears.reverse();
    // we need to splice
  }

  onChangeWorkAndExperienceYears(selectedYear) {
    var date = new Date();
    var year = date.getFullYear();
    this.endWorkAndExperienceYears = [];
    this.addWordExperience.controls.end_to.reset();
    for (let index = selectedYear; index <= year; index++) {
      this.endWorkAndExperienceYears.push(index);
    }
    this.endWorkAndExperienceYears.sort();
    this.endWorkAndExperienceYears.reverse();
    // we need to splice
  }

  downloadFile(id: number, fileName: string) {
    let fileUrl = "attachment/user-attachment/" + id;
    this.attachmentService.downloadFile(fileUrl, fileName);
  }
}
