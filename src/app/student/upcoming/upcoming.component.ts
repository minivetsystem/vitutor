import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, AttachmentService, LocalStorageService } from '@app/shared/_services';
import { constantVariables } from '@app/shared/_constants/constants';
import { CommonService } from '../../common/services/common.service';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validator, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-upcoming',
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss']
})
export class UpcomingComponent implements OnInit {
  menuToggle;

  type = 5;
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
  cancelOfferObj={id: null, job_title:'', start_time: ''};
  jobTitle='';
  jobsErr;

  timer = '';
  interval;
  cancel_period = 0;
  dispute_period = 0;
  cancelSession;
  cancelSessionForm: FormGroup;
 

  constructor(private studentService: StudentService,private router:Router, private notifier: AlertService , private commonService : CommonService,
    private attachmentService : AttachmentService, private localStorageService: LocalStorageService, private fb: FormBuilder, private aroute: ActivatedRoute
    ) {this.cancelSessionFormInit();}


  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    
    
    this.manageJobList(null,null);
  }

  manageJobList(startDate='', endDate='') {
    this.jobsErr = undefined;
    const body = {
      start_date : startDate,
      end_date : endDate,
      type : this.type,
      page: this.page,
      order : 'asc'
    };

    this.studentService.manageJobs(body).subscribe((res: any) => {
      this.cancel_period = res.cancel_period;
      this.dispute_period = res.dispute_period;
      this.jobsList = res.data.data;
      for(let ele of this.jobsList){
        
        let momentNow = moment();
        ele.schedule_date = moment(ele.schedule_date, 'YYYY-MM-DD HH:mm:ss').format('dddd MM-DD-YYYY hh:mm A')
        let currentDate = momentNow.format('MM-DD-YYYY'); 
        if(this.type == 5){
          
        if(ele.date == moment(currentDate, 'MM-DD-YYYYY').format('YYYY-MM-DD')){
          ele.greyArea = false;
          ele.redText = false;
          let nowDate = momentNow.format('YYYY-MM-DD')
          let nowTime = momentNow.format('HH:mm:ss');
          let start_time = moment(ele.start_time, 'YYYY-MM-DD HH:mm:ss')
          let end_time = moment(ele.end_time, 'YYYY-MM-DD HH:mm:ss');
          ele.cancelBtn = true;
          if(momentNow.isBetween(start_time,end_time)){
              ele.session_status = 'started';
              ele['showBtn']=true;
              ele.cancelBtn = false;
              
          } else if(momentNow.isBefore(start_time)) {
            this.timerFunction(ele);
            ele.session_status = 'pending';
            if(momentNow.isAfter(start_time.clone().subtract(this.cancel_period,'minutes'))){
              ele.cancelBtn = false;
            } else {
              ele.cancelBtn = true;
            }
            
          } else if(moment().isAfter(end_time)) {
            ele.session_status = 'completed';
            ele.cancelBtn = false;
            // ele['showBtn']=true
          } 
          
        } else if(moment(ele.date,'YYYY-MM-DD').isBefore(moment(currentDate, 'MM-DD-YYYYY'))){
          ele.cancelBtn = true;
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
     
    }
    
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

  loadMore(page) {
    this.page = page;
    this.manageJobList(this.startDate, this.endDate);
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
  //   let momentNow = moment();
  //   let start_time = moment(this.cancelOfferObj.start_time, 'YYYY-MM-DD HH:mm:ss');
  //  if(momentNow.isAfter(start_time.clone().subtract(this.cancel_period,'minutes'))){
  //    this.notifier.error('You cannot cancel before ' + this.cancel_period + ' minutes to session');
  //    return;
  //  }
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
        this.cancelOfferObj = {id: null, job_title:'', start_time:''};
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

 
  
  timerFunction(job){
    let timeZone = this.localStorageService.getTimeZone();
    let momentNow = moment(moment().tz(timeZone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A');
    let countDownDate = moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').valueOf();
    let endTime = moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').add(job.duration, 'hours').valueOf();
    let now = momentNow.valueOf();
    let distance = countDownDate - now;
    let endDistance = endTime - now;
    this.timer = '';
   
     let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let endHours = Math.floor((endDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let endMinutes = Math.floor((endDistance % (1000 * 60 * 60 )) / (1000 * 60));
      

    if(moment(job.schedule_date, 'dddd MM-DD-YYYY hh:mm A').format('DD/MM/YYYY') == moment().tz(timeZone).format('DD/MM/YYYY') ){
    // Update the count down every 1 second
    
    if(hours <= 0 && minutes <= 45 && minutes > 0){
      job['showBtn'] = true
      
      job.interval = setInterval(() => {
      
    
      // Find the distance between now and the count down date
      
      let minutes1 = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds1 = Math.floor((distance % (1000 * 60)) / 1000);
        distance -= 1000
      // Time calculations for days, hours, minutes and seconds
      // let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      
    
      // Display the result in the element with id="demo"
      if(minutes1 < 15){
      job.timer =  'Session Starts in: ' + minutes1 + "m " + seconds1 + "s ";
      }
    
      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(job.interval);
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
        // this.router.navigate(['/video']);
        let newRelativeUrl = this.router.createUrlTree(['/video']);
        let baseUrl = window.location.href.replace(this.router.url, '');
    
        window.open(baseUrl + newRelativeUrl, '_blank');
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
    let momentNow = moment();
    let start_time = moment(this.cancelSession.start_time, 'YYYY-MM-DD HH:mm:ss');
   if(momentNow.isAfter(start_time.clone().subtract(this.cancel_period,'minutes'))){
     this.notifier.error('Session cannot be cancelled If remaining schedule time is less than ' + this.cancel_period + ' minutes');
     return;
   } else if(this.cancelSessionForm.invalid){
     this.cancelSessionForm.markAllAsTouched();
     return;
   }
   
    let data = new FormData();
    let formValue = this.cancelSessionForm.value;
    data.append('reason', formValue.message);
    data.append('id', formValue.session_id);

    this.studentService.cancelSession(data).subscribe((res:any)=> {
      if(res.success){
        this.notifier.success(res.success_message);
        this.manageJobList(null,null);
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

 
 
 
  onChange = (value:any) => {};

  dateFormate(date){
    return moment(date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');
  }

  timeFormate(time){
    return moment(time, 'YYYY-MM-DD HH:mm:ss').format('hh:mm A');
  }
 
}
