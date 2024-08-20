import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, AttachmentService, LocalStorageService, WebsocketService } from '../../shared/_services/index';
import { constantVariables } from '../../shared/_constants/constants';
import { CommonService } from '../../common/services/common.service';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validator, Validators } from '@angular/forms';
// import { start } from 'repl';
declare var $: any;

@Component({
  selector: 'app-manage-job',
  templateUrl: './manage-job.component.html',
  styleUrls: ['./manage-job.component.scss']
})
export class ManageJobComponent implements OnInit {
  currentTab = 'JobPosted';
  type = 1;
  page = 1;
  startDate = null;
  endDate = null;
  selected: {startDate: moment.Moment, endDate: moment.Moment};
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  currentPage: number;
  pagesCount = [];
  jobsList = [];
  lastPage = 0;
  showClearButton: boolean = false;
  reason='';
  cancelOfferObj={id: null, job_title:''};
  applicantsApplied = [];
  invitationSent = [];
  jobTitle='';
  jobsErr;
  menuToggle;
  timer = '';
  interval;
  cancel_period = 0;
  dispute_period = 0;
  cancelSession;
  cancelSessionForm: FormGroup;
  ratingForm = {rating:null, review: null, session_id: null, tutor_id: null};
  disputeForm: FormGroup ;
  disputeObject;
  attachmentTypeError;
  attachmentsizeLimitError;
  attachmentFile;
  createOfferForm: FormGroup;
  sendOfferObject= {"id":null,"tutor_id":null,"job_id":null,message_board_room_id:'',"offer_price":"","message":'',"user":{"about_me":"","profile_slug":"","experince_level":"Expert","hourly_rate":"$100.00","image_url":null,"full_name":"TestTutor","location":{"city":"","state":"","country":""},"avg_rating":"",},"job":{"id":null,"job_category":"",no_of_sessions:'',"job_type_data":'',"sub_category_id":"","job_title":"","student_level":"","proposed_start_time":"","experince_level":"","duration":null,"job_slug":"","job_description":"","job_type":"","price_type":"","schedule_date":null,"price":"","job_recurring":{"recurring_type":"","date":null,"day":"","time":"","end_date":"","start_date":""}}};
  daysArray = [{name:'Sunday'}, {name:'Monday'}, {name:'Tuesday'},{name:'Wednesday'},{name:'Thursday'},{name:'Friday'},{name:'Saturday'}]
  selectedDays = [];
  currentDate;
  datesArray = [];
  selectedDates = [];
  dateRangeErr = '';
  formSubmitted = false;
  userId;
  userInfo;
  isRecurring = false;
  recurringTypeField;
  offerSentId;
  reviewRatingObject;
  ratingReviewErr:boolean = false;
 timezone
  
 

  constructor(private studentService: StudentService,private router:Router, private notifier: AlertService , private commonService : CommonService,
    private attachmentService : AttachmentService, private localStorageService: LocalStorageService, private fb: FormBuilder, private aroute: ActivatedRoute,
    private websocketService: WebsocketService
    ) {this.cancelSessionFormInit(); this.disputeFormInit(); this.sendOfferFormInit()}

  ngOnInit() {
    $('[data-toggle="tooltip"]').tooltip();
    this.userInfo = this.localStorageService.getUserData();
    for(let i = 1; i <= 31; i++){
      this.datesArray.push({name : i})
    }
    this.userId = this.localStorageService.getRefId();
    this.aroute.queryParams.subscribe((tab:any)=> {
      if(tab.hasOwnProperty('tab')){
        this.currentTab = tab.tab
      } 
      this.tabChange(this.currentTab)
    })
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
    
    
    this.manageJobList(null,null);
  }

  manageJobList(startDate='', endDate='') {
    this.jobsErr = undefined;
    const body = {
      start_date : startDate,
      end_date : endDate,
      type : this.type,
      page: this.page
    };

    this.studentService.manageJobs(body).subscribe((res: any) => {
      this.cancel_period = res.cancel_period;
      this.dispute_period = res.dispute_period;
      this.jobsList = res.data.data;
      for(let ele of this.jobsList){
        ele.schedule_date = moment(ele.schedule_date, 'YYYY-MM-DD HH:mm:ss').format('dddd MM-DD-YYYY hh:mm A')
        let currentDate = moment().tz(this.timezone).format('MM-DD-YYYY'); 
        if(this.type == 5){
          
        if(ele.date == moment(currentDate, 'MM-DD-YYYYY').format('YYYY-MM-DD')){
          ele.greyArea = false;
          ele.redText = false;
          let nowDate = moment().format('YYYY-MM-DD')
          let nowTime = moment().tz(this.timezone).format('HH:mm:ss');
          let start_time = moment(currentDate + ' ' +ele.start_time, 'MM-DD-YYYY HH:mm:ss')
          let end_time = moment(currentDate + ' ' +ele.end_time, 'MM-DD-YYYY HH:mm:ss').add(moment.duration(ele.duration,'hours'));
          ele.cancelBtn = true;
          if(moment(currentDate + ' ' +nowTime,'MM-DD-YYYY HH:mm:ss').isBetween(start_time,end_time)){
              ele.session_status = 'started';
              ele['showBtn']=true;
              ele.cancelBtn = false;
              
          } else if(moment(currentDate + ' ' +nowTime,'MM-DD-YYYY HH:mm:ss').isBefore(start_time)) {
            this.timerFunction(ele);
            ele.session_status = 'pending';
            if(moment(moment().tz(this.timezone).format('YYYY-DD-MM hh:mm A'), 'YYYY-DD-MM hh:mm A').isAfter(start_time.clone().subtract(this.cancel_period,'minutes'))){
              ele.cancelBtn = false;
            } else {
              ele.cancelBtn = true;
            }
            
          } else if(moment(currentDate + ' ' +nowTime,'MM-DD-YYYY HH:mm:ss').isAfter(end_time)) {
            ele.session_status = 'completed';
            ele.cancelBtn = false;
            // ele['showBtn']=true
          } 
          
        } else if(moment(ele.date,'YYYY-MM-DD').isBefore(moment(currentDate, 'MM-DD-YYYYY'))){
          ele.cancelBtn = false;
          ele.session_status = 'pending';
          ele.greyArea = true;
          ele.redText = true;
        } else {
          ele.cancelBtn = true;
          ele.session_status = 'pending';
          ele.greyArea = true;
          ele.redText = false;
        }
      }
      else if(this.type == 6){
        ele.canDispute = false;
          if(ele.status == 'Completed' && moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A').isBefore(moment(ele.schedule_date, 'dddd MM-DD-YYYY hh:mm A').add(this.dispute_period, 'day')) ){
            ele.canDispute = true;
          } else if (ele.status == 'Missed' && moment().isBefore(moment(ele.schedule_date, 'dddd MM-DD-YYYY hh:mm A').add(this.dispute_period, 'day'))){
            ele.canDispute = true;
          }
          
        

      // }
      } 
      // else if (this.type == 1){
      //   if(moment().isAfter(moment(moment(ele.created_at, 'dddd MM-DD-YYYY hh:mm a').add(1,'day').format('MM-DD-YYYY'),'MM-DD-YYYY'))){
      //     ele.status = 'expired';
      //   } 
      // }
    }
      // this.jobsList.forEach(ele => {
      //   ele.schedule_date = moment(ele.schedule_date, 'YYYY-MM-DD HH:mm:ss').format('dddd MM-DD-YYYY hh:mm A')

      // })
      if(this.jobsList.length > 0){
        this.jobsErr = 0;
      }else {
        this.jobsErr = 1;
      }
      this.currentPage = res.data.current_page;
      this.lastPage = res.data.last_page;
      this.pagesCount = [];
      for (let i = 1 ; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }
     
    }, err => {
      this.jobsList = [];
      this.pagesCount = [];
      this.lastPage = 0;
      this.page = 1;
      this.jobsErr = 1;
    });
  }

  clearDateFilter() {
    this.page = 1;
    this.startDate = '';
    this.endDate = '';
    this.showClearButton = false;
    this.manageJobList(null, null);
    this.selected = null;
  }

  change(e) {
    if(e.startDate){
      this.startDate = e.startDate.year()+'-'+(e.startDate.month()+1) + '-' + e.startDate.date() ;
      this.endDate = e.endDate.year()+'-'+(e.endDate.month()+1) + '-' +e.endDate.date();
      if ((this.startDate != null) && (this.endDate != null)) {
        this.showClearButton = true;
      } else {
        this.showClearButton = false;
        this.selected = null;
      }
      this.page = 1;
      this.manageJobList(this.startDate,this.endDate);
    }
    
  }

  tabChange(tab) {
    this.currentTab = tab;
    this.page = 1;
    if (tab === 'All') { this.type = 7;
    } else if (tab === 'Upcoming') { this.type = 5;
    } else if ( tab === 'Completed') { this.type = 6;
    } else if (tab === 'JobPosted') { this.type = 1;
    } else if (tab === 'ApplicationReceived') { this.type = 4; 
    } else if (tab === 'sentOffer') { this.type = 3;
    } else if (tab === 'invitationReceived') { this.type = 2

    }

    this.manageJobList(this.startDate, this.endDate);
  }

  loadMore(page) {
    this.page = page;
    this.manageJobList(this.startDate, this.endDate);
  }

  deleteJob(id) {
    this.studentService.deleteJob(id).subscribe((res: any) => {
      this.notifier.success(res.success_message);
      this.manageJobList(this.startDate, this.endDate);
    }, err => {
      this.notifier.error(err.error.error_message);
    });
  }

  unable() {
    this.notifier.error('Cannot perform action, Job status is not pending');
  }

  sendInvite(job){
    this.commonService.sendInvite.next(job);
    this.localStorageService.set('sendInvite', (job));
    this.router.navigate(['/search/searchTutor']);
  }
  noType(event){
    event.preventDefault();
  }

  cancelOffer(obj) {
    this.cancelOfferObj = obj;
    $('#cancelOfferModal').modal('show');
  }

  cancelOfferSubmit() {
   
    const body = {
      offer_id: this.cancelOfferObj.id,
      status: 4,
      comment: this.reason
    }

    this.studentService.changeOffer(body).subscribe((res: any) => {
      if(res.success == false){
        this.notifier.error(res.error_message);
      } else if (res.success == true) {

      
        this.notifier.success(res.success_message);
        this.cancelOfferObj = {id: null, job_title:''};
        this.reason = '';
        this.manageJobList(null,null);
        $('#cancelOfferModal').modal('hide');
        
      }
        
    }, err => {
      this.notifier.error(err.error.error_message);
    })

  }

  closeCancelModal() {
    this.reason = '';
    $('#cancelOfferModal').modal('hide');
  }

  viewApplicants(job) {
    this.studentService.applicationReceived({id:job.id}).subscribe((res: any) => {
      this.applicantsApplied = res.data;
      this.offerSentId = res.sent_offer_id
      this.jobTitle = job.job_title;
      $('#view_applicants').modal('show');
    }, error => {
      this.applicantsApplied = [];
    });
  }

  viewInvitations(id) {
    this.studentService.invitationReceived({id}).subscribe((res: any) => {
      this.invitationSent = res.data;
      $('#view_invitation').modal('show');
    }, err => {
      this.invitationSent = [];
    });
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

  navigateProfile(url){
    $('#view_applicants').modal('hide');
    this.router.navigate([url]);
  }

  makePayment(job){
    let sessionId = job.id
    let amount = 0
    if(job.price_type == 'Hourly'){
      amount = (+(job.accepted_price.replace('$','')))*(job.duration)
    } else {
      amount = +(job.accepted_price.replace('$',''))
    }
    Swal.fire({
      title: 'Make Payment?',
      text: `You sure, you want make Transaction of $${amount}?`,
      showCancelButton: true,
      confirmButtonText: 'Pay',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.studentService.checkoutPayment(sessionId).subscribe((res: any) => {
          if (res.success) {
            let session = this.jobsList.find((obj)=> obj.id === sessionId);
            session ? session['payment_status'] = 1 : '';
            Swal.fire(
              'Make payment!',
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
  
  }
})
  }

  timerFunction(job){
    let countDownDate = moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').valueOf();
    let endTime = moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').add(job.duration, 'hours').valueOf();
    let now = moment().tz(this.timezone).valueOf();;
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
      job['showBtn'] = true
      
      this.interval = setInterval(() => {
        let countDownDate1 = moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').valueOf();
      // Get today's date and time
      let now1 = new Date().getTime();
      let distance1 = countDownDate1 - now1;
    
      // Find the distance between now and the count down date
      let hours1 = Math.floor((distance1 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes1 = Math.floor((distance1 % (1000 * 60 * 60)) / (1000 * 60));
      let seconds1 = Math.floor((distance1 % (1000 * 60)) / 1000);
    
      // Time calculations for days, hours, minutes and seconds
      // let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      
    
      // Display the result in the element with id="demo"
      if(minutes1 < 15){
      this.timer =  'Session Starts in: ' + minutes1 + "m " + seconds1 + "s ";
      }
    
      // If the count down is finished, write some text
      if (distance1 < 0) {
        clearInterval(this.interval);
        this.timer = '';
        if(job['session_status'] == 'pending'){
          job['session_status'] = 'started';
        }
        
      }
    }, 1000);
  } else if (endHours >= 0 && endMinutes >= 0 && minutes <= 0 && hours <= 0) {
    job['showBtn'] = true;
    
    // job['session_status'] = 'started';
  } else {
    job['showBtn'] = false;
   
  }
  } else {
    job['showBtn'] = false;
  }
  }

  joinSession(sessionId){
    this.studentService.joinSession(sessionId).subscribe((res:any) => {
      if(res.success == true && res.data != 0){
        this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: sessionId});
        this.router.navigate(['/video']);
      } else if(res.success == false && res.data != 0){
        this.notifier.error(res.success_message || res.error_message)
      } else if(res.data == 0 || !res.data.videourl){
        this.notifier.error("Tutor hasn't started session yet");
      }
    }, (err:any) => {
      this.notifier.error(err.error.error_message||'Unable to Join session');
    })

  }

  cancelSessionFormInit(){
    return this.cancelSessionForm = this.fb.group({message: ['',[Validators.required]], session_id : []});
  }

  openCancelSessionModal(session) {
    this.cancelSession = session;
    this.cancelSessionForm.patchValue({session_id: session.id});
    $('#cancel_session').modal('show');
  }

  cancelSessionSubmit(){
    let data = new FormData();
    let formValue = this.cancelSessionForm.value;
    data.append('reason', formValue.message);
    data.append('id', formValue.session_id);

    this.studentService.cancelSession(data).subscribe((res:any)=> {
      if(res.success){
        this.notifier.success(res.success_message);
        this.closeSessionModal();
      } else {
        this.notifier.error(res.success_message || res.error_message);
      }
    }, err => {
      this.notifier.error(err.error.error_message);
    })

  }

  closeSessionModal(){
    this.cancelSessionForm.reset();
    $('#cancel_session').modal('hide');
  }

  openReviewModal(session){
    this.reviewRatingObject = session;
    this.ratingForm = {rating:null, review: null, session_id: session.id, tutor_id: session.refId}
    $('#reviewAndratingModal').modal('show');
  }

  submitReviewRating(){
    if( this.ratingForm.review && this.ratingForm.review.trim().length > 0  ){
      this.ratingReviewErr = false;
      this.ratingForm.rating = this.ratingForm.rating == null ? 0 :  this.ratingForm.rating
      this.studentService.ratngAndReview(this.ratingForm).subscribe((res:any)=> {
        if(res.success){
          this.notifier.success(res.success_message);
          let element = this.jobsList.find(ele => ele.id === this.ratingForm.session_id);
          element.profile_review = true;
          this.closeRatingModal();
        } else {
          this.notifier.error(res.success_message || res.error_message);
        }
      }, err => {
        this.notifier.error(err.error.error_message);
      })
    } else {
      this.ratingReviewErr = true;
    }
  }

  closeRatingModal(){
    this.reviewRatingObject = null;
    this.ratingForm = {rating:null, review: null, session_id: null, tutor_id: null}
    $('#reviewAndratingModal').modal('hide');
  }

  // reviewratingFormInit(){
  //   this.reviewAndratingForm = this.fb.group({
  //     rating: [null],
  //     review: [null],
  //     session_id: [null],
  //     tutor_id: [null]
  //   });
  // }

  disputeFormInit() {
    this.disputeForm = this.fb.group({
          file: [null],
          text: [null, [Validators.required]],
          session_id: [null],
          job_title: [null],
          schedule_date : [null]
        });
  }

 
  onChange = (value:any) => {};

  dateFormate(date){
    return moment(date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');
  }

  timeFormate(time){
    return moment(time, 'HH:mm:ss').format('hh:mm A');
  }
  openDisputeModal(job){
    this.disputeObject = job;
    this.disputeForm.patchValue({session_id: job.id});
    $('#disputeModal').modal('show')
  }

  closeDisputeModal(){
    this.disputeForm.reset();
    $('#disputeModal').modal('hide')
  }

  disputeSubmit(){
    this.disputeForm.markAllAsTouched();
    if(this.disputeForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError){
      return
    } 
    let formValue = this.disputeForm.value
    let body = new FormData()
    body.append('session_id', formValue.session_id);
    body.append('text', formValue.text);
    if(this.attachmentFile){
      body.append('file',this.attachmentFile)
    }

    this.studentService.raiseDispute(body).subscribe((res:any) => {
      if(res.success || res.success == 'true'){
        this.notifier.success(res.success_message);
        let element = this.jobsList.find(ele => ele.id === formValue.session_id);
        element ? element.status = 'Disputed': '';
        this.closeDisputeModal();
      } else {
        
          this.notifier.error(res.success_message || res.error_message);
        }
      }, err => {
        this.notifier.error(err.error.error_message);
      })

  }

  
  navigate(url, rommId){
  $('#view_applicants').modal('hide');
  rommId? this.router.navigate([url],{queryParams: {message_board_room_id: rommId}}) : this.router.navigate([url]);
  
}

sendOfferModal(applicant){
  $('#view_applicants').modal('hide')
  this.sendOfferObject = Object.assign({},applicant);
  this.createOfferForm.get('price').setValue(this.sendOfferObject.offer_price.replace('$',''))
  this.createOfferForm.get('price').updateValueAndValidity();
  if(this.sendOfferObject.job.job_type_data == 'recurring'){
    if(this.sendOfferObject.job.job_recurring && this.sendOfferObject.job['job_recurring'].recurring_type == 'Monthly'){
      this.recurringTypeField = 'Monthly'
      this.createOfferForm.get('date').setValidators([Validators.required]);
      this.createOfferForm.get('date').updateValueAndValidity()
    } else if(this.sendOfferObject.job.job_recurring && this.sendOfferObject.job.job_recurring.recurring_type == 'Weekly') {
      this.recurringTypeField = 'Weekly'
      this.createOfferForm.get('day').setValidators([Validators.required]);
      this.createOfferForm.get('day').updateValueAndValidity()
    }
    this.isRecurring = true;
    this.createOfferForm.get('start_date').setValidators([Validators.required]);
    this.createOfferForm.get('end_date').setValidators([Validators.required]);
    // this.createOfferForm.get('time').setValidators([Validators.required]);
    this.createOfferForm.get('start_date').setValue('');
    this.createOfferForm.get('end_date').setValue('');
    // this.createOfferForm.get('time').setValue('');
    this.createOfferForm.get('start_date').updateValueAndValidity();
    this.createOfferForm.get('end_date').updateValueAndValidity();
    // this.createOfferForm.get('time').updateValueAndValidity();

    this.createOfferForm.get('schedule_date').clearValidators();
    this.createOfferForm.get('schedule_date').setValue('');
    this.createOfferForm.get('schedule_date').updateValueAndValidity();
  }else if(this.sendOfferObject.job.job_type_data == 'one-time') {
    this.isRecurring = false;
    this.createOfferForm.get('schedule_date').setValidators([Validators.required]);
    this.createOfferForm.get('schedule_date').setValue('');
    this.createOfferForm.get('schedule_date').updateValueAndValidity();

    this.createOfferForm.get('start_date').clearValidators();
    this.createOfferForm.get('end_date').clearValidators();
    // this.createOfferForm.get('time').clearValidators();
    this.createOfferForm.get('start_date').setValue('');
    this.createOfferForm.get('end_date').setValue('');
    // this.createOfferForm.get('time').setValue('');
    this.createOfferForm.get('start_date').updateValueAndValidity();
    this.createOfferForm.get('end_date').updateValueAndValidity();
    // this.createOfferForm.get('time').updateValueAndValidity();
  } else if(this.sendOfferObject.job.job_type_data == 'instant-tutoring'){
    this.isRecurring = false;
    this.createOfferForm.get('schedule_date').setValidators([Validators.required]);
    this.createOfferForm.get('schedule_date').setValue(moment().tz(this.timezone).toISOString());
    this.createOfferForm.get('schedule_date').updateValueAndValidity();
    this.createOfferForm.get('time').setValue(moment().tz(this.timezone).add(10,'minutes').format('hh:mm A'))
    this.createOfferForm.get('start_date').clearValidators();
    this.createOfferForm.get('end_date').clearValidators();
    // this.createOfferForm.get('time').clearValidators();
    this.createOfferForm.get('start_date').setValue('');
    this.createOfferForm.get('end_date').setValue('');
    // this.createOfferForm.get('time').setValue('');
    this.createOfferForm.get('start_date').updateValueAndValidity();
    this.createOfferForm.get('end_date').updateValueAndValidity();
  }
  $('#apply_job').modal('show');
}

sendOfferFormInit(){
  this.createOfferForm = this.fb.group(
    {
      price : [null,[Validators.required,Validators.pattern(/^[+-]?\d+(\.\d+)?$/)]],
      message : [null,[Validators.required]],
      attachment : [null],
      schedule_date: ['', []],
      start_date: ['', []],
      end_date : ['', []],
      time: ['', [Validators.required]],
      day: [''],
      date: ['']
  })
}

onSelectAttachment(evt) {
  // this.sizeLimitError = false;
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

convertTime12to24 = (time12h) => {
  const [time, modifier] = time12h.split(' ');

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM' || modifier === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
}

convertTime24to12 = (time24h) => {
   let time = time24h.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time24h];

   if (time.length > 1) { 
     time = time.slice (1); 
     time[5] = +time[0] < 12 ? ' am' : ' pm'; 
     time[0] = +time[0] % 12 || 12; 
   }
   console.log("tii",time.join())
 
   return time.join(); 
}



onSubmit() {
  let timeZone = this.localStorageService.getTimeZone()

  let momentNow = moment(moment().tz(timeZone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A')
  this.formSubmitted = true;
  if(this.createOfferForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError) {
    return;
  }else{
    const createFormValue = this.createOfferForm.value;
    if(this.sendOfferObject.job.job_type_data == 'recurring' && (createFormValue.start_date == '' || createFormValue.end_date == '' || createFormValue.time == '' )){
      return ;
    } else if(this.sendOfferObject.job.job_type_data == 'one-time' && (createFormValue.schedule_date == '' || createFormValue.time == '')){
      return ;
    }else if(this.sendOfferObject.job.job_type_data == 'recurring' ){
      let startdate = moment(createFormValue.start_date).format('MM-DD-YYYY');
      if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
        this.dateRangeErr = 'Start date time is less then current date time'
        return
      } else {
        this.dateRangeErr = ''
      }
    } else if (this.sendOfferObject.job.job_type_data == 'one-time'){
     
      let startdate = moment(createFormValue.schedule_date).format('MM-DD-YYYY');
      if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
        this.dateRangeErr = 'Start date time is less then current date time'
        return
      } else {
        this.dateRangeErr = ''
      }
    } else if (this.sendOfferObject.job.job_type_data == 'instant-tutoring'){
       
      let startdate = moment(createFormValue.schedule_date).format('MM-DD-YYYY');
      if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
        this.dateRangeErr = 'Start date time is less then current date time'
        return
      } else {
        this.dateRangeErr = ''
      }
    }else{
      this.dateRangeErr = ''
    }
    if(this.sendOfferObject.job.job_type_data == 'recurring' && this.sendOfferObject.job['job_recurring'].recurring_type != 'Daily'){
      let dateDiffErr = 1;
      let diff = (moment(createFormValue.end_date).unix() - moment(createFormValue.start_date).unix())
      let daysDiff = Math.floor(diff/(60*60*24));
      for(let day=0; day <= daysDiff; day++){
        
        if(this.sendOfferObject.job['job_recurring'].recurring_type  == 'Weekly'){
          let currentDay=moment(createFormValue.start_date).add(day,'day').format('dddd');
          if(createFormValue.day.indexOf(currentDay) != -1){
            dateDiffErr = 0;
            
            break;
          } 
        }else if(this.sendOfferObject.job['job_recurring'].recurring_type == 'Monthly'){
          let currentDay="" + moment(createFormValue.start_date).add(day,'day').format('D');
          if(createFormValue.date.indexOf(currentDay) != -1 || createFormValue.date.indexOf(+currentDay) != -1){
            dateDiffErr = 0;
            
            break;
          }
        }

      }
      if(dateDiffErr == 1){
        this.dateRangeErr = `Unable to create sessions, since provided date range doesn't have selected ${this.sendOfferObject.job['job_recurring'].recurring_type   == 'Weekly'? 'day': 'date'} in it.`
        return;
      } else {
        this.dateRangeErr = ''
      }
     
    }

    function convertTimeFormat(inputTime, start_date ) {
      console.log("stagjhgh",start_date )
      // Parse input time
      const parsedTime = new Date(start_date+ " " + inputTime);
    
      // Extract hours, minutes, and seconds
      const hours = parsedTime.getHours();
      const minutes = parsedTime.getMinutes();
      const seconds = parsedTime.getSeconds();
    
      // Format hours, minutes, and seconds to have leading zeros if needed
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');
    
      // Construct the final formatted time
      const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      console.log("giiii",formattedTime)
      return formattedTime;
    }
    
    const formData  = new FormData();
    // let temp = this.createOfferForm.value.schedule_date;
  
    // console.log("temp", moment(this.createOfferForm.value.time, "h:mm:ss A").add( this.sendOfferObject.job.duration, 'hours').format("HH:mm:ss"));
    let start_date = moment(this.createOfferForm.value.schedule_date).format('YYYY-MM-DD');
    console.log("time",this.createOfferForm.value.time)
    let end_time = moment(this.createOfferForm.value.time, "h:mm:ss A").add( this.sendOfferObject.job.duration, 'hours').format("HH:mm:ss");
 
    // let end_time12 = this.convertTime24to12(end_time);
const inputTime = this.createOfferForm.value.time
    const start_time = convertTimeFormat(inputTime, start_date );

    console.log("giiii",start_time)

    const session =[
                      {"start_time":`${start_date} ${start_time}`,
                      "end_time": `${start_date} ${end_time}` }
                    ];
                    // console.log("tjhkhs",JSON.stringify(session))
    //  const session12 = '[{"start_time":"2023-08-16 14:30:00","end_time":"2023-08-16 17:30:00"}]';
        
    if(this.attachmentFile) {
      formData.append("attachment", this.attachmentFile , this.attachmentFile.name);
    }
    formData.append("tutor_id", this.sendOfferObject.tutor_id);
    formData.append("message", this.createOfferForm.value.message);
    formData.append("accepted_price", this.createOfferForm.value.price);
    formData.append("receiver_id", this.sendOfferObject.tutor_id);
    formData.append("job_id", this.sendOfferObject.job.id);
    formData.append("user_id", this.userId);
    formData.append("message_board_room_id", this.sendOfferObject.message_board_room_id);
    formData.append('job_sessions', JSON.stringify(session));
  
    formData.append('time', moment(createFormValue.time, 'h:mm a').format('HH:mm:ss'));
    if(this.sendOfferObject.job.job_type_data == 'recurring'){
      if(this.sendOfferObject.job['job_recurring'].recurring_type == 'Weekly'){
        formData.append('day', this.createOfferForm.value.day.join());
      }else if(this.sendOfferObject.job['job_recurring'].recurring_type == 'Monthly') {
        formData.append('date', this.createOfferForm.value.date.join());
      }
      formData.append('start_date', moment(createFormValue.start_date).format('YYYY-MM-DD'));
      formData.append('end_date', moment(createFormValue.end_date).format('YYYY-MM-DD'))
    } else {
      formData.append('schedule_date', moment(createFormValue.schedule_date).format('YYYY-MM-DD'))
    }
    
    this.studentService.sendOffer(formData).subscribe((res: any) => {
      if(res.success ){
      this.notifier.success(res.success_message);
      this.manageJobList(null, null);
      $('#apply_job').modal('hide');
      this.formSubmitted = false;
      this.attachmentFile = null;
      this.createOfferForm.reset();
      this.commonService.sendNotification({receiver_id: this.sendOfferObject.tutor_id,
                                            reference_id : this.sendOfferObject.message_board_room_id,
                                          type: 'send_offer',
                                          notification: this.userInfo.full_name + ' has sent you job request',
                                        notification_message: this.userInfo.full_name + ' has sent you job request for the job of ' + this.sendOfferObject.job.job_title})
      } else {
        this.notifier.error(res.error_message || res.success_message);
      }
    }, err => {
      this.notifier.error(err.error.error_message);
    });
  }
}

navigateToOffer(){
  $('#view_applicants').modal('hide');
  this.router.navigate(['/viewOffer/view/'+this.offerSentId])
}
changeStartDate(event){
  this.createOfferForm.get('end_date').setValue('');
  this.createOfferForm.get('end_date').updateValueAndValidity();
}

navigateViewTutor(profile_slug){
  $('#apply_job').modal('hide');
  this.router.navigate(['/search/viewTutor/'+profile_slug])
}
}
