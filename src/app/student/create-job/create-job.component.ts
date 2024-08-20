import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService, LocalStorageService } from '../../shared/_services/index';
import { StudentService } from '../student.service';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { CommonService } from '@app/common/services/common.service';


@Component({
  selector: 'app-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent implements OnInit {
  createJob: FormGroup;
  subjectsList = [];
  subCategoryList = [];
  jonTypeFields = false;
  recurringTypeField = '';
  currentDate;
  urls = new Array<File>();
  attachment = null;
  attachmentErr: boolean = false;
  activeCard: {};
  menuToggle;
  result:any ={result : {profile_completed: true}}

  constructor(private fb: FormBuilder,
    private notifier: AlertService,
    private studentService: StudentService,
    private location: Location,
    private LocalStorageService: LocalStorageService,
    private commonService : CommonService,
    private router: Router
  ) {

  }

  ngOnInit() {
    let user =  this.LocalStorageService.get('user');
    this.result.result.profile_completed = JSON.parse(user).is_profile_completed;
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.getSubjectsList();
    this.initCrateJobForm();
    this.getToday();
    this.studentService.fetchAllCard().subscribe((res: any) => {
      let allCards = res.data;
      this.activeCard = allCards.find((obj)=>{
        return obj['is_primary'] == true;
      });
      
    });
        
  }

  getToday() {
    this.currentDate = new Date().toISOString();
  }

  initCrateJobForm() {
    this.createJob = this.fb.group({
      job_title: ['', [Validators.required]],
      job_description : ['', [Validators.required]],
      job_category : ['', [Validators.required]],
      sub_category_id : ['', [Validators.required]],
      job_type : ['', [ Validators.required]],
      price_type : ['', [Validators.required]],
      price : ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      is_public: [true],
      recurring_type: ['', []],
      day: ['', []],
      date: ['', []],
      duration:['',[Validators.required, , Validators.min(1), Validators.max(24)]],
      proposed_start_time : ['Unknown', []],
      student_level: ['', [Validators.required]],
      no_of_sessions : ['', []]
    });
  }

  get form() {
    return this.createJob.controls;
  }

  formSubmit() {
   
    if (this.createJob.invalid || !this.activeCard) {
      this.createJob.markAllAsTouched();
      return;
    }
    const body = Object.assign({}, this.createJob.value);
    body.schedule_date = body.schedule_date && body.schedule_date != '' ? moment(this.form.schedule_date.value).format('YYYY-MM-DD HH:mm:ss'): body.schedule_date;
    body.start_date = body.start_date && body.start_date != '' ? moment(this.form.start_date.value).format('YYYY-MM-DD'): body.start_date;
    body.end_date = body.end_date && body.end_date != '' ? moment(this.form.end_date.value).format('YYYY-MM-DD'): body.end_date;
    let postData = new FormData;
    for(let key in body){
      if(key == 'is_public'){
        postData.append(key,body[key] == true ? '1': '0')
      } else {
      postData.append(key,body[key])
      }
    }
    if(this.attachment){
      postData.append("attachment", this.attachment);
    }
    this.studentService.createJob(postData).subscribe((res: any) => {
      console.log("created job", res)
      this.notifier.success(res.success_message);
      this.createJob.reset();
      setTimeout(() => {
        // this.location.back();
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {  tab:"JobPosted"}});
      }, 1000);
    }, err => {
      this.notifier.error(err.error.error_message);
    });

  }



  change(e) {
  }
  changeStartDate(event){
      this.form.end_date.setValue('');
      this.form.end_date.updateValueAndValidity();

  }

  getSubjectsList() {
    this.studentService.fetchSubjects().subscribe((res: any) => {
      this.subjectsList = res.data;
    });
  }

  getSubCategoryList(id) {
    if(id == ''){
      this.createJob.patchValue({sub_category_id:''});
    } else {
    this.studentService.fetchSubSubjects(id).subscribe((res: any) => {
      this.subCategoryList = res.data;
    });
  }
  }

  jobTypeChange(event) {
    if (event === 'one-time') {
    //   this.form.schedule_date.setValidators([Validators.required]);
      this.form.date.clearValidators();
      this.form.day.clearValidators();
    //   this.form.time.clearValidators();
      this.form.recurring_type.clearValidators();
      this.form.no_of_sessions.setValue('');
      this.form.no_of_sessions.clearValidators();
      // this.form.start_date.clearValidators();
      // this.form.end_date.clearValidators();
      // this.form.start_date.setValue('');
      // this.form.end_date.setValue('');
      this.jonTypeFields = false;
      this.recurringTypeField = '';
      this.form.date.setValue('');
      this.form.day.setValue('');
      // this.form.time.setValue('');
      this.form.recurring_type.setValue('');
    } else if (event === 'recurring') {
      // this.form.schedule_date.clearValidators();
      this.form.recurring_type.setValidators([Validators.required]);
      // this.form.start_date.setValidators([Validators.required]);
      // this.form.end_date.setValidators([Validators.required]);
      this.form.date.clearValidators();
      this.form.day.clearValidators();
      this.form.no_of_sessions.setValidators([Validators.required, Validators.pattern(/^[0-9]*$/)]);
      // this.form.time.clearValidators();
      // this.form.schedule_date.setValue('');
      this.jonTypeFields = true;
      this.recurringTypeField = '';
    } else {
      // this.form.schedule_date.clearValidators();
      this.form.date.clearValidators();
      this.form.day.clearValidators();
      // this.form.time.clearValidators();
      this.form.recurring_type.clearValidators();
      this.jonTypeFields = false;
      this.recurringTypeField = '';
      // this.form.start_date.clearValidators();
      // this.form.end_date.clearValidators();
      // this.form.start_date.setValue('');
      // this.form.end_date.setValue('');
      this.form.date.setValue('');
      this.form.day.setValue('');
      // this.form.time.setValue('');
      this.form.no_of_sessions.setValue('');
      this.form.no_of_sessions.clearValidators();
      this.form.recurring_type.setValue('');
      // this.form.schedule_date.setValue('');
    }
    // this.form.start_date.updateValueAndValidity();
    // this.form.end_date.updateValueAndValidity();
    // this.form.schedule_date.updateValueAndValidity();
    this.form.date.updateValueAndValidity();

    this.form.no_of_sessions.updateValueAndValidity();
    // this.form.time.updateValueAndValidity();
    this.form.recurring_type.updateValueAndValidity();
    this.form.day.updateValueAndValidity();
    this.SessionNumberChange();
  }

  recurringTypeChange(event) {
    this.recurringTypeField = event;
    if (event === 'Daily') {
      this.form.date.clearValidators();
      this.form.day.clearValidators();
      // this.form.time.setValidators([Validators.required]);
      this.createJob.controls['date'].reset();
      this.createJob.controls['day'].reset();
      this.form.date.setValue('');
      this.form.day.setValue('');
      // this.form.time.setValue('');
    } else if (event === 'Weekly') {
      this.form.date.clearValidators();
      this.form.day.setValidators([Validators.required]);
      // this.form.time.setValidators([Validators.required]);
      this.createJob.controls['date'].reset();
      this.form.date.setValue('');
      // this.form.time.setValue('');
    } else if (event === 'Monthly') {
      this.form.date.setValidators([Validators.required]);
      this.form.day.clearValidators();
      // this.form.time.setValidators([Validators.required]);
      this.createJob.controls['day'].reset();
      this.form.day.setValue('');
      // this.form.time.setValue('');

    }

    this.form.date.updateValueAndValidity();
    this.form.day.updateValueAndValidity();
    
    // this.form.time.updateValueAndValidity();
  }

  detectFiles(event) {
    this.attachment = null;
    this.attachment = event.target.files[0];
    if(this.attachment.type != 'image/png' && this.attachment.type != 'image/jpeg' && this.attachment.type !='application/pdf'
    && this.attachment.type != 'application/msword' && this.attachment.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    && this.attachment.type != 'application/vnd.ms-excel' && this.attachment.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    && this.attachment.type != 'text/plain') {
      this.attachmentErr = true;
    } else {
      this.attachmentErr = false;
    }
  //   if (files) {
  //     for (let file of files) {
  //       let reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         this.urls.push(file);
  //       }
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // 
}

onlyDigit(event){
  let value = event.key;
  if(value == 'Backspace' ){
    return true;
  }  else if(value == 'Tab' ){
    return true;
  } else if ((/^\d+$/).test(value)){
    return true;
  } else {
    event.preventDefault();
  }
}

SessionNumberChange(){
  let jobType = this.createJob.get('job_type').value;
  let sessionNumber = this.createJob.get('no_of_sessions').value
  // if((jobType == 'one-time' || jobType == 'instant-tutoring') && (sessionNumber > 1 || sessionNumber == 0)){
  //   this.createJob.get('no_of_sessions').setErrors({session : true});
  // }else if(jobType == 'recurring' && sessionNumber == 0) {
  //   this.createJob.get('no_of_sessions').setErrors({session : true});
  // } else {
  //   this.createJob.get('no_of_sessions').setErrors(null);
  // }

  if(jobType == 'recurring' && sessionNumber == 0) {
    this.createJob.get('no_of_sessions').setErrors({session : true});
  } else {
    this.createJob.get('no_of_sessions').setErrors(null);
  }

}
}
