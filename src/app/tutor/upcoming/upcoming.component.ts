

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
  selector: 'app-upcoming',
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss']
})
export class UpcomingComponent implements OnInit {
  @ViewChild('reason', {static: false}) reason: ElementRef;
  currentTab = 'Upcoming';
  type = 5;
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
      
      if(res.data.data.length > 0){
        this.jobsErr = 0
      } else {
        this.jobsErr = 1;
      }
      res.data.data.forEach(ele => {
       let timeZone = this.localStorageService.getTimeZone();
      //  let momentNow = moment(moment().tz(timeZone).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A')
      let momentNow=moment()
        ele.schedule_date = moment(ele.schedule_date, 'YYYY-MM-DD HH:mm:ss').format('dddd MM-DD-YYYY hh:mm A')
       let currentDate = momentNow.format('MM-DD-YYYY'); 

        if(this.type == 5){
         
        if(ele.date == moment().format('YYYY-MM-DD')){
          ele['showBtn'] = true
          ele.greyArea = true;
          let nowDate = momentNow.format('YYYY-MM-DD')
          let nowTime = momentNow.format('HH:mm:ss');
          let start_time = moment(ele.start_time, 'YYYY-MM-DD HH:mm:ss')
          let end_time = moment(ele.end_time, 'YYYY-MM-DD HH:mm:ss')
       
          if(momentNow.isBetween(start_time,end_time)){
              ele.session_status = 'started';
              ele['session_early'] = false;
              
          } else if(momentNow.isBefore(start_time)) {
            ele.session_status = 'pending';
            ele.timer = ''
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
    // if (e.startDate != null) {
    //   this.startDate = e.startDate.year() + '-' + (e.startDate.month() + 1) + '-' + e.startDate.date() ;
    //   this.page = 1;
    // }
    // if (e.endDate != null) {
    //   this.endDate = e.endDate.year() + '-' + (e.endDate.month() + 1) + '-' + e.endDate.date();
    // }
    if ((this.startDate != null) && (this.endDate != null)) {
      this.startDate = e.startDate.year() + '-' + (e.startDate.month() + 1) + '-' + e.startDate.date() ;
      this.endDate = e.endDate.year() + '-' + (e.endDate.month() + 1) + '-' + e.endDate.date();
      this.showClearButton = true;
      this.manageJobList();

    } else {
      this.showClearButton = false;
      this.selected = null;
    }
    
  }

  clearDateFilter() {
    this.selected = null;
    this.startDate = null;
    this.endDate = null;
    this.showClearButton = false;
    this.page = 1;
  }

 
  loadMore(page) {
    this.page = page;
    this.manageJobList();
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
    let momentNow = moment()
    let countDownDate = moment(job.start_at).valueOf();
    let endTime = moment(job.end_at).valueOf();
    let now = momentNow.valueOf();
    let distance = countDownDate - now;
    let endDistance = endTime - now;
    // this.timer = '';
   
     let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let endHours = Math.floor((endDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let endMinutes = Math.floor((endDistance % (1000 * 60 * 60 )) / (1000 * 60));
    if(moment(job.start_at).format('DD/MM/YYYY') == momentNow.format('DD/MM/YYYY') ){
    
    if(hours <= 0 && minutes <= 35){
      job['session_early'] = false;
      job['showBtn'] = true
      // job['showBtn'] = 'disabled';
      job['interval'] = setInterval(() => {
    
      // Find the distance between now and the count down date
      // let hours1 = Math.floor((distance1 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes1 = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds1 = Math.floor((distance % (1000 * 60)) / 1000);
      distance -= 1000
     
      if(minutes1 <= 15){
        job['session_early'] = true;
      job['timer'] =  'Session Starts in: ' + minutes1 + "m " + seconds1 + "s ";
      }
      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(job['interval']);
        if(job['session_status'] == 'pending'){
          job['session_status'] = 'started';
        }
        job['session_early'] = false;
        job['timer'] = '';
      }
    }, 1000);
  } 
  else if (endHours >= 0 && endMinutes >= 0 && momentNow.isAfter(moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A'))) {
    job['showBtn'] = true;
    // this.showBtn = 'show';
    // job['session_status'] = 'started';
  } else {
    job['showBtn'] = false;
    // this.showBtn = 'none';
  }
  } else {
    job['showBtn'] = false;
  }
  }

  

  

  startSession(session){
    this.tutorService.startSession(session.id).subscribe((res: any) => {
      
      if(res.success){
       
        this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: session.id});
        // this.router.navigate(['/video'])
        this.websocketService.emit(`start_session`, {
          full_name: this.userInfo.full_name,
          session_id: session.id,
          tutor_id: this.userId,
          job_id: session.job_id,
          job_title: session.job_title,
          student_id: session.refId
        });
        let newRelativeUrl = this.router.createUrlTree(['/video']);
        let baseUrl = window.location.href.replace(this.router.url, '');
    
        window.open(baseUrl + newRelativeUrl, '_blank');
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
      this.applicant.user.avg_rating = Math.round(this.applicant.user.avg_rating).toFixed(1)
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
      schedule_date: this.earlySessionObj.schedule_date? this.earlySessionObj.schedule_date: null,
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


