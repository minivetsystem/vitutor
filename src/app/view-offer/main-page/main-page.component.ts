import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ViewOfferService } from '../view-offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService, WebsocketService, AttachmentService, LocalStorageService} from '@app/shared/_services';
declare const $:any; 
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CommonService } from '@app/common/services/common.service';
import Swal from 'sweetalert2';
import { constantVariables } from '../../shared/_constants/constants';
import {AvailibilityModalComponent} from '../../shared/_components/availibility-modal/availibility-modal.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  offerDetails={id : '',duration:1, price:1,accepted_price: '', job_id: null,attachment: '',image_title:'', message:'',offer_sent_on: '',status:'', file_type:'',job_session:[], job_detail: {price : '', price_type: '', job_title: '', schedule_date:'', job_recurring: {recurring_type:null, end_date:null, start_date: null, day: null, date: null, time :''},job_type_data:'', job_type: '', status: '', duration:1, job_session:[],proposed_start_time:'', job_attachment: []}, student: {full_name : '' , id : '', image_url:''}, user: {id: ''}, tutor: {session_review_count:'',first_name: '', last_name: '', image_url:'', avg_rating:'', hourly_rate:'', experince_level:'', location:{country:'', city:''}, about_me:'',profile_slug:''} , tutor_id : ''}
  offerId;
  acceptOfferObj = {id:null, job_title:'', accepted_price: ''};
  rejectOfferObj = {id: null, job_title: ''};
  declineReason = '';
  acceptReason = '';
  declineSubmitted = false;
  acceptSubmitted = false;
  editOfferForm: FormGroup;
  formSubmitted:boolean = false;
  attachmentTypeError: boolean = false;
  attachmentFile: any = null;
  attachmentsizeLimitError: boolean = false;
  sentOfferDetails = {price : '', message : '', attachment : null, offer_id : ''};
  getJobTime = [];
  isRecurring: boolean = false;
  currentDate;
  schedule_date = {date:'', time: ''}
  p = 5;
  loadMoreBtn = true;
  recurringTypeField='';
  cancelOfferObj={id: null, job_title:''};
  reason = '';
  uploadedDocuments = null;
  selectedDays = [];
  selectedDates = [];
  daysArray = [{name:'Sunday'}, {name:'Monday'}, {name:'Tuesday'},{name:'Wednesday'},{name:'Thursday'},{name:'Friday'},{name:'Saturday'}]
  datesArray = [];
  dateRangeErr='';
  selectedDaysCommaSeparated = '';
  selectedDateCommaSeparated = '';
  validErr;
  menuToggle;
  sessionId;
  timer:any;
  interval;
  joinSessionBtn: boolean = false; 
  sessionDetails;
  updateSessionForm: FormGroup;
  oldTime = {start_time : '', end_time : ''};
  updateErr=null
  isJobCompleted = false;
  swalErrorOption = constantVariables.swalErrorOption;
	swalSuccessOption = constantVariables.swalSuccessOption;
	swalInfoOption = constantVariables.swalInfoOption;
	swalWarningOption = constantVariables.swalWarningOption;
  timezone;
  joinSessionBtnDisabled: boolean = false;
  availabilityModal:BsModalRef
  availablilitySlots = [];
  bookedSlots = [];
  slotErr;
  successMsg;

  constructor(private location: Location, 
    private offerService: ViewOfferService, 
    private activateRoute: ActivatedRoute,  
    private notifier: AlertService,
    private websocketService: WebsocketService,
    private formBuilder : FormBuilder,
    private attachmentService : AttachmentService,
    private commonService: CommonService,
    private router : Router,
    private localStorageService : LocalStorageService,
    private modalService: BsModalService
    ) {
      for(let i = 1; i <= 31; i++){
        this.datesArray.push({name : i})
      }
    this.editOfferForm = this.formBuilder.group(
      {
        price : [null,[Validators.required,Validators.pattern(/^[+-]?\d+(\.\d+)?$/)]],
        message : [null,[Validators.required]],
        attachment : [null],
        time: ['', [Validators.required]],
        schedule_date:[''],
        start_date:[''],
        end_date: [''],
        offer_id: [''],
        day: [''],
        date: ['']
    });
    this.updateSessionInit();
  }

  updateSessionInit(){
    this.updateSessionForm = this.formBuilder.group({
      jobTitle : [''],
      schedule_date : [''],
      start_time : ['',[Validators.required]],
      end_time : ['', [Validators.required]],
      id: [],
      duration: []
    })
  }

  get form(){
    return this.updateSessionForm.controls
  }


  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.activateRoute.params.subscribe(params => {
      this.offerId = params.id;
      this.getOffer();
      this.getToday();
   });
   this.localStorageService.timeZone.subscribe((res:any)=> {
     if(res){
       this.timezone = res
     }else {
       this.timezone = this.localStorageService.getTimeZone();
     }
   })
  }

  goBack() {
    this.location.back();
  } 

  getOffer() {
    if(this.offerId) {
      this.offerService.getOfferDetails(this.offerId).subscribe((res: any)=> {
       if(res.success){
         this.validErr = 'valid';
        this.getJobTime = [];

        // this.offerDetails = Object.assign( this.offerDetails,res.data);
        this.offerDetails = Object.assign( this.offerDetails,res.data, {price : res.data.accepted_price.substring(1, res.data.accepted_price.length)});
        this.jobTypeChange(this.offerDetails.job_detail.job_type_data);
        
        if(this.offerDetails.job_detail.job_type_data == 'one-time') {
          // let date = moment(this.offerDetails.job_detail.schedule_date, 'dddd MM-DD-YYYY hh:mm a')
          // let date1 =  moment(this.offerDetails.job_detail.schedule_date, 'dddd MM-DD-YYYY hh:mm a')
          // let date2 = date.add(this.offerDetails.job_detail.duration, 'hours');

          this.offerDetails.job_session.forEach(ele => {
          let body = {
            date : moment(ele.date,'YYYY-MM-DD').format('dddd MM-DD-YYYY'),
            startTime : ele.start_time && ele.start_time != null ? moment(ele.start_at).format('h:mm A') : ele.start_time,
            endTime : ele.end_time && ele.end_time != null ? moment(ele.end_at).format('h:mm A'): ele.end_time,
            totalTime : this.offerDetails.job_detail.duration,
            totalAmount : this.offerDetails.job_detail.price_type == "Hourly"? this.offerDetails.job_detail.duration*(+this.offerDetails.accepted_price.replace('$','')): this.offerDetails.accepted_price.replace('$',''),
            status : ele.status,
            id : ele.id,
            isEditable : moment().isSameOrAfter(moment(ele.start_time).subtract(30, 'minutes'))? false : true
            
          }
          this.schedule_date.date = moment(ele.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');
          this.schedule_date.time= moment(ele.start_at).format('h:mm a');
          this.getJobTime.push(body);
        })
        } else if (this.offerDetails.job_detail.job_type_data == 'recurring') {
          this.offerDetails.job_session.forEach(ele => {
            let body = {
              date : moment(ele.date,'YYYY-MM-DD').format('dddd MM-DD-YYYY'),
              startTime : ele.start_time && ele.start_time != null ? moment(ele.start_at).format('h:mm A') : ele.start_time,
              endTime : ele.end_time && ele.end_time != null ? moment(ele.end_at).format('h:mm A'): ele.end_time,
              totalTime : this.offerDetails.job_detail.duration,
              totalAmount : this.offerDetails.job_detail.price_type == "Hourly"? this.offerDetails.job_detail.duration*(+this.offerDetails.accepted_price.replace('$','')): this.offerDetails.accepted_price.replace('$',''),
              status : ele.status,
              id: ele.id,
              isEditable : moment().isSameOrAfter(moment(ele.start_time).subtract(30, 'minutes')) ? false : true

            }
            this.getJobTime.push(body);
            this.schedule_date.date = moment(this.offerDetails.job_detail.job_recurring.start_date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');this.schedule_date.time= moment(this.offerDetails.job_detail.job_recurring.time, 'HH:mm:ss').format('h:mm a');
          });
          if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly'){
            this.selectedDays = this.offerDetails.job_detail.job_recurring.day.split(',');
            this.selectedDaysCommaSeparated = this.selectedDays.join(', ');
          } else if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Monthly'){
            this.selectedDates = this.offerDetails.job_detail.job_recurring.date.split(',');
          }

        } else if( this.offerDetails.job_detail.job_type_data == 'instant-tutoring') {
          this.offerDetails.job_session.forEach(ele => {
          let body = {
            date : moment(ele.date,'YYYY-MM-DD').format('dddd MM-DD-YYYY'),
            startTime : ele.start_time && ele.start_time != null ? moment(ele.start_at).format('h:mm A') : ele.start_time,
            endTime : ele.end_time && ele.end_time != null ? moment(ele.end_at).format('h:mm A'): ele.end_time,
            totalTime : this.offerDetails.job_detail.duration,
            totalAmount : this.offerDetails.job_detail.price_type == "Hourly"? this.offerDetails.job_detail.duration*(+this.offerDetails.accepted_price.replace('$','')): this.offerDetails.accepted_price.replace('$',''),
            status : ele.status,
            id: ele.id,
            isEditable : moment().isSameOrAfter(moment(ele.start_time).subtract(30, 'minutes'))? false : true

          }
          this.schedule_date.date = moment(ele.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');this.schedule_date.time= moment(ele.start_at).format('h:mm a');
          this.getJobTime.push(body);
        } ) 
      } else {
          this.getJobTime.push({
            date: '11-12-2021',
            startTime: '11:11AM',
            endTime: '12:11PM',
            totalTime: '1',
            totalAmount: 120,
            status : 'Missed',
            isEditable : false
          })
        }
        if(this.getJobTime[this.getJobTime.length - 1].status.toLowerCase() == 'pending' ){
          this.isJobCompleted = false;
        } else if (this.getJobTime[this.getJobTime.length - 1].status.toLowerCase() == 'missed' || this.getJobTime[this.getJobTime.length - 1].status.toLowerCase() == 'completed' || this.getJobTime[this.getJobTime.length - 1].status.toLowerCase() == 'refunded'){
          this.isJobCompleted = true;
        }
        this.uploadedDocuments = this.offerDetails.job_detail.job_attachment && this.offerDetails.job_detail.job_attachment.length > 0 ? this.offerDetails.job_detail.job_attachment : null
        this.joinSessionTimer(this.offerDetails.job_session)
      } else {
        this.validErr = 'invalid';
        this.notifier.error(res.success_message);
      }
      }, err => {
        this.validErr = 'not_found';
        this.notifier.error(err.error_message);
      });
    }
  }

  acceptOffer(obj) {
    this.acceptOfferObj = obj;
    $('#acceptOfferModal').modal('show');
  }

  rejectOffer(obj) {
    this.rejectOfferObj = obj;
    $('#rejectOfferModal').modal('show');
  }

  acceptOfferSubmit() {
    this.acceptSubmitted = true;
    if(this.acceptOfferObj.id == null)  {
      return;
    }
    if(this.acceptReason == '') {
      return;
    }
    const body = {
      offer_id: this.acceptOfferObj.id,
      status: 1,
      comment: this.acceptReason
    }

    this.offerService.changeOffer(body).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        this.acceptOfferObj = {id:null, job_title:'', accepted_price: ''};
        this.rejectOfferObj = {id: null, job_title: ''};
        this.acceptReason = '';
        this.acceptSubmitted = false;
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

    this.offerService.changeOffer(body).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        this.acceptOfferObj = {id:null, job_title:'', accepted_price: ''};
        this.rejectOfferObj = {id: null, job_title: ''};
        this.declineReason = '';
        this.declineSubmitted = false;
        $('#rejectOfferModal').modal('hide');
        
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

  editOfferDetails() {
    $('#edit_job').modal('show');
    // this.sentOfferDetails = {
    //   price : this.offerDetails.accepted_price.replace("$",""),
    //   message : this.offerDetails.message,
    //   attachment : null,
    //   offer_id : this.offerDetails.id,

    // }
    let jobSession = this.offerDetails.job_session.length > 0 ?this.offerDetails.job_session[0]: {date:null, start_time: ''}
    let jobDetail = this.offerDetails.job_detail.job_recurring;
    // debugger
    this.editOfferForm.patchValue({
      price : this.offerDetails.accepted_price.replace("$",""),
      message : this.offerDetails.message,
      attachment : null,
      offer_id : this.offerDetails.id,
      
      start_date : jobDetail && jobDetail.start_date ? moment(jobDetail.start_date, 'YYYY-MM-DD').toISOString() : '',
      schedule_date : jobSession.date ? moment(jobSession.date, 'YYYY-MM-DD').toISOString() : '',
      time : moment(jobSession.start_time).format('HH:mm a') || (jobDetail && jobDetail.time ? moment(jobDetail.time).format('HH:mm a'): '')
    });
    if(jobDetail){
      this.editOfferForm.patchValue({
        end_date: jobDetail && jobDetail.end_date ? moment(jobDetail.end_date, 'YYYY-MM-DD').toISOString() : '',
        day: jobDetail && jobDetail.day ? jobDetail.day.split(',') : '',
        date : jobDetail && jobDetail.date ? jobDetail.date.split(',') : '',
      });
    }
   

  }

  onSelectAttachment(evt) {
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

  onSubmit() {
    this.formSubmitted = true;
    this.dateRangeErr = '';
    if(this.editOfferForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError) {
      this.editOfferForm.markAllAsTouched();
      return;
    }else{
      const editOfferValue = this.editOfferForm.value;
      if(this.offerDetails.job_detail.job_type_data == 'recurring' && (editOfferValue.start_date == '' || editOfferValue.end_date == '')){  return}
      else if(this.offerDetails.job_detail.job_type_data == 'one-time' && editOfferValue.schedule_date == ''){ return ;}
      else if(this.offerDetails.job_detail.job_type_data == 'instant-tutoring' && editOfferValue.schedule_date == ''){return ;}
      else if(this.offerDetails.job_detail.job_type_data == 'recurring' ){
        let startdate = moment(editOfferValue.start_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.offerDetails.job_detail.job_type_data == 'one-time'){
       
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.offerDetails.job_detail.job_type_data == 'instant-tutoring'){
       
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      }else if(this.offerDetails.job_detail.job_type_data == 'recurring' && this.offerDetails.job_detail.job_recurring.recurring_type != 'Daily'){
        let dateDiffErr = 1;
        let diff = (moment(editOfferValue.end_date).unix() - moment(editOfferValue.start_date).unix())
        let daysDiff = Math.floor(diff/(60*60*24));
        for(let day=0; day <= daysDiff; day++){
          
          if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly'){
            let currentDay=moment(editOfferValue.start_date).add(day,'day').format('dddd');
            if(editOfferValue.day.indexOf(currentDay.trim()) != -1){
              dateDiffErr = 0;
              
              break;
            } 
          }else if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Monthly'){
            let currentDay=''+ moment(editOfferValue.start_date).add(day,'day').format('D');
            if(editOfferValue.date.indexOf(currentDay.trim()) != -1 || editOfferValue.date.indexOf(+(currentDay).trim()) != -1){
              dateDiffErr = 0;
              
              break;
            }
          }

        }
        if(dateDiffErr == 1){
          this.dateRangeErr = `Unable to create sessions, since provided date range doesn't have selected ${this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly'? 'day': 'date'} in it.`
          return;
        } else {
          this.dateRangeErr = ''
        }
        

       
      }
      // return;
      const formData = new FormData();
      if(this.attachmentFile) {
        formData.append("attachment", this.attachmentFile , this.attachmentFile.name);
      }
      formData.append("message", this.editOfferForm.value.message);
      formData.append("accepted_price", this.editOfferForm.value.price);
      formData.append("offer_id",  this.offerDetails.id);
      formData.append('time', moment(this.editOfferForm.value.time, 'h:mm a').format('HH:mm'));
      if(this.offerDetails.job_detail.job_type_data == 'recurring'){
        formData.append('start_date', moment(editOfferValue.start_date).format('YYYY-MM-DD'));
        formData.append('end_date', moment(editOfferValue.end_date).format('YYYY-MM-DD'))
        if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly'){
          formData.append('day', editOfferValue.day.join());
        }else if (this.offerDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
          formData.append('date', editOfferValue.date.join());
        }
      } else {
        formData.append('schedule_date', moment(editOfferValue.schedule_date).format('YYYY-MM-DD'));
      }
      this.offerService.updateOffer(formData).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        $('#edit_job').modal('hide');
        this.formSubmitted = false;
        this.attachmentFile = null;
        this.editOfferForm.reset();
        this.websocketService.emit('student_contact_list', {user_id: this.offerDetails.tutor_id});
        this.getOffer();
      }, err => {
        this.notifier.error(err.error.error_message);
      });
    }
  }

  openAvailabilityModal(){
    this.formSubmitted = true;
    this.dateRangeErr = '';
    if(this.editOfferForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError) {
      this.editOfferForm.markAllAsTouched();
      return;
    }else{
      const editOfferValue = this.editOfferForm.value;
      if(this.offerDetails.job_detail.job_type_data == 'recurring' && (editOfferValue.start_date == '' || editOfferValue.end_date == '')){ return}
      else if(this.offerDetails.job_detail.job_type_data == 'one-time' && editOfferValue.schedule_date == ''){ return ;}
      else if(this.offerDetails.job_detail.job_type_data == 'instant-tutoring' && editOfferValue.schedule_date == ''){ return ;}
      else if(this.offerDetails.job_detail.job_type_data == 'recurring' ){
        let startdate = moment(editOfferValue.start_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.offerDetails.job_detail.job_type_data == 'one-time'){
       
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.offerDetails.job_detail.job_type_data == 'instant-tutoring'){
       
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      }else if(this.offerDetails.job_detail.job_type_data == 'recurring' && this.offerDetails.job_detail.job_recurring.recurring_type != 'Daily'){
        let dateDiffErr = 1;
        let diff = (moment(editOfferValue.end_date).unix() - moment(editOfferValue.start_date).unix())
        let daysDiff = Math.floor(diff/(60*60*24));
        for(let day=0; day <= daysDiff; day++){
          if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly'){
            let currentDay=moment(editOfferValue.start_date).add(day,'day').format('dddd');
            if(editOfferValue.day.indexOf(currentDay.trim()) != -1){
              dateDiffErr = 0;
              break;
            } 
          }else if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Monthly'){
            let currentDay=''+ moment(editOfferValue.start_date).add(day,'day').format('D');
            if(editOfferValue.date.indexOf(currentDay.trim()) != -1 || editOfferValue.date.indexOf(+(currentDay).trim()) != -1){
              dateDiffErr = 0;
              break;
            }
          }
        }
        if(dateDiffErr == 1){
          this.dateRangeErr = `Unable to create sessions, since provided date range doesn't have selected ${this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly'? 'day': 'date'} in it.`
          return;
        } else {
          this.dateRangeErr = ''
        }
      }
      // return;
      let checkBody =  {start_date:'', end_date: '', start_time:'', job_id:'', tutor_id:'' , mDate:'', day:''}
      if(this.offerDetails.job_detail.job_type_data == 'recurring'){
        checkBody.start_date = moment(editOfferValue.start_date).format('YYYY-MM-DD')
        checkBody.end_date = moment(editOfferValue.end_date).format('YYYY-MM-DD')
        if (this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
          checkBody.day = editOfferValue.day.join();
        } else if (this.offerDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
          checkBody.mDate = editOfferValue.date.join();
        }
        
      } else {
        checkBody.start_date = moment(editOfferValue.schedule_date).format('YYYY-MM-DD')
        checkBody.end_date = moment(editOfferValue.schedule_date).format('YYYY-MM-DD')
      }
      checkBody.job_id = this.offerDetails.job_id,
      checkBody.tutor_id = this.offerDetails.tutor_id
      checkBody.start_time = moment(editOfferValue.time,'hh:mm A').format('HH:mm:ss')
     this.offerService.fetchAvailabilityDates(checkBody).subscribe((res:any)=> {
    if(res.success){
      const formData  = new FormData();
      if(this.attachmentFile) {
        formData.append("attachment", this.attachmentFile , this.attachmentFile.name);
      }
      formData.append("message", this.editOfferForm.value.message);
      formData.append("accepted_price", this.editOfferForm.value.price);
      formData.append("offer_id",  this.offerDetails.id);
      formData.append('time', moment(this.editOfferForm.value.time, 'h:mm a').format('HH:mm'));
      if(this.offerDetails.job_detail.job_type_data == 'recurring'){
        formData.append('start_date', moment(editOfferValue.start_date).format('YYYY-MM-DD'));
        formData.append('end_date', moment(editOfferValue.end_date).format('YYYY-MM-DD'))
        if(this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly'){
          formData.append('day', editOfferValue.day.join());
        }else if (this.offerDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
          formData.append('date', editOfferValue.date.join());
        }
      } else {
        formData.append('schedule_date', moment(editOfferValue.schedule_date).format('YYYY-MM-DD'));
      }
        $('#edit_job').modal('hide');
        this.formSubmitted = false;
        this.attachmentFile = null;
        this.editOfferForm.reset();
      let availabilityArray=[]
      for(let ele in res.data){
        let element = {date: ele, ...res.data[ele], title: this.offerDetails.job_detail.job_title,id:ele}
        availabilityArray.push(element)
      }
      let initialState={availability: availabilityArray, data: res.data, tutor_id: this.offerDetails.tutor_id, formData: formData, offerType: 'edit_student'}
      this.availabilityModal = this.modalService.show(AvailibilityModalComponent,{class:'send_offer_job',initialState})
      this.availabilityModal.content.websocket.subscribe((res:any)=> {
        if(res){
          this.websocketService.emit('student_contact_list', {user_id: this.offerDetails.tutor_id});
          this.getOffer();
        }
      })
    }
     }) 
    }
  }

  downloadAttachment(object,type, filename) {
    let data = {
      type : type,
      mime_type : object.file_type,
      id: object.id
    }
    const Url = `attachment/${data.type}/${data.id}`;
    this.attachmentService.downloadFile(Url, filename);
  }

  getToday() {
    
    this.currentDate = new Date().toISOString();
  }

  change(e) {
  }
  changeStartDate(event){
      this.editOfferForm.get('end_date').setValue('');
      this.editOfferForm.get('end_date').updateValueAndValidity();
  }

  jobTypeChange(value){
    if(value == 'recurring'){
      this.isRecurring = true;
      if(this.offerDetails.job_detail.job_recurring.recurring_type && this.offerDetails.job_detail.job_recurring.recurring_type == 'Monthly'){
        this.recurringTypeField = 'Monthly'
        this.editOfferForm.get('date').setValidators([Validators.required]);
        this.editOfferForm.get('date').updateValueAndValidity()
      } else if(this.offerDetails.job_detail.job_recurring.recurring_type && this.offerDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
        this.recurringTypeField = 'Weekly'
        this.editOfferForm.get('day').setValidators([Validators.required]);
        this.editOfferForm.get('day').updateValueAndValidity()
      }
      this.editOfferForm.get('start_date').setValidators([Validators.required]);
      this.editOfferForm.get('end_date').setValidators([Validators.required]);
      // this.editOfferForm.get('time').setValidators([Validators.required]);
      this.editOfferForm.get('start_date').setValue('');
      this.editOfferForm.get('end_date').setValue('');
      // this.editOfferForm.get('time').setValue('');
      this.editOfferForm.get('start_date').updateValueAndValidity();
      this.editOfferForm.get('end_date').updateValueAndValidity();
      // this.editOfferForm.get('time').updateValueAndValidity();

      this.editOfferForm.get('schedule_date').clearValidators();
      this.editOfferForm.get('schedule_date').setValue('');
      this.editOfferForm.get('schedule_date').updateValueAndValidity();
    }else if(value == 'one-time') {
      this.isRecurring = false;
      this.editOfferForm.get('schedule_date').setValidators([Validators.required]);
      this.editOfferForm.get('schedule_date').setValue('');
      this.editOfferForm.get('schedule_date').updateValueAndValidity();

      this.editOfferForm.get('start_date').clearValidators();
      this.editOfferForm.get('end_date').clearValidators();
      // this.editOfferForm.get('time').clearValidators();
      this.editOfferForm.get('start_date').setValue('');
      this.editOfferForm.get('end_date').setValue('');
      // this.editOfferForm.get('time').setValue('');
      this.editOfferForm.get('start_date').updateValueAndValidity();
      this.editOfferForm.get('end_date').updateValueAndValidity();
      // this.editOfferForm.get('time').updateValueAndValidity();
    } else if(value == 'instant-tutoring') {
      this.isRecurring = false;
      this.editOfferForm.get('schedule_date').setValidators([Validators.required]);
      this.editOfferForm.get('schedule_date').setValue('');
      this.editOfferForm.get('schedule_date').updateValueAndValidity();

      this.editOfferForm.get('start_date').clearValidators();
      this.editOfferForm.get('end_date').clearValidators();
      // this.editOfferForm.get('time').clearValidators();
      this.editOfferForm.get('start_date').setValue('');
      this.editOfferForm.get('end_date').setValue('');
      // this.editOfferForm.get('time').setValue('');
      this.editOfferForm.get('start_date').updateValueAndValidity();
      this.editOfferForm.get('end_date').updateValueAndValidity();
      // this.editOfferForm.get('time').updateValueAndValidity();
    }
  }
  loadMore(){
    this.p = 100;
    this.loadMoreBtn = false;
  }

  showLess(){
    this.p = 5;
    this.loadMoreBtn = true;
  }
  cancelOffer() {
    // this.cancelOfferObj = ;
    $('#cancelOfferModal').modal('show');
  }

  cancelOfferSubmit() {
    const body = {
      offer_id: this.offerDetails.id,
      status: 4,
      comment: this.reason
    }


    this.offerService.changeOffer(body).subscribe((res: any) => {
      if(!res.success){
        this.notifier.error(res.error_message);
      } else {

      
        this.notifier.success(res.success_message);
        this.cancelOfferObj = {id: null, job_title:''};
        this.reason = '';
        $('#cancelOfferModal').modal('hide');
        this.offerDetails.job_detail.status='Terminated';
        this.getOffer();
      }
        
    }, err => {
      this.notifier.error(err.error.error_message);
    })

  }

  closeCancelModal() {
    this.reason = '';
    $('#cancelOfferModal').modal('hide');
  }

  joinSessionTimer(sessionArray){

    let timeZone = this.localStorageService.getTimeZone()
    let momentNow = moment()
    let currentDate = momentNow.format('DD-MM-YYYY')
    let currentDateTime = momentNow.format('DD-MM-YYYY HH:mm');
    sessionArray.forEach(session => {

      if(moment(session.date , 'YYYY-MM-DD').format('DD-MM-YYYY') == currentDate){
        this.sessionId = session.id;
        this.sessionDetails = session;
        let sessionStartDateTime = moment(session.start_time, 'YYYY-MM-DD HH:mm')
        let sessionEndDateTime = moment(session.end_time, 'YYYY-MM-DD HH:mm')
        if(momentNow.isBetween(sessionStartDateTime.clone().subtract(15,'minutes') , sessionStartDateTime)){
          let countDownDate = sessionStartDateTime.valueOf();
          let distance = countDownDate - momentNow.valueOf();
          this.timer = false;
          this.interval = setInterval(() => {
            this.timer = this.commonService.timerStart(session.start_at);
            if(momentNow.isBetween(sessionStartDateTime, sessionEndDateTime )){
              this.joinSessionBtnDisabled = false;
            } else  if(moment(session.start_at).diff(moment()) <= 0 && moment(session.end_at).diff(moment())>=0){
              this.joinSessionBtnDisabled = true;
            }else{
              this.joinSessionBtnDisabled = false;
            }
            this.joinSessionBtn = true;
          }, 1000);
        
           
        }else if (momentNow.isBetween(sessionStartDateTime, sessionEndDateTime )){
          this.joinSessionBtn = true;
          this.joinSessionBtnDisabled = false;
        } else if (momentNow.isAfter(sessionEndDateTime)){
          this.joinSessionBtn = false;
          this.joinSessionBtnDisabled = false;
        }

        return;
      }
      
    });
  }

  joinSession(){
    this.offerService.joinSession(this.sessionId).subscribe((res:any) => {
      if(res.success == true && res.data != 0){
        this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: this.sessionId});
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

  makePayment(){
    let sessionId = this.sessionId
    if(this.sessionDetails.status != 'Completed' ){
      Swal.fire(
        'Error',
        'Session is already Completed',
        'error'
      );
    }
    Swal.fire({
      title: 'Make Payment?',
      text: `You sure, you want make Transaction of $${this.sessionDetails.total_amount}?`,
      showCancelButton: true,
      confirmButtonText: 'Pay',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.offerService.checkoutPayment(sessionId).subscribe((res: any) => {
          if (res.success) {
            // let session = this.jobsList.find((obj)=> obj.id === sessionId);
            // session ? session['payment_status'] = 1 : '';
            this.sessionDetails['payment_status'] = 'true';
            this.sessionDetails['transaction_id'] = 12;
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

  editSessionTime(obj){
    this.oldTime.start_time = obj.startTime
    this.oldTime.end_time = obj.endTime;
    this.updateSessionForm.patchValue({schedule_date : obj.date, start_time: obj.startTime, end_time: obj.endTime, id: obj.id, duration: obj.totalTime})
    $('#sessionTimeUpdate').modal('show');
  }

  updateTime(){
    let formValue = this.updateSessionForm.value;
    if (this.updateSessionForm.invalid) {
      this.updateSessionForm.markAllAsTouched();
      return;
    } else if(this.updateErr == 'EndTimeLess'){
      return;
    }

    let startTime_ = formValue.schedule_date +moment(formValue.start_time,"HH:mm a").format('HH:mm');
    let  endTime_ = formValue.schedule_date +moment(formValue.end_time,"HH:mm a").format('HH:mm');
    let startTimeUTC_ = moment(formValue.schedule_date,"YYYY-MM-DD").utc().format('YYYY-MM-DD ')+moment(formValue.start_time,"HH:mm a").utc().format('HH:mm');
    let  endTimeUTC_ = moment(formValue.schedule_date,"YYYY-MM-DD").utc().format('YYYY-MM-DD ')+moment(formValue.end_time,"HH:mm a").utc().format('HH:mm');
    let prevStrtTimeUTC_ = moment(formValue.schedule_date,"YYYY-MM-DD").utc().format('YYYY-MM-DD ')+moment(this.oldTime.start_time,"HH:mm a").utc().format('HH:mm');
    let prevEndTimeUTC_ = moment(formValue.schedule_date,"YYYY-MM-DD").utc().format('YYYY-MM-DD ')+moment(this.oldTime.end_time,"HH:mm a").utc().format('HH:mm');
    let message = `Student has updated Session`
    let messageJSON = {schedule_date : moment(formValue.schedule_date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY'), previous_start_time:prevStrtTimeUTC_, previous_end_time: prevEndTimeUTC_, updated_start_time: startTimeUTC_, updated_end_time: endTimeUTC_}
    let body = {id: formValue.id, 
      start_time : startTime_,
       end_time : endTime_,
       updated_object: messageJSON,
     message, student_id : this.offerDetails.student.id , tutor_id : this.offerDetails.tutor_id, job_id : this.offerDetails.job_id
    }
    

    this.offerService.updateSessionTime(body).subscribe((res:any) => {
      if(res.success){
        this.notifier.success(res.success_message);
        this.getOffer();
        $('#sessionTimeUpdate').modal('hide')
      } else {
        this.notifier.error(res.success_message || res.error_message);
      }
    }, err => {
      this.notifier.error(err.error.error_message)
    });


  }

  changeTime2(event){
    
    let formValue=this.updateSessionForm.value;
    //let startTime = moment(formValue.start_time,'hh:mm A');
    let startTime = moment(formValue.start_time,'HH:mm a');
    let endTime = startTime.add(formValue.duration*60,'minutes')
    this.updateSessionForm.patchValue({end_time: endTime.format('HH:mm:ss')});
    if(startTime.format('HH:mm:ss') > endTime.format('HH:mm:ss')){
      this.updateErr = 'EndTimeLess';
        return;
    } else {
      this.updateErr = '';
    }
    // let endTime = moment(formValue.end_time, 'hh:mm A');
    // let current = moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A');
    // if(current.isAfter(moment(formValue.schedule_date+ ' ' + formValue.start_time, 'dddd MM-DD-YYYY hh:mm A'))){
    //   this.updateErr = 'StartTimeLess';
    //   return;
    // }else if(endTime.isSameOrBefore(startTime)){
    //   this.updateErr = 'EndTimeLess';
    //   return;
    // } else if(endTime.diff(startTime,'minutes') != formValue.duration * 60 ){
    //   this.updateErr = 'Durationless';
    //   return;
    // } else {
    //   this.updateErr = ''
    // }
  }
  checkAvailabilityDate(session){
   
    let body={
      tutor_id:this.offerDetails.tutor_id,
      start_time : moment(session.date + ' '+ session.startTime,'dddd MM-DD-YYYY hh:mm A').format('YYYY-MM-DD HH:mm:ss'),
      session_id : session.id
    }
    this.offerService.checkSlotAvailability( body).subscribe((res:any)=> {
      this.oldTime.start_time = session.startTime
    this.oldTime.end_time = session.endTime;
    this.updateSessionForm.patchValue({
      schedule_date: moment(session.date, 'dddd MM-DD-YYYY').format('YYYY-MM-DD'),
      start_time: session.startTime,
      end_time: session.endTime, 
      id: session.id,
      duration: session.totalTime
    })
    $('#sessionTimeUpdate').modal('show');
      let date = moment(session.date,'dddd MM-DD-YYYY').format('YYYY-MM-DD')
      if( res.availability && res.availability.length > 0 ){
        let availabilityArray = res.availability
        availabilityArray.forEach(ele => {
          ele.start_time = date + ' ' + ele.start_time;
          ele.end_time = date + ' ' + ele.end_time;
        });
        this.availablilitySlots = this.calculateAvalibilitySlot(res.availability)
      } else {

      }
      if( res.booked_slots && res.booked_slots.length > 0) this.bookedSlots = this.calculateAvalibilitySlot(res.booked_slots)
   
      // this.checkTimeSlotError()
    })
  }

  
  checkTimeSlotError(){
      let value = this.updateSessionForm.value;
      let startTime = moment(value.schedule_date + ' '+ value.start_time,'YYYY-MM-DD hh:mm A')
      let endTime = moment(value.schedule_date + ' '+ value.end_time, 'YYYY-MM-DD hh:mm A')
      if(this.availablilitySlots.length == 0){
        this.slotErr = 'Tutor is unavailable for the day';
        this.successMsg = undefined;
        return;
      } else if (startTime.isSameOrAfter(endTime)){
        this.slotErr = 'Start Time and End Time is incorrect';
        this.successMsg = undefined;
        return;
      }
      for(const ele of this.availablilitySlots){
        let start_time = moment(ele.start_time, 'YYYY-MM-DD HH:mm');
        let end_time = moment(ele.end_time, 'YYYY-MM-DD HH:mm') 
        // if(startTime.isBefore(start_time) || startTime.isAfter(end_time) || endTime.isBefore(start_time) || endTime.isAfter(end_time)){
        if(!startTime.isBetween(start_time, end_time, undefined, '[)') || !endTime.isBetween(start_time, end_time, undefined, '(]')){
          this.slotErr = 'This slot is not available for tutoring session. Please change time';
          this.successMsg = undefined;
          // break;
        } else {
          this.slotErr = undefined;
          this.successMsg = 'This slot is available for tutoring session'
          break
        }
      }
      if(this.slotErr){
        return
      }
      for (const ele of this.bookedSlots){
        let start_time = moment(ele.start_time, 'YYYY-MM-DD HH:mm');
        let end_time = moment(ele.end_time, 'YYYY-MM-DD HH:mm') 
        if((startTime.isSameOrAfter(start_time) && startTime.isBefore(end_time))|| (endTime.isAfter(start_time)  &&   endTime.isSameOrBefore(end_time)) ){
          this.slotErr = 'This slot is not available for tutoring session. Please change time';
          this.successMsg = undefined;
          break;
        } else if(startTime.isSameOrBefore(start_time) && endTime.isSameOrAfter(end_time) ){
           this.slotErr = 'This slot is not available for tutoring session. Please change time';
          this.successMsg = undefined;
          break;
        } else {
          this.slotErr = undefined;
          this.successMsg = 'This slot is available for tutoring session'
        }
      }
  }

  calculateAvalibilitySlot(array){
    let slotArray=[]
   for(let element of array) {
      let startTime=moment(element.start_time, 'YYYY-MM-DD HH:mm');
      let endTime = moment(element.end_time, 'YYYY-MM-DD HH:mm');
      if(slotArray.length == 0){
        if(element.mark_all_day == 1){
          element.start_time = startTime.set({hours: 0 , minutes: 0}).format('YYYY-MM-DD HH:mm')
          element.end_time = endTime.set({hours: 23 , minutes: 59}).format('YYYY-MM-DD HH:mm')
        }
        slotArray.push(element)
      }else if (slotArray.length > 0){
        let selectedSlot;
       for(let ele of slotArray)  {
          let elementStartTime=moment(ele.start_time, 'YYYY-MM-DD HH:mm');
          let elementEndTime = moment(ele.end_time, 'YYYY-MM-DD HH:mm');
          if(!element.mark_all_day || element.mark_all_day == 0){
            if(startTime.isBefore(elementStartTime) &&  endTime.isBetween(elementStartTime, elementEndTime)){
              ele.start_time = startTime.format('YYYY-MM-DD HH:mm')
              ele.end_time = elementEndTime.format('YYYY-MM-DD HH:mm')
              selectedSlot = null
            } else if(startTime.isSameOrAfter(elementStartTime) && endTime.isSameOrBefore(elementEndTime)){
              //do nothing
              selectedSlot = null;
            }else if(startTime.isSameOrBefore(elementEndTime) && endTime.isSameOrAfter(elementEndTime)){
              ele.end_time = endTime.format('YYYY-MM-DD HH:mm')
              ele.start_time = elementStartTime.format('YYYY-MM-DD HH:mm');
              selectedSlot = null
            } else if(startTime.isSameOrBefore(elementStartTime) && endTime.isSameOrAfter(elementEndTime)){
              ele.end_time = endTime.format('YYYY-MM-DD HH:mm')
              ele.start_time = startTime.format('YYYY-MM-DD HH:mm');
              selectedSlot = null
            }else if (startTime.isSame(elementStartTime) && endTime.isSame(elementEndTime)){
              // Do Nothing
              selectedSlot = null
            }else {
              selectedSlot = element
              
            }
          } else if (ele.mark_all_day == 1){
            
            ele.start_time = startTime.set({hours: 0 , minutes: 0}).format('YYYY-MM-DD HH:mm')
            ele.end_time = endTime.set({hours: 23 , minutes: 59}).format('YYYY-MM-DD HH:mm')
            slotArray = [];
            slotArray.push(ele);
            break;
          }
        }
        if(selectedSlot){
          slotArray.push(selectedSlot);
        }
      }
    };
    slotArray = slotArray.sort((a,b)=> a.start_time > b.start_time ? 1 : -1)
    return slotArray
  }

  changeTime(event) {
    let formValue = this.updateSessionForm.value;
    let startTime = moment(formValue.start_time,'hh:mm a');
    this.updateSessionForm.patchValue({end_time: startTime.add(this.offerDetails.job_detail.duration * 60,'minutes').format('HH:mm:ss')});

    let body={
      tutor_id:this.offerDetails.tutor_id,
      start_time:moment(formValue.schedule_date+' '+formValue.start_time,'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD HH:mm'),
      end_time:moment(formValue.schedule_date+' '+formValue.start_time,'YYYY-MM-DD hh:mm A').add(this.offerDetails.job_detail.duration * 60,'minutes').format('YYYY-MM-DD HH:mm'),
      session_id : formValue.id
    }
    this.offerService.checkSelectedSlotAvailability( body).subscribe((res:any)=> {
      if(res.success){
        this.notifier.success(res.success_message);
      } else {
        this.notifier.error(res.error_message);
      }
    })



    // let formValue = this.updateSessionForm.value;
    // let startTime = moment(formValue.start_time,'hh:mm a');
    // let endTime = startTime.clone().add(this.offerDetails.job_detail.duration * 60,'minutes')
    // this.updateSessionForm.patchValue({end_time: endTime.format('HH:mm:ss')});
    // // this.checkTimeSlotError();
    // if(startTime.format('HH:mm:ss') > endTime.format('HH:mm:ss')){
    //   this.updateErr = 'EndTimeLess';
    //     return;
    // } else {
    //   this.updateErr = '';
    // }
  }

  timeSlot(time){
    return moment(time, 'YYYY-MM-DD HH:mm').format('hh:mm A')
  }



}
