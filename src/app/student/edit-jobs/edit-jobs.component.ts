import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService, LocalStorageService, AttachmentService } from '../../shared/_services/index';
import { StudentService } from '../student.service';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { constantVariables } from '@app/shared/_constants/constants';
import { CommonService } from '@app/common/services/common.service';

@Component({
  selector: 'app-edit-jobs',
  templateUrl: './edit-jobs.component.html',
  styleUrls: ['./edit-jobs.component.scss']
})
export class EditJobsComponent implements OnInit {
  createJob: FormGroup;
  subjectsList = [];
  jobDetail:any = {status: 'Pending'};
  public;
  subCategoryList = [];
  jobTypeFields = false;
  recurringTypeField = '';
  priceType = ['Hourly','Fixed'];
  currentDate;
  attachment = null;
  attachmentErr: boolean = false;
  uploadedDocument=null;
  swalErrorOption = constantVariables.swalErrorOption;
  menuToggle;
  constructor(private fb: FormBuilder,
              private notifier: AlertService,
              private studentService: StudentService,
              private activeRoute: ActivatedRoute,
              private location: Location,
              private attachmentService : AttachmentService,
              private commonService: CommonService
              ) {
    this.initCrateJobForm();
  }

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.getSubjectsList();
    this.activeRoute.params.subscribe(res => {
      if(res.slug !== undefined) {
      this.studentService.getJobDetail(res.slug).subscribe((result: any) => {
        this.jobDetail = Object.assign(this.jobDetail,result.data);
        this.public = this.jobDetail.is_public == '1' ? true : false;
        // const category = this.subjectsList.find(e => {
        //   return e.category_name === this.jobDetail.job_category;
        // });
        this.getSubCategoryList(this.jobDetail.job_category_data);
        this.createJob.patchValue({
          job_title: this.jobDetail.job_title,
          job_description : this.jobDetail.job_description,
          job_category: this.jobDetail.job_category_data,
          job_type : this.jobDetail.job_type_data,
          sub_category_id: this.jobDetail.sub_category_data,
          // schedule_date: moment(this.jobDetail.job_schedule_date,'dddd MM-DD-YYYY hh:mm a').toISOString(),
          // schedule_date: moment(this.jobDetail.job_schedule_date,'YYYY-MM-DD H:mm:ss').toISOString(),
          price_type: this.jobDetail.price_type,
          price : this.jobDetail.price.slice(1),
          day: this.jobDetail.job_recurring ? this.jobDetail.job_recurring.day : '',
          date: this.jobDetail.job_recurring ? this.jobDetail.job_recurring.date : '',
          // time: this.jobDetail.job_recurring ? this.jobDetail.job_recurring.time : '',
          recurring_type: this.jobDetail.job_recurring ? this.jobDetail.job_recurring.recurring_type : '',
          is_public: this.public,
          duration: this.jobDetail.duration,
          // experince_level: this.jobDetail.experince_level,
          student_level : this.jobDetail.student_level || '',
          proposed_start_time: this.jobDetail.proposed_start_time,
          // start_date: this.jobDetail.job_recurring && this.jobDetail.job_recurring.start_date ? moment(this.jobDetail.job_recurring.start_date,'YYYY-MM-DD').toISOString() : '',
          // end_date : this.jobDetail.job_recurring && this.jobDetail.job_recurring.end_date ? moment(this.jobDetail.job_recurring.end_date,'YYYY-MM-DD').toISOString() : '',
          instant_tutoring : this.jobDetail.instant_tutoring && this.jobDetail.instant_tutoring == 1 ? true: false,
          no_of_sessions : this.jobDetail.no_of_sessions || ''

        });
        this.jobTypeFields =  (this.jobDetail.job_type_data == 'one-time') ? false : true;
        this.recurringTypeField = this.jobDetail.job_recurring && this.jobDetail.job_recurring.recurring_type ? this.jobDetail.job_recurring.recurring_type : '';
        this.uploadedDocument = this.jobDetail.job_attachment && this.jobDetail.job_attachment.length > 0? this.jobDetail.job_attachment[0] : null;
        this.jobTypeChange(this.jobDetail.job_type_data.toLowerCase());
        // if(this.jobDetail.job_type_data == 'recurring'){
        //   this.recurringTypeChange(this.jobDetail.job_recurring.recurring_type);
        // }
      });
     
    } else {
      this.notifier.error('Not a valid Job');
    }
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
      // schedule_date : ['', []],
      price_type : ['', [Validators.required]],
      price : ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      is_public: [true],
      recurring_type: ['', []],
      // time: ['', []],
      day: ['', []],
      date: ['', []],
      duration: ['',[Validators.required, Validators.min(1), Validators.max(24)]],
      // start_date: [''],
      // end_date: [''],
      instant_tutoring : [false],
      proposed_start_time : ['Unknown', []],
      student_level : ['', [Validators.required]],
      no_of_sessions : ['', []]
    });
  }

  get form() {
    return this.createJob.controls;
  }

  formSubmit() {
    if (this.createJob.invalid) {
      const invalid = [];
      const controls = this.createJob.controls;
      for (const name in controls) {
          if (controls[name].invalid) {
              invalid.push({name, error : controls[name].errors });
          }
      }
      this.createJob.markAllAsTouched();
      return;
    }
    const body = Object.assign({}, this.createJob.value, {job_id : this.jobDetail.id});
    // body.schedule_date = body.schedule_date && body.schedule_date != '' ? moment(this.form.schedule_date.value).format('YYYY-MM-DD HH:mm:ss'): '';
    // body.start_date = body.start_date && body.start_date != '' ? moment(this.form.start_date.value).format('YYYY-MM-DD'): body.start_date;
    // body.end_date = body.end_date && body.end_date != '' ? moment(this.form.end_date.value).format('YYYY-MM-DD'): body.end_date;
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
    this.studentService.updateJob(postData).subscribe((res: any) => {
      if(res.success){
        this.notifier.success(res.success_message);
        this.goBack();
      } else if(!res.success) {
        this.notifier.error(res.error_message);
      }
     

    }, err => {
      this.notifier.error(err.error.error_message);
    });
  }

  createSubmit() {
    if (this.createJob.invalid) {
      this.createJob.markAllAsTouched();
      return;
    }
    const body = Object.assign({}, this.createJob.value);
    body.schedule_date = body.schedule_date && body.schedule_date != '' ? moment(this.form.schedule_date.value).format('YYYY-MM-DD HH:mm:ss'): '';
    body.start_date = body.start_date && body.start_date != '' ? moment(this.form.start_date.value).format('YYYY-MM-DD'): body.start_date;
    body.end_date = body.end_date && body.end_date != '' ? moment(this.form.end_date.value).format('YYYY-MM-DD'): body.end_date;
    let postData = new FormData;
    for(let key in body){
      postData.append(key,body[key])
    }
    if(this.attachment){
      postData.append("attachment", this.attachment);
    }
    this.studentService.createJob(postData).subscribe((res: any) => {
      this.notifier.success(res.success_message);
      this.createJob.reset();
      // setTimeout(() => {
      //   this.location.back();
      // }, 1000);

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
      const result = Object.assign({}, res);
      this.subjectsList = result.data;
    });
  }
  getSubCategoryList(id) {
    if(id == ''){
      this.createJob.patchValue({sub_category_id: ''})
    } else {

    
    this.studentService.fetchSubSubjects(id).subscribe((res: any) => {
      const result = Object.assign({}, res);
      this.subCategoryList = result.data;
    }); 
  }
  }

 
  jobTypeChange(event) {
    if (event === 'one-time') {
      // this.form.schedule_date.setValidators([Validators.required]);
      this.form.date.clearValidators();
      this.form.day.clearValidators();
      // this.form.time.clearValidators();
      this.form.recurring_type.clearValidators();
      this.form.no_of_sessions.setValue('');
      this.form.no_of_sessions.clearValidators();
      this.jobTypeFields = false;
      this.recurringTypeField = '';
      this.form.date.setValue('');
      this.form.day.setValue('');
      // this.form.time.setValue('');
      this.form.recurring_type.setValue('');
      // this.form.start_date.clearValidators();
      // this.form.end_date.clearValidators();
      // this.form.start_date.setValue('');
      // this.form.end_date.setValue('');
    } else if (event === 'recurring') {
      // this.form.schedule_date.clearValidators();
      this.form.recurring_type.setValidators([Validators.required]);
      this.form.date.clearValidators();
      this.form.day.clearValidators();
      this.form.no_of_sessions.setValidators([Validators.required, Validators.pattern(/^[0-9]*$/)]);
      // this.form.time.clearValidators();
      // this.form.schedule_date.setValue('');
      this.jobTypeFields = true;
      this.recurringTypeField = '';
      // this.form.start_date.setValidators([Validators.required]);
      // this.form.end_date.setValidators([Validators.required]);
    } else {
      // this.form.schedule_date.clearValidators();
      this.form.date.clearValidators();
      this.form.day.clearValidators();
      // this.form.time.clearValidators();
      this.form.recurring_type.clearValidators();
      this.jobTypeFields = false;
      this.recurringTypeField = '';
      this.form.date.setValue('');
      this.form.day.setValue('');
      // this.form.time.setValue('');
      this.form.recurring_type.setValue('');
      this.form.no_of_sessions.setValue('');
      this.form.no_of_sessions.clearValidators();
      // this.form.schedule_date.setValue('');
      // this.form.start_date.clearValidators();
      // this.form.end_date.clearValidators();
      // this.form.start_date.setValue('');
      // this.form.end_date.setValue('');
    }
    // this.form.start_date.updateValueAndValidity();
    // this.form.end_date.updateValueAndValidity();
    // this.form.schedule_date.updateValueAndValidity();
    this.form.date.updateValueAndValidity();
    // this.form.time.updateValueAndValidity();
    this.form.no_of_sessions.updateValueAndValidity();
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


downloadFile(id: number, fileName: string) {
  let url = "attachment/job-attachments/" +id;

  this.studentService.downloadAttachment(id).subscribe((res: any) => {
    const dataType = res.type;
    const binaryData = [];
    binaryData.push(res);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(
      new Blob(binaryData, { type: dataType })
    );
    if (fileName) { downloadLink.setAttribute('download', fileName); }
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }, err => {
    this.notifier.error('Unable to download')
  });
  // this.attachmentService.downloadFile(url, fileName);
}
removeAttachment(id){
  this.studentService.removeAttachment(id).subscribe((res: any) => {
    this.uploadedDocument = null;
    this.notifier.success('File removed successfully');
  }, err => {
    this.notifier.error('Unable to remove');
  })
}
onlyDigit(event){
  let value = event.key;
  if(value == 'Backspace' ){
    return true;
  } else if(value == '0'){
    event.preventDefault();
  }else if ((/^\d+$/).test(value)){
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


