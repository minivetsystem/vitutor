import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//import { AlertService } from '../app/shared/_services';
import { AlertService, LocalStorageService } from '../../shared/_services';

import { SearchJobService } from '../search-job.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { CommonService } from '../../common/services/common.service'

declare const $: any;

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {
  @ViewChild('price', {static: false}) price: ElementRef;
  jobDetail: any;
  applicant;
  error: boolean;
  pricePattern =  /^[0-9]+(\.[0-9]{1,2})?$/;
  offerErr = false;
  ApplyErr = false;
  applySubmitted:boolean = false;
  attachmentTypeError: boolean = false;
  attachmentFile: any = null;
  attachmentsizeLimitError: boolean = false;
  attachmentRequiredError: boolean = false;
  recordErr: boolean; 
  constructor(
    private activeRoute: ActivatedRoute,
    private jobService: SearchJobService,
    private route: Router,
    private notifier: AlertService,
    private loaderService: NgxSpinnerService,
    private location: Location,
    private commonService: CommonService

    ) { }

  ngOnInit() {
    this.loaderService.show();
    this.activeRoute.params.subscribe(res => {
      this.jobService.getJobDetail(res.slug).subscribe((result: any) => {
        this.jobDetail = result.data;
        this.error = false;
        // this.price.nativeElement.value = this.jobDetail.price.substring(1, this.jobDetail.price.length);
        // this.loaderService.hide();
      }, error => {
        // this.loaderService.hide();
        this.error = true;
      });
    });
  }

  ngAfterInit() {
    this.loaderService.hide();
  }
  goBack() {
    this.location.back();
  } 
  imgLoadError(event) {
    event.target.src = 'assets/img/images/user_icon.svg';
  }


  applyJob(message, price) {
    this.applySubmitted = true;
    if (!this.pricePattern.test(price) ) {
      this.ApplyErr = true;
      return;
    } else if(this.attachmentTypeError || this.attachmentsizeLimitError ){
      return;
    }
    // const body = {
    //   job_id: this.jobDetail.id,
    //   message,
    //   offer_price: price
    // };
    const applyJob = new FormData();
    if(this.attachmentFile){
      applyJob.append('attachment', this.attachmentFile);
    }
    applyJob.append('job_id', this.jobDetail.id);
    applyJob.append('message', message);
    applyJob.append('offer_price', price);
    this.jobService.applyJob(applyJob).subscribe((res: any) => {

      if(res.success == true){
        this.notifier.success(res.success_message);
        $('#apply_job').modal('hide');
        this.ApplyErr = false;
        this.jobDetail.apply_status = true;
        this.applySubmitted = false;
        this.commonService.sendNotification({ receiver_id: this.jobDetail.user_id,
          reference_id: this.jobDetail.id, 
          notification: 'Tutor has applied for the job ' + this.jobDetail.job_title,
          notification_message:  message,
          type:  'job_applied'})
      } else {
        this.notifier.error(res.error_message);
      }
    }, err => {
      this.notifier.error(err.error.error_message);
      this.ApplyErr = false;
      this.applySubmitted = false;
    });
  }


  sendOffer(message, price) {
    if (!this.pricePattern.test(price)) {
      this.offerErr = true;
      return;
    }
    const body = {
      job_id: this.jobDetail.id,
      message,
      offer_price: price
    };
    this.jobService.sendOffer(body).subscribe((res: any) => {
      this.notifier.success(res.success_message);
      $('#apply_job').modal('hide');
      this.offerErr = false;
      this.jobDetail.apply_status = true;
    }, err => {
      this.notifier.error(err.error.error_message);
      this.offerErr = false;
    });
  }
  onSelectAttachment(evt) {
    // this.sizeLimitError = false;
    this.attachmentRequiredError = false;
    this.attachmentTypeError = false;
    this.attachmentsizeLimitError = false;
    this.attachmentFile = evt.target.files[0];
    const fileSize = parseFloat(Number(this.attachmentFile.size/1024/1024).toFixed(2));
    if(this.attachmentFile.type != 'image/png' && this.attachmentFile.type != 'image/jpeg' && this.attachmentFile.type !='application/pdf'
    && this.attachmentFile.type != 'application/msword' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    && this.attachmentFile.type != 'application/vnd.ms-excel' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    && this.attachmentFile.type != 'text/plain') {
      this.attachmentFile = null;
      this.attachmentTypeError = true;
    }
    if(fileSize > 5) {
      this.attachmentFile = null;
      this.attachmentsizeLimitError = true;
    }                
  }

  appliedJob(job_id){

    this.jobService.appliedJobData({job_id}).subscribe((res:any)=>{
    })
  }



  


}


