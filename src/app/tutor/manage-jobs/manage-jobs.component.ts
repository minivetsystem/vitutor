

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common/services/common.service';
import { constantVariables } from '@app/shared/_constants/constants';
import { AlertService, AttachmentService, WebsocketService, LocalStorageService } from '@app/shared/_services';

import * as moment from 'moment';
import Swal from 'sweetalert2';
import { TutorService } from '../tutor.service';
declare const $: any;

@Component({
  selector: 'app-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss']
})
export class ManageJobsComponent implements OnInit {
  @ViewChild('reason', {static: false}) reason: ElementRef;
  currentTab = 'NewOffer';
  type = 3;
  page = 1;
  startDate = null;
  endDate = null;
  selected: {startDate: moment.Moment, endDate: moment.Moment};
  currentPage;
  pagesCount = [];
  jobsList = [];
  jobsErr ;
  lastPage = 0;
  showClearButton: boolean = false;
  acceptOfferObj = {id:null, job_title: '', accepted_price: '', job_price: undefined, job_id: null};
  rejectOfferObj = {id: null, job_title: ''};
  declineReason = '';
  acceptReason = '';
  declineSubmitted = false;
  acceptSubmitted = false;
  attachment: File;
  attachmentTypeError: boolean = false;
  attachmentFile: any = null;
  sentOfferDetails:any = null;
  attachmentsizeLimitError: boolean = false;
  terminateOfferObj = {id:null, job_title: ''};
  terminateReason='';
  terminateSubmitted=false;
  withdrawObj = {id:null, job_title: ''};
  revokeReason='';
  timer = '';
  interval;
  showBtn = '';
  revokeSubmitted=false;
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  menuToggle;
  disputePeroid = 0;
  applicant;
  ratingForm = {rating:null, review: '', job_title: '', schedule_date: '', student_name: ''};
  earlySessionObj;
  userId;
  earlyReasonErr;
  userInfo;
  timezone
  constructor(private tutorService: TutorService, private notifier: AlertService, private commonService: CommonService,
     private router: Router, private aroute: ActivatedRoute, private attachmentService: AttachmentService, private websocketService: WebsocketService, private localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.aroute.queryParams.subscribe((tab:any)=> {
      if(tab.hasOwnProperty('tab')){
        this.currentTab = tab.tab
      } 
      this.tabChange(this.currentTab)
    })
    this.userId = this.localStorageService.getRefId();
    this.userInfo = this.localStorageService.getUserData();
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.localStorageService.timeZone.subscribe((res:any)=> {
      if(res){
        this.timezone = res
      }else {
        this.timezone = this.localStorageService.getTimeZone();
      }
    })
    
    this.manageJobList();
    this.getClaimPeriod();
  }

  manageJobList() {
    this.jobsErr = undefined;
    const body = {
      start_date : this.startDate,
      end_date : this.endDate,
      type : this.type,
      page: this.page
    };

    this.tutorService.fetchJobList(body).subscribe((res: any) => {
      let momentNow = moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A')
      if(res.data.data.length > 0){
        this.jobsErr = 0
      } else {
        this.jobsErr = 1;
      }
      res.data.data.forEach(ele => {
       
        ele.schedule_date = moment(ele.schedule_date, 'YYYY-MM-DD HH:mm:ss').format('dddd MM-DD-YYYY hh:mm A')
       let currentDate = moment().tz(this.timezone).format('MM-DD-YYYY'); 

        if(this.type == 5){
         
        if(ele.date == moment(currentDate, 'MM-DD-YYYYY').format('YYYY-MM-DD')){
          ele['showBtn'] = true
          ele.greyArea = true;
          let nowDate = moment().tz(this.timezone).format('YYYY-MM-DD')
          let nowTime = moment().format('HH:mm:ss');
         
          let start_time = moment(currentDate + ' ' +ele.start_time, 'MM-DD-YYYY HH:mm:ss')
          let end_time = moment(currentDate + ' ' +ele.end_time, 'MM-DD-YYYY HH:mm:ss')
          if(momentNow.isBetween(start_time,end_time)){
              ele.session_status = 'started';
              ele['session_early'] = false;
              
          } else if(momentNow.isBefore(start_time)) {
            ele.session_status = 'pending'
            this.timerFunction(ele);
          } else if(momentNow.isAfter(end_time)) {
            ele['session_early'] = false;
            ele.session_status = 'completed';
          } 
          
        } 
        
        else {
          ele.session_status = 'pending';
          ele.greyArea = false;
          ele['showBtn'] = false;
        }
      } else if (this.type == 6){
        ele.claim_date = moment(ele.schedule_date, 'dddd MM-DD-YYYY hh:mm A').add(this.disputePeroid, 'day').format('dddd MM-DD-YYYY hh:mm A');
        if(momentNow.isAfter(moment(ele.claim_date, 'dddd MM-DD-YYYY hh:mm A'))){
          ele.can_claim = true;
        } else {
          ele.can_claim = false;
        }
      }
      });
  
      this.currentPage = res.data.current_page;
      this.lastPage = res.data.last_page;
      this.pagesCount = [];
      for (let i = 1 ; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }
      this.jobsList = res.data.data;
     
    }, err => {
      this.jobsList = [];
      this.jobsList = [];
      this.pagesCount = [];
      this.lastPage = 0;
      this.page = 1;
      this.jobsErr = 1;
    });
  }

  change(e) {
    if (e.startDate != null) {
      this.startDate = e.startDate.year() + '-' + (e.startDate.month() + 1) + '-' + e.startDate.date() ;
      this.page = 1;
    }
    if (e.endDate != null) {
      this.endDate = e.endDate.year() + '-' + (e.endDate.month() + 1) + '-' + e.endDate.date();
    }
    if ((this.startDate != null) && (this.endDate != null)) {
      this.showClearButton = true;
    } else {
      this.showClearButton = false;
      this.selected = null;
    }
    
    this.manageJobList();
  }

  clearBtn() {
    this.selected = null;
    this.startDate = null;
    this.endDate = null;
    this.showClearButton = false;
    this.page = 1;
  }

  tabChange(tab) {
    this.currentTab = tab;
    this.page = 1;
    if (tab === 'All') { this.type = 7;
    } else if (tab === 'Applied') { this.type = 4;
    } else if ( tab === 'Accepted') { this.type = 8;
    } else if (tab === 'NewOffer') { this.type = 3;
    } else if ( tab === 'NewInvite') { this.type = 2;
    } else if (tab === 'Closed') { this.type = 7; 
    }else if (tab === 'Upcoming') { this.type = 5; 
    } else if(tab === 'Completed') { this.type = 6; }

    this.manageJobList();
  }

  loadMore(page) {
    this.page = page;
    this.manageJobList();
  }

  acceptOffer(obj) {
    this.acceptOfferObj = obj;
    $('#acceptOfferModal').modal('show');
  }

  rejectOffer(obj) {
    this.rejectOfferObj = obj;
    $('#rejectOfferModal').modal('show');
  }

  terminateOffer(obj) {
    this.terminateOfferObj = obj;
    $('#terminateOfferModal').modal('show');
  }
  withdrawOffer(obj) {
    this.withdrawObj = obj;
    $('#CancelAppliedJobModal').modal('show');
  }

  acceptOfferSubmit() {
    this.acceptSubmitted = true;
    if(this.acceptOfferObj.id == null)  {
      return;
    }
    // if(this.acceptReason == '') {
    //   return;
    // }
    const body = {
      offer_id: this.acceptOfferObj.id,
      status: 1,
      comment: this.acceptReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
        if(res.success){
          this.notifier.success(res.success_message);
          this.commonService.sendNotification({ receiver_id: this.acceptOfferObj.id,
            reference_id: this.acceptOfferObj.job_id, 
            notification: this.acceptOfferObj.job_title + ' is accepted by Tutor ',
            notification_message: this.acceptReason,
            type:  'job_offer'})
          this.acceptOfferObj = {id: null, job_title: '', accepted_price: '', job_price: '', job_id: null};
          this.rejectOfferObj = {id: null, job_title:''};
          this.acceptReason = '';
          this.acceptSubmitted = false;
          this.manageJobList();

        } else {
          this.notifier.error(res.error_message);
        }
        
        $('#acceptOfferModal').modal('hide');
       
        
    }, err => {
      this.notifier.error(err.error.error_message);
    })

  }

  rejectOfferSubmit() {
    this.declineSubmitted = true;
    if(this.rejectOfferObj.id == null)  {
      return;
    }
    if(this.declineReason == ''){
      return;
    }
    const body = {
      offer_id: this.rejectOfferObj.id,
      status: 2,
      comment: this.declineReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        this.commonService.sendNotification({ receiver_id: this.acceptOfferObj.id,
          reference_id: this.acceptOfferObj.job_id, 
          notification: this.acceptOfferObj.job_title + ' is rejected by Tutor ',
          notification_message: this.declineReason,
          type:  'job_offer'})
        this.acceptOfferObj = {id: null, job_title: '', accepted_price: '', job_price: '', job_id: null};
        this.rejectOfferObj = {id: null, job_title:''};
        this.declineReason = '';
        this.declineSubmitted = false;
        $('#rejectOfferModal').modal('hide');
        this.manageJobList();
    }, err => {
      this.notifier.error(err.error.error_message);
    })
  }
  terminateOfferSubmit() {
    this.terminateSubmitted = true;
    if(this.terminateOfferObj.id == null)  {
      return;
    }
    if(this.terminateReason == ''){
      return;
    }
    const body = {
      offer_id: this.terminateOfferObj.id,
      status: 5,
      comment: this.terminateReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        this.acceptOfferObj = {id: null, job_title: '', accepted_price: '', job_price: '', job_id: null};
        this.rejectOfferObj = {id: null, job_title:''};
        this.terminateOfferObj = {id: null, job_title:''};
        this.terminateReason = '';
        this.terminateSubmitted = false;
        $('#terminateOfferModal').modal('hide');
        this.manageJobList();
    }, err => {
      this.notifier.error(err.error.error_message);
    })
  }

  withdrawOfferSubmit() {
    this.revokeSubmitted = true;
    if(this.withdrawObj.id == null)  {
      return;
    }
    if(this.revokeReason == ''){
      return;
    }
    const body = {
      id: this.withdrawObj.id,
      comment: this.revokeReason
    }

    this.tutorService.withdrawOffer(body).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        this.withdrawObj = {id: null, job_title:''};
        this.revokeReason = '';
        this.revokeSubmitted = false;
        $('#CancelAppliedJobModal').modal('hide');
        this.manageJobList();
    }, err => {
      this.notifier.error(err.error.error_message);
    })
  }

  closeRejectModal() {
    this.declineReason = '';
    this.declineSubmitted = false;
    $('#rejectOfferModal').modal('hide');
  }

  closeAcceptModal() {
    this.acceptReason = '';
    this.acceptSubmitted = false;
    $('#acceptOfferModal').modal('hide');
  }
  closeTerminateModal() {
    this.terminateReason = '';
    this.terminateSubmitted = false;
    $('#terminateOfferModal').modal('hide');
  }
  closeRevokeModal() {
    this.terminateReason = '';
    this.terminateSubmitted = false;
    $('#CancelAppliedJobModal').modal('hide');
  }

  noType(event){
    event.preventDefault();
  }

  revokeJob(job_id){
  }

  markSessionCompleted(job){
    Swal.fire({
      title: 'Confirm?',
      html: '<p>Do you want to mark <strong> ' + job.job_title + '</strong> session as completed ?</p>',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let formBody = new FormData()
        formBody.append('id', job.id)
        this.tutorService.markSessionComplete(formBody).subscribe((res: any) => {
          if (res.success_message) {
            this.manageJobList();
            Swal.fire(
              'Completed!',
              res.success_message,
              'success'
            );
          }
        }, err => {
          Swal.fire(
            'Error',
            err.error_message,
            'error'
          );
        });
        // For more information about handling dismissals please visit
        // https://sweetalert2.github.io/#handling-dismissals
      }
    });
  }

  timerFunction(job){
    let momentNow = moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A')
    let countDownDate = moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').valueOf();
    let endTime = moment(job.end_time, 'HH:mm:ss').valueOf();
    let now = moment().tz(this.timezone).valueOf();
    let distance = countDownDate - now;
    let endDistance = endTime - now;
    this.timer = '';
   
     let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let endHours = Math.floor((endDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let endMinutes = Math.floor((endDistance % (1000 * 60 * 60 )) / (1000 * 60));
      

    if(moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').format('DD/MM/YYYY') == moment().tz(this.timezone).format('DD/MM/YYYY') ){
    // Update the count down every 1 second
    
    if(hours <= 0 && minutes <= 45){
      job['session_early'] = true;
      job['showBtn'] = true
      this.showBtn = 'disabled';
      this.interval = setInterval(() => {
        let countDownDate1 = moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').valueOf();
      // Get today's date and time
      let now1 = new Date().getTime();
      let distance1 = countDownDate1 - now1;
    
      // Find the distance between now and the count down date
      // let hours1 = Math.floor((distance1 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes1 = Math.floor((distance1 % (1000 * 60 * 60)) / (1000 * 60));
      let seconds1 = Math.floor((distance1 % (1000 * 60)) / 1000);
    
      // Time calculations for days, hours, minutes and seconds
      // let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      
    
      // Display the result in the element with id="demo"
      if(minutes1 <= 15){
        // job['session_early'] = false;
      this.timer =  'Session Starts in: ' + minutes1 + "m " + seconds1 + "s ";
      }
      // If the count down is finished, write some text
      if (distance1 < 0) {
        job['session_status'] = 'started';
        job['session_early'] = false;
        this.timer = '';
         
          // job['showBtn'] = true
        clearInterval(this.interval);
      }
    }, 1000);
  } 
  else if (endHours >= 0 && endMinutes >= 0 && momentNow.isAfter(moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A'))) {
    job['showBtn'] = true;
    this.showBtn = 'show';
    // job['session_status'] = 'started';
  } else {
    job['showBtn'] = false;
    this.showBtn = 'none';
  }
  } else {
    job['showBtn'] = false;
  }
  }

  claimPayment(sessionId){
    this.tutorService.requestSessionPayment(sessionId).subscribe((res: any)=> {
      if(res.success){
        this.notifier.success(res.success_message || 'Request successfull');
        let session = this.jobsList.find((obj)=> obj.id === sessionId);
        session ? session['payment_claim'] = 1 : '';
        this.manageJobList();
      } else {
        this.notifier.error(res.success_message || res.error_message);
      }
    }, err => this.notifier.error(err.error.error_message)
    )
  }

  getClaimPeriod(){
    this.tutorService.fetchDisputePeroid().subscribe((res:any)=> {
      this.disputePeroid = res.data.disburse_after
    });
  }

  startSession(sessionId){
    this.tutorService.startSession(sessionId).subscribe((res: any) => {
      if(res.success){
        this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: sessionId});
        this.router.navigate(['/video'])
      } else {
        this.notifier.error(res.success_message || res.error_message)
      }
    }, err => {
      this.notifier.error(err.error.error_message)
    })
  }

  appliedJob(job){
    this.tutorService.appliedJobData({id:job.job_id}).subscribe((res:any)=>{
      this.applicant = res.data;
      // this.applicant.user.avg_rating = Math.round(this.applicant.user.avg_rating).toFixed(1)
      $('#view_applicants').modal('show');
    })
  }

  openRatingModal(job){
    this.ratingForm = {rating: (job.job_session_review && job.job_session_review.rating )? job.job_session_review.rating: 0, review: (job.job_session_review && job.job_session_review.review) ? job.job_session_review.review: '', 
                        job_title: job.job_title, 
                        student_name: job.first_name + ' ' + job.last_name, 
                        schedule_date: job.schedule_date } 
    $('#reviewAndratingModal').modal('show');
  }

  closeRatingModal(){
    $('#reviewAndratingModal').modal('hide');
    this.ratingForm.rating = 0;
    this.ratingForm.review = ''
  }

  downloadAttachment(object,type) {
    let data = {
      type : type,
      mime_type : object.file_type,
      id: object.id
    }
    const Url = `attachment/${data.type}/${data.id}`;
    this.attachmentService.downloadFile(Url, object.filename || 'offer_attachment');
  }

  navigate(url){
    $('#view_applicants').modal('hide');
    this.router.navigate([url]);
  }

  earlySessionModal(job){ 
    this.earlySessionObj = job;
    $('#earlySession').modal('show');
  }

  earlyStartRequest(msg){
    // if(!msg || msg == ''){
    //   this.earlyReasonErr = true;
    //   return;
    // }
    this.earlyReasonErr = false;
      
    this.websocketService.emit('early_session_start_request', {
      job_id: this.earlySessionObj.job_id? this.earlySessionObj.job_id: null,
      receiver_id: this.earlySessionObj.refId? this.earlySessionObj.refId: null,
      reference_id : this.earlySessionObj.id? this.earlySessionObj.id: null,
      notification: 'Tutor wants to early start session '+this.earlySessionObj.job_title? this.earlySessionObj.job_title: null,
      notification_message: msg,
      type: 'session_early_start',
      tutor_id: this.userId,
      job_title: this.earlySessionObj.job_title? this.earlySessionObj.job_title: null,
      full_name: this.userInfo.full_name,
      schedule_date: this.earlySessionObj.schedule_date? moment(this.earlySessionObj.start_time): null,
      payment : this.earlySessionObj.transaction_id ? true : false
    });

    $('#earlySession').modal('hide');
    this.reason.nativeElement.value= '';
    this.notifier.success('Request sent to student successFully');
  }

  sendReason(event){
    if(event.target.value == ''){
      this.earlyReasonErr = true;
    } else {
      this.earlyReasonErr = false;
    }
  }


}

