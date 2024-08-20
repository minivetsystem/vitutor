
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//import { AlertService } from '../app/shared/_services';
import { AlertService, LocalStorageService, AttachmentService } from '../../shared/_services';

import { JobdetailService } from '../jobdetail.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { CommonService } from '@app/common/services/common.service';


declare const $: any;

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  @ViewChild('price', {static: false}) price: ElementRef;
  jobDetail;
  error = false;
  pricePattern =  /^[0-9]+(\.[0-9]{1,2})?$/;
  offerErr = false;
  ApplyErr = false;
  applySubmitted:boolean = false;
  attachmentTypeError: boolean = false;
  attachmentFile: any = null;
  attachmentsizeLimitError: boolean = false;
  attachmentRequiredError: boolean = false;
  uploadDocument = null;
  menuToggle;
  applicant;
  err;
  isTutor;
  constructor(
    private activeRoute: ActivatedRoute,
    private jobService: JobdetailService,
    private router: Router,
    private notifier: AlertService,
    private loaderService: NgxSpinnerService,
    private location: Location,
    private attachmentService: AttachmentService,
    private commonService : CommonService,
    private localStorageService: LocalStorageService

    ) { }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.isTutor = this.localStorageService.getRole() == 'tutor'? true: false;
    this.loaderService.show();
    this.activeRoute.params.subscribe(res => {
      this.jobService.getJobDetail(res.slug).subscribe((result: any) => {
        if (result.success == false) {
          this.error = true;
          this.err = {error : result.error_message};
        } else {
        this.jobDetail = result.data;
        this.error = false;
        this.uploadDocument = (result.data.job_attachment && result.data.job_attachment.length > 0) ? result.data.job_attachment : null;
        }
        // this.price.nativeElement.value = this.jobDetail.price.substring(1, this.jobDetail.price.length);
        // this.loaderService.hide();
      }, error => {
        // this.loaderService.hide();
        this.error = true;
        this.err = error;
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
          notification: 'Student has sent invite for the job ' + this.jobDetail.job_title,
          notification_message:  message,
          type:  'job_invite'})
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

  downloadFile(id: number, fileName: string) {
    let url = "attachment/job-attachments/" +id;
    this.attachmentService.downloadFile(url, fileName);
  }

  appliedJob(id){
    this.jobService.appliedJobData({id}).subscribe((res:any)=>{
      this.applicant = res.data;
      $('#view_applicants').modal('show');
    })
  }

  downloadAttachment(object,type) {
    
    
      let data = {
        type : type,
        mime_type : object.file_type,
        id: object.id
      }
      const Url = `attachment/${data.type}/${data.id}`;
      this.attachmentService.downloadFile(Url, object.name);
   
  }

  navigate(url){
    $('#view_applicants').modal('hide');
    this.router.navigate([url]);
  }



}



