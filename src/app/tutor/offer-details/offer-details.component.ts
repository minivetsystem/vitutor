import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorService } from '../tutor.service';
import { AlertService, AttachmentService, LocalStorageService, WebsocketService } from '@app/shared/_services';
declare const $: any;
import * as moment from 'moment-timezone';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/common/services/common.service';
import {AvailibilityModalComponent} from '../../shared/_components/availibility-modal/availibility-modal.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit {
  @ViewChild('reason', { static: false }) reason: ElementRef;
  p: number = 5;
  offerId;
  isRecurring;
  currentDate;
  recurringTypeField = '';
  OfferDetails = {
    accepted_price: '', job_id: null, tutor_id: null, job_session: [], offer_sent_on: '', image_title: '', message: '', attachment: null, file_type: null, image_url: '', id: '', status: '', job_detail: {
      proposed_start_time: '',
      job_title: '', price: '', job_type_data: '', duration: 1, schedule_date: '', created_at: '', price_type: '', id: '', status: '', job_recurring: null, job_category: '', sub_category_id: '', job_description: '', job_type: '', job_attachment: []
    },
    student: {
      id: null, full_name: '', image_url: '', first_name: '', last_name: '', total_tutor_hired: 0, total_job_created: 0, location: { state: '', city: '', country: '' }
    }, tutor: { id: null, full_name: '', image_url: '' }, price: 1
  };
  acceptOfferObj = { job_title: '', price: '', id: '', accepted_price: '' };
  acceptSubmitted = false;
  acceptReason = ''
  rejectOfferObj = { id: null, job_title: '' };
  declineReason = '';
  declineSubmitted = false;
  offerPrice;
  formSubmitted: boolean = false;
  attachmentTypeError: boolean = false;
  attachmentFile: any = null;
  attachmentsizeLimitError: boolean = false;
  getJobTime = [];
  schedule_date = { date: '', time: '' };
  loadMoreBtn = true;
  terminateOfferObj = { id: null, job_title: '' };
  terminateReason = '';
  terminateSubmitted = false;
  uploadedDocuments = null;
  selectedDays = [];
  selectedDates = [];
  daysArray = [{ name: 'Sunday' }, { name: 'Monday' }, { name: 'Tuesday' }, { name: 'Wednesday' }, { name: 'Thursday' }, { name: 'Friday' }, { name: 'Saturday' }]
  datesArray = [];
  dateRangeErr = '';
  selectedDaysCommaSeparated = '';
  editOfferForm: FormGroup;
  validErr;
  menuToggle;
  timer :any;
  startSessionBtn: boolean = false;
  sessionDetails = { status: '' };
  interval;
  sessionId;
  updateSessionForm: FormGroup
  oldTime = { start_time: '', end_time: '' };
  updateErr = null;
  earlySessionObj;
  userId;
  earlyReasonErr;
  userInfo;
  earlySessionBtn = false;
  sessionScheduleDate;
  isJobCompleted = false;
  timezone;
  availabilityModal:BsModalRef
  availablilitySlots = [];
  bookedSlots = [];
  slotErr;
  successMsg;
  constructor(private location: Location, private activeRoute: ActivatedRoute, private tutorService: TutorService, private notifier: AlertService, private attachmentService: AttachmentService, private formBuilder: FormBuilder, private commonService: CommonService, private router: Router, private websocketService: WebsocketService, private localStorageService: LocalStorageService,  private modalService: BsModalService) {
    this.editOffer(); this.updateSessionInit();
    for (let i = 1; i <= 31; i++) {
      this.datesArray.push({ name: i })
    }
  }

  ngOnInit() {
    this.userId = this.localStorageService.getRefId();
    this.userInfo = this.localStorageService.getUserData();
    this.activeRoute.params.subscribe(res => {
      this.offerId = res.id;
      this.getOffer();
    }, error => {
    });
    this.commonService.menuToggle.subscribe((res: number) => {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.localStorageService.timeZone.subscribe((res: any) => {
      if (res) {
        this.timezone = res
      } else {
        this.timezone = this.localStorageService.getTimeZone();
      }
    })
    this.getToday();
  }

  get form(){
    return this.updateSessionForm.controls
  }

  editOffer() {
    return this.editOfferForm = this.formBuilder.group(
      {
        price: [null, [Validators.required, Validators.pattern(/^[+-]?\d+(\.\d+)?$/)]],
        message: [null, [Validators.required]],
        attachment: [null],
        time: ['', [Validators.required]],
        schedule_date: [''],
        start_date: [''],
        end_date: [''],
        offer_id: [''],
        day: [''],
        date: ['']
      });
  }

  updateSessionInit() {
    this.updateSessionForm = this.formBuilder.group({
      jobTitle: [''],
      schedule_date: [''],
      start_time: ['', [Validators.required]],
      end_time: ['', [Validators.required]],
      id: [],
      duration: []
    })
  }

  goBack() {
    this.location.back();
  }

  getOffer() {
    if (this.offerId) {
      this.tutorService.getOfferDetails(this.offerId).subscribe((res: any) => {
        if (res.success) {
          this.validErr = 'valid'
          this.getJobTime = [];
          this.OfferDetails = Object.assign(this.OfferDetails, res.data, { price: res.data.accepted_price.substring(1, res.data.accepted_price.length) });
          this.offerPrice = res.data.accepted_price;
          this.jobTypeChange(this.OfferDetails.job_detail.job_type_data);
          if (this.OfferDetails.job_detail.job_type_data == 'one-time') {
            // let date = moment(this.OfferDetails.job_detail.schedule_date, 'dddd MM-DD-YYYY hh:mm a')
            // let date1 =  moment(this.OfferDetails.job_detail.schedule_date, 'dddd MM-DD-YYYY hh:mm a')
            // let date2 = date.add(this.OfferDetails.job_detail.duration, 'hours');
            this.OfferDetails.job_session.forEach(ele => {
              // debugger
              let body = {
                date: moment(ele.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY'),
                startTime: ele.start_time && ele.start_time != null ? moment(ele.start_at).format('hh:mm A') : ele.start_time,
                start_at: ele.start_at,
                end_at: ele.end_at,
                endTime: ele.end_time && ele.end_time != null ? moment(ele.end_at).format('hh:mm A') : ele.end_time,
                totalTime: this.OfferDetails.job_detail.duration,
                totalAmount: this.OfferDetails.job_detail.price_type == "Hourly" ? this.OfferDetails.job_detail.duration * (+this.OfferDetails.accepted_price.replace('$', '')) : this.OfferDetails.accepted_price.replace('$', ''),
                status: ele.status,
                id: ele.id,
                isEditable: moment().isSameOrAfter(moment(ele.start_time).subtract(30,'minutes')) ? false: true,
                // currentTime: moment().format('YYYY-MM-DD hh:mm A'),
                // momentTime: moment(ele.date + ' ' + ele.start_time, 'YYYY-MM-DD HH:mm:ss').subtract(30,'minutes').format('YYYY-MM-DD hh:mm A')
              }
              this.schedule_date.date = moment(ele.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY'); this.schedule_date.time = moment(ele.start_at).format('h:mm a');
              this.getJobTime.push(body);
            })
          } else if (this.OfferDetails.job_detail.job_type_data == 'recurring') {
            // debugger
            this.OfferDetails.job_session.forEach(ele => {
              let body = {
                date: moment(ele.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY'),
                start_at: ele.start_at,
                end_at: ele.end_at,
                startTime: ele.start_time && ele.start_time != null ? moment(ele.start_at).format('hh:mm A') : ele.start_time,
                endTime: ele.end_time && ele.end_time != null ? moment(ele.end_at).format('hh:mm A') : ele.end_time,
                totalTime: this.OfferDetails.job_detail.duration,
                totalAmount: this.OfferDetails.job_detail.price_type == "Hourly" ? this.OfferDetails.job_detail.duration * (+this.OfferDetails.accepted_price.replace('$', '')) : this.OfferDetails.accepted_price.replace('$', ''),
                status: ele.status,
                id: ele.id,
                isEditable: moment().isSameOrAfter(moment(ele.start_time).subtract(30,'minutes')) ? false: true,
                // currentTime: moment().format('YYYY-MM-DD hh:mm A'),
                // momentTime: moment(ele.date + ' ' + ele.start_time, 'YYYY-MM-DD HH:mm:ss').subtract(30,'minutes').format('YYYY-MM-DD hh:mm A')

              }
              this.schedule_date.date = moment(this.OfferDetails.job_detail.job_recurring.start_date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY'); this.schedule_date.time = moment(this.OfferDetails.job_detail.job_recurring.time, 'HH:mm:ss').format('h:mm a');
              this.getJobTime.push(body);
            });
            if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
              this.selectedDays = this.OfferDetails.job_detail.job_recurring.day.split(',');
              this.selectedDaysCommaSeparated = this.selectedDays.join(', ');
            } else if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
              this.selectedDates = this.OfferDetails.job_detail.job_recurring.date.split(',');
            }

          } else if (this.OfferDetails.job_detail.job_type_data == 'instant-tutoring') {

            this.OfferDetails.job_session.forEach(ele => {
              let body = {
                date: moment(ele.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY'),
                start_at: ele.start_at,
                end_at: ele.end_at,
                startTime: ele.start_time && ele.start_time != null ? moment(ele.start_at).format('hh:mm A') : ele.start_time,
                endTime: ele.end_time && ele.end_time != null ? moment(ele.end_at).format('hh:mm A') : ele.end_time,
                totalTime: this.OfferDetails.job_detail.duration,
                totalAmount: this.OfferDetails.job_detail.price_type == "Hourly" ? this.OfferDetails.job_detail.duration * (+this.OfferDetails.accepted_price.replace('$', '')) : this.OfferDetails.accepted_price.replace('$', ''),
                status: ele.status,
                id: ele.id,
                isEditable: moment().isSameOrAfter(moment(ele.start_time, 'YYYY-MM-DD HH:mm:ss').subtract(30,'minutes')) ? false: true,
                // currentTime: moment().format('YYYY-MM-DD hh:mm A'),
                // momentTime: moment(ele.date + ' ' + ele.start_time, 'YYYY-MM-DD HH:mm:ss').subtract(30,'minutes').format('YYYY-MM-DD hh:mm A')


              }
              this.schedule_date.date = moment(ele.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY'); this.schedule_date.time = moment(ele.start_at).format('h:mm a');
              this.getJobTime.push(body);
            })
          } else {
            this.getJobTime.push({
              date: '11-12-2021',
              startTime: '11:11AM',
              endTime: '12:11PM',
              totalTime: '1',
              totalAmount: 120,
              status: 'Missed',
              isEditable: false
            })
          }
          if (this.OfferDetails.job_detail.status == 'Join session' && this.getJobTime[this.getJobTime.length - 1].status.toLowerCase() == 'pending' ) {
            this.isJobCompleted = false;
          } else if(this.getJobTime[this.getJobTime.length - 1].status.toLowerCase() == 'missed' || this.getJobTime[this.getJobTime.length - 1].status.toLowerCase() == 'completed'){
             this.isJobCompleted = true;
          } else {
            this.isJobCompleted = true;
          }

          // console.dir(this.getJobTime)
          this.uploadedDocuments = this.OfferDetails.job_detail.job_attachment && this.OfferDetails.job_detail.job_attachment.length > 0 ? this.OfferDetails.job_detail.job_attachment : null
          // this.OfferDetails = res.data;
          // this.OfferDetails.price = this.OfferDetails.accepted_price.substring(1, this.OfferDetails.accepted_price.length)
          this.startSessionTimer(this.OfferDetails.job_session);
        } else {
          this.validErr = 'invalid'
          this.notifier.error(res.success_message)
        }
      }, err => {
        this.validErr = 'invalid'
        this.notifier.error('Offer Id is invalid');

      }
      );
    }
  }
  acceptOffer() {
    this.acceptOfferObj = Object.assign(this.acceptOfferObj, this.OfferDetails.job_detail);
    $('#acceptOfferModal').modal('show');
  }

  rejectOffer() {
    this.rejectOfferObj = Object.assign(this.rejectOfferObj, this.OfferDetails.job_detail);;
    $('#rejectOfferModal').modal('show');
  }


  acceptOfferSubmit() {

    this.acceptSubmitted = true;
    if (this.acceptOfferObj.id == null) {
      return;
    }

    const body = {
      offer_id: this.OfferDetails.id,
      status: 1,
      comment: this.acceptReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
      if(res.success){
        this.notifier.success(res.success_message);
        this.OfferDetails.status = 'Accepted';
        this.acceptSubmitted = false;

        this.commonService.sendNotification({
          receiver_id: this.OfferDetails.student.id,
          reference_id: this.OfferDetails.id,
          notification: this.OfferDetails.job_detail.job_title + ' is accepted by Tutor ',
          notification_message: this.acceptReason,
          type: 'job_offer'
        })
        this.acceptReason = '';
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
    if (this.rejectOfferObj.id == null) {
      return;
    }
    if (this.declineReason == '') {
      return;
    }
    const body = {
      offer_id: this.OfferDetails.id,
      status: 2,
      comment: this.declineReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
      this.notifier.success(res.success_message);
      this.rejectOfferObj = { id: null, job_title: '' };

      this.declineSubmitted = false;
      $('#rejectOfferModal').modal('hide');
      this.commonService.sendNotification({
        receiver_id: this.OfferDetails.student.id,
        reference_id: this.OfferDetails.id,
        notification: this.OfferDetails.job_detail.job_title + ' is Rejected by Tutor ',
        notification_message: this.declineReason,
        type: 'job_offer'
      })
      this.declineReason = '';
      if (res.success) {
        this.OfferDetails.status = 'Declined';
      }

    }, err => {
      this.notifier.error(err.error.error_message);
    })
  }

  closeAcceptModal() {
    this.acceptReason = '';
    this.acceptSubmitted = false;
    $('#acceptOfferModal').modal('hide');
  }
  closeRejectModal() {
    this.declineReason = '';
    this.declineSubmitted = false;
    $('#rejectOfferModal').modal('hide');
  }

  onSelectAttachment(evt) {
    this.attachmentTypeError = false;
    this.attachmentsizeLimitError = false;
    this.attachmentFile = evt.target.files[0];
    const fileSize = parseFloat(Number(this.attachmentFile.size / 1024 / 1024).toFixed(2));
    if (this.attachmentFile.type != 'image/png' && this.attachmentFile.type != 'image/jpeg' && this.attachmentFile.type != 'application/pdf'
      && this.attachmentFile.type != 'application/msword' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      && this.attachmentFile.type != 'application/vnd.ms-excel' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      && this.attachmentFile.type != 'text/plain') {
      this.attachmentFile = null;
      this.attachmentTypeError = true;
    }
    if (fileSize > 5) {
      this.attachmentFile = null;
      this.attachmentsizeLimitError = true;
    }
  }


  downloadAttachment(object, type, filename) {
    let data = {
      type: type,
      mime_type: object.file_type,
      id: object.id
    }
    const Url = `attachment/${data.type}/${data.id}`;
    this.attachmentService.downloadFile(Url, filename);
  }

  loadMore() {
    this.p = 100;
    this.loadMoreBtn = false;
  }

  showLess() {
    this.p = 5;
    this.loadMoreBtn = true;
  }
  terminateOffer() {
    // this.terminateOfferObj = obj;
    $('#terminateOfferModal').modal('show');
  }
  terminateOfferSubmit() {
    this.terminateSubmitted = true;
    if (this.terminateReason == '') {
      return;
    }
    const body = {
      offer_id: this.OfferDetails.id,
      status: 5,
      comment: this.terminateReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
      this.notifier.success(res.success_message);
      this.terminateOfferObj = { id: null, job_title: '' };
      this.terminateReason = '';
      this.terminateSubmitted = false;
      $('#terminateOfferModal').modal('hide');
      this.OfferDetails.status = 'Terminated';
      this.OfferDetails.job_detail.status = 'Terminated';
      this.getOffer();
    }, err => {
      this.notifier.error(err.error.error_message);
    })
  }
  closeTerminateModal() {
    this.terminateReason = '';
    this.terminateSubmitted = false;
    $('#terminateOfferModal').modal('hide');
  }
  // Edit offer 
  editOfferDetails() {

    // this.sentOfferDetails = {
    //   price : this.OfferDetails.accepted_price.replace("$",""),
    //   message : this.OfferDetails.message,
    //   attachment : null,
    //   offer_id : this.OfferDetails.id,

    // }
    let jobSession = this.OfferDetails.job_session.length > 0 ? this.OfferDetails.job_session[0] : { date: null, start_time: '' }
    let jobDetail = this.OfferDetails.job_detail.job_recurring?this.OfferDetails.job_detail.job_recurring:this.OfferDetails.job_detail;
    // debugger
    this.editOfferForm.patchValue({
      price: this.OfferDetails.accepted_price.replace("$", ""),
      message: this.OfferDetails.message,
      attachment: null,
      offer_id: this.OfferDetails.id,

      start_date: jobDetail && jobDetail.start_date ? moment(jobDetail.start_date, 'YYYY-MM-DD').toISOString() : '',
      schedule_date: jobSession.date ? moment(jobSession.date, 'YYYY-MM-DD').toISOString() : '',
      time: moment(jobSession.start_time).format('HH:mm a') || (jobDetail && jobDetail.time ? moment(jobDetail.time).format('HH:mm a') : '')
    });
    if (jobDetail) {
      this.editOfferForm.patchValue({
        end_date: jobDetail && jobDetail.end_date ? moment(jobDetail.end_date, 'YYYY-MM-DD').toISOString() : '',
        day: jobDetail && jobDetail.day ? jobDetail.day.split(',') : '',
        date: jobDetail && jobDetail.date ? jobDetail.date.split(',') : '',
      });
    }
    $('#edit_job').modal('show');
  }


  onSubmit() {
    this.formSubmitted = true;
    this.dateRangeErr = '';
    if (this.editOfferForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError) {
      this.editOfferForm.markAllAsTouched();
      return;
    } else {
      const editOfferValue = this.editOfferForm.value;
      if (this.OfferDetails.job_detail.job_type_data == 'recurring' && (editOfferValue.start_date == '' || editOfferValue.end_date == '')) { return }
      else if (this.OfferDetails.job_detail.job_type_data == 'one-time' && editOfferValue.schedule_date == '') {  return; }
      else if (this.OfferDetails.job_detail.job_type_data == 'instant-tutoring' && editOfferValue.schedule_date == '') {  return; }
      else if(this.OfferDetails.job_detail.job_type_data == 'recurring' ){
        let startdate = moment(editOfferValue.start_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.OfferDetails.job_detail.job_type_data == 'one-time'){
       
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.OfferDetails.job_detail.job_type_data == 'instant-tutoring'){
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      }
      else if (this.OfferDetails.job_detail.job_type_data == 'recurring' && this.OfferDetails.job_detail.job_recurring.recurring_type != 'Daily') {
        let dateDiffErr = 1;
        let diff = (moment(editOfferValue.end_date).unix() - moment(editOfferValue.start_date).unix())
        let daysDiff = Math.floor(diff / (60 * 60 * 24));
        for (let day = 0; day <= daysDiff; day++) {
          if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
            let currentDay = moment(editOfferValue.start_date).add(day, 'day').format('dddd');
            if (editOfferValue.day.indexOf(currentDay) != -1) {
              dateDiffErr = 0;
              break;
            }
          } else if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
            let currentDay = '' + moment(editOfferValue.start_date).add(day, 'day').format('D');
            if (editOfferValue.date.indexOf(currentDay) != -1 || editOfferValue.date.indexOf(+currentDay)) {
              dateDiffErr = 0;
              break;
            }
          }
        }
        if (dateDiffErr == 1) {
          this.dateRangeErr = `Unable to create sessions, since provided date range doesn't have selected ${this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly' ? 'day' : 'date'} in it.`
          return;
        } else {
          this.dateRangeErr = ''
        }
      }
      const formData = new FormData();
      if (this.attachmentFile) {
        formData.append("attachment", this.attachmentFile, this.attachmentFile.name);
      }
      formData.append("message", this.editOfferForm.value.message);
      formData.append("accepted_price", this.editOfferForm.value.price);
      formData.append("offer_id", this.OfferDetails.id);
      formData.append('time', moment(this.editOfferForm.value.time, 'h:mm a').format('HH:mm'));
      if (this.OfferDetails.job_detail.job_type_data == 'recurring') {
        formData.append('start_date', moment(editOfferValue.start_date).format('YYYY-MM-DD'));
        formData.append('end_date', moment(editOfferValue.end_date).format('YYYY-MM-DD'))
        if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
          formData.append('day', editOfferValue.day.join());
        } else if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
          formData.append('mDate', editOfferValue.date.join());
        }
      } else {
        formData.append('schedule_date', moment(editOfferValue.schedule_date).format('YYYY-MM-DD'));
      }
      this.tutorService.updateOffer(formData).subscribe((res: any) => {
        this.notifier.success('Offer has been sent to student for approval' || res.success_message);
        $('#edit_job').modal('hide');
        this.formSubmitted = false;
        this.attachmentFile = null;
        this.editOfferForm.reset();
        // this.websocketService.emit('student_contact_list', {user_id: this.OfferDetails.tutor_id});
        this.getOffer();
        this.commonService.sendNotification({
          receiver_id: this.OfferDetails.student.id,
          reference_id: this.OfferDetails.id,
          notification: 'Job Offer Edit',
          notification_message: this.OfferDetails.job_detail.job_title + ' is edited by Tutor ',
          type: 'job_offer'
        })
      }, err => {
        this.notifier.error(err.error.error_message);
      });
    }
  }
  jobTypeChange(value) {
    if (value == 'recurring') {
      this.isRecurring = true;
      if (this.OfferDetails.job_detail.job_recurring.recurring_type && this.OfferDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
        this.recurringTypeField = 'Monthly'
        this.editOfferForm.get('date').setValidators([Validators.required]);
        this.editOfferForm.get('date').updateValueAndValidity()
      } else if (this.OfferDetails.job_detail.job_recurring.recurring_type && this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
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
    } else if (value == 'one-time') {
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
    } else if (value == 'instant-tutoring') {
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
  getToday() {
    this.currentDate = new Date().toISOString();
  }

  change(e) {
  }
  changeStartDate(event) {
    this.editOfferForm.get('end_date').setValue('');
    this.editOfferForm.get('end_date').updateValueAndValidity();
  }

  startSessionTimer(sessionArray) {
    // debugger
    let timeZone = this.localStorageService.getTimeZone();
    let momentNow = moment(moment().tz(timeZone).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A')
    let currentDate = momentNow.format('DD-MM-YYYY')
    let currentDateTime = moment().format('DD-MM-YYYY HH:mm');
    // sessionArray.forEach(session => {
      for(let session of sessionArray){

      if (moment(session.date, 'YYYY-MM-DD').format('DD-MM-YYYY') == currentDate) {
        this.earlySessionBtn = false;
        this.sessionId = session.id;
        this.sessionDetails = session;
        let sessionStartDateTime = moment(session.start_time, 'YYYY-MM-DD HH:mm')
        let sessionEndDateTime = moment(session.end_time, 'YYYY-MM-DD HH:mm');
        this.sessionScheduleDate = sessionStartDateTime.clone().format('dddd DD-MM-YYYY hh:mm A');
        // if (momentNow.isBetween(sessionStartDateTime.clone().subtract(16, 'minutes'), sessionStartDateTime)) {
        //   this.earlySessionBtn = true;
        //   let countDownDate = sessionStartDateTime.valueOf();
        //   let distance = countDownDate - momentNow.valueOf();
          this.timer = false;
           if(moment(session.start_at).diff(moment()) <= 0 && moment(session.end_at).diff(moment())>=0){
              this.earlySessionBtn = false;
              this.startSessionBtn = true;
            }else if(moment(session.end_at).diff(moment())<=0){
               this.earlySessionBtn = false;
              this.startSessionBtn = false;
            }
            else {
          this.interval = setInterval(() => {
            this.timer = this.commonService.timerStart(session.start_at);
            if(moment(session.start_at).diff(moment()) <= 0 && moment(session.end_at).diff(moment())>=0){
              this.earlySessionBtn = false;
              this.startSessionBtn = true;
            }else  if(moment(session.start_at).diff(moment()) <= 0 && moment(session.end_at).diff(moment())>=15){
              this.earlySessionBtn = true;
              this.startSessionBtn = false;
            } else if (this.timer != false){
              this.earlySessionBtn = true;
              this.startSessionBtn = false;
            }
          }, 1000);
            }
        // } else if (momentNow.isBetween(sessionStartDateTime, sessionEndDateTime)) {
        //   this.startSessionBtn = true;
        //   this.earlySessionBtn = false;
        // } else if (momentNow.isAfter(sessionEndDateTime)) {
        //   this.startSessionBtn = false;
        //   this.earlySessionBtn = false;
        // }

        // return;
        break;
      }
      }

    // });
  }

  startSession() {
    this.tutorService.startSession(this.sessionId).subscribe((res: any) => {
      if (res.success) {
        this.websocketService.emit(`start_session`, {
          full_name: this.userInfo.full_name,
          session_id: this.sessionId,
          tutor_id: this.userId,
          job_id: this.OfferDetails.job_detail.id,
          job_title: this.OfferDetails.job_detail.job_title,
          student_id: this.OfferDetails.student.id
        });
        this.commonService.setSessionToken({ videoUrl: res.data.videourl, session_id: this.sessionId });
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

 
  editSessionTime(obj) {
    this.oldTime.start_time = obj.startTime
    this.oldTime.end_time = obj.endTime;
    this.updateSessionForm.patchValue({
      schedule_date: obj.date,
      start_time: obj.startTime,
      end_time: obj.endTime, 
      id: obj.id,
      duration: obj.totalTime
    })
    $('#sessionTimeUpdate').modal('show');
  }

  updateTime() {
    let formValue = this.updateSessionForm.value;
    if (this.updateSessionForm.invalid) {
      this.updateSessionForm.markAllAsTouched();
      return;
    } else if(this.updateErr == 'EndTimeLess'){
      return;
    }

    // let startTime = moment(formValue.start_time,'HH:mm a');
    // let endTime = moment(formValue.end_time,'HH:mm a');
    // let current = moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A');
    // debugger
    // if (current.isAfter(moment(formValue.schedule_date + ' ' + formValue.start_time, 'dddd MM-DD-YYYY hh:mm A'))) {
    //   this.updateErr = 'StartTimeLess';
    //   return;
    // } else if (endTime.isSameOrBefore(startTime)) {
    //   this.updateErr = 'EndTimeLess';
    //   return;
    // } else if (endTime.diff(startTime, 'minutes') < formValue.duration * 60) {
    //   this.updateErr = 'Durationless';
    //   return;
    // } else {
    //   this.updateErr = ''
    // }

    let message = `Tutor has updated Session`
    let startTime_ = moment(formValue.schedule_date,"MM-DD-YYYY").format('YYYY-MM-DD ')+moment(formValue.start_time,"HH:mm a").format('HH:mm');
    let  endTime_ = moment(formValue.schedule_date,"MM-DD-YYYY").format('YYYY-MM-DD ')+moment(formValue.end_time,"HH:mm a").format('HH:mm');
    let startTimeUTC_ = moment(formValue.schedule_date,"MM-DD-YYYY").utc().format('YYYY-MM-DD ')+moment(formValue.start_time,"HH:mm a").utc().format('HH:mm');
    let  endTimeUTC_ = moment(formValue.schedule_date,"MM-DD-YYYY").utc().format('YYYY-MM-DD ')+moment(formValue.end_time,"HH:mm a").utc().format('HH:mm');
    let prevStrtTimeUTC_ = moment(formValue.schedule_date,"MM-DD-YYYY").utc().format('YYYY-MM-DD ')+moment(this.oldTime.start_time,"HH:mm a").utc().format('HH:mm');
    let prevEndTimeUTC_ = moment(formValue.schedule_date,"MM-DD-YYYY").utc().format('YYYY-MM-DD ')+moment(this.oldTime.end_time,"HH:mm a").utc().format('HH:mm');
    let messageJSON = {schedule_date : formValue.schedule_date, previous_start_time:prevStrtTimeUTC_, previous_end_time: prevEndTimeUTC_, updated_start_time: startTimeUTC_, updated_end_time: endTimeUTC_}
    let body = {
      id: formValue.id, 
      start_time:startTime_, 
      end_time: endTime_,
      updated_object: messageJSON,
      message, student_id: this.OfferDetails.student.id, tutor_id: this.OfferDetails.tutor_id, job_id: this.OfferDetails.job_id
    }

    this.tutorService.updateSessionTime(body).subscribe((res: any) => {
      if (res.success) {
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

  changeTimeSlot(event) {
    let formValue = this.updateSessionForm.value;
    let startTime = moment(formValue.start_time,'HH:mm a');
    let endTime = startTime.clone().add(formValue.duration*60,'minutes')
    this.updateSessionForm.patchValue({end_time: startTime.add(formValue.duration*60,'minutes').format('HH:mm:ss')});
    if(startTime.format('HH:mm:ss') > endTime.format('HH:mm:ss')){
      this.updateErr = 'EndTimeLess';
    }else {
      this.updateErr = ''
    }
    // let endTime = moment(formValue.end_time,'HH:mm a');
    // let current = moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A');
    // if (current.isAfter(moment(formValue.schedule_date + ' ' + formValue.start_time, 'dddd MM-DD-YYYY hh:mm A'))) {
    //   this.updateErr = 'StartTimeLess';
    //   return;
    // } else if (endTime.isSameOrBefore(startTime)) {
    //   this.updateErr = 'EndTimeLess';
    //   return;
    // } else if (endTime.diff(startTime, 'minutes') != formValue.duration * 60) {
    //   this.updateErr = 'Durationless';
    //   return;
    // } else {
    //   this.updateErr = ''
    // }
  }


  earlySessionModal() {
    $('#earlySession').modal('show');
  }

  earlyStartRequest(msg) {
    // if (!msg || msg == '') {
    //   this.earlyReasonErr = true;
    //   return;
    // }
    this.earlyReasonErr = false;
// debugger
    this.websocketService.emit('early_session_start_request', {
      job_id: this.OfferDetails.job_detail.id ? this.OfferDetails.job_detail.id : null,
      receiver_id: this.OfferDetails.student.id ? this.OfferDetails.student.id : null,
      reference_id: this.sessionId,
      notification: 'Tutor wants to early start session ' + this.OfferDetails.job_detail.job_title,
      notification_message: msg,
      type: 'session_early_start',
      tutor_id: this.userId,
      job_title: this.OfferDetails.job_detail.job_title,
      full_name: this.userInfo.full_name,
      schedule_date: moment(this.sessionScheduleDate,'dddd DD-MM-YYYY HH:mm a').format('dddd DD-MM-YYYY hh:mm A'),
    });

    $('#earlySession').modal('hide');
    this.reason.nativeElement.value = '';
    this.notifier.success('Request sent to student successFully');
  }

  sendReason(event) {
    if (event.target.value == '') {
      this.earlyReasonErr = true;
    } else {
      this.earlyReasonErr = false;
    }
  }

  openAvailibilityModal(){
    this.formSubmitted = true;
    this.dateRangeErr = '';
    if (this.editOfferForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError) {
      this.editOfferForm.markAllAsTouched();
      return;
    } else {
      const editOfferValue = this.editOfferForm.value;
      console.log(editOfferValue)
      if (this.OfferDetails.job_detail.job_type_data == 'recurring' && (editOfferValue.start_date == '' || editOfferValue.end_date == '')) {  return }
      else if (this.OfferDetails.job_detail.job_type_data == 'one-time' && editOfferValue.schedule_date == '') { return; }
      else if (this.OfferDetails.job_detail.job_type_data == 'instant-tutoring' && editOfferValue.schedule_date == '') {  return; }
      else if(this.OfferDetails.job_detail.job_type_data == 'recurring' ){
        let startdate = moment(editOfferValue.start_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.OfferDetails.job_detail.job_type_data == 'one-time'){
       
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.OfferDetails.job_detail.job_type_data == 'instant-tutoring'){
        let startdate = moment(editOfferValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + editOfferValue.time,'MM-DD-YYYY HH:mm a').isBefore(moment())){
          this.dateRangeErr = 'Start date time is less then current date time'
          return
        } else {
          this.dateRangeErr = ''
        }
      }
      else if (this.OfferDetails.job_detail.job_type_data == 'recurring' && this.OfferDetails.job_detail.job_recurring.recurring_type != 'Daily') {
        let dateDiffErr = 1;
        let diff = (moment(editOfferValue.end_date).unix() - moment(editOfferValue.start_date).unix())
        let daysDiff = Math.floor(diff / (60 * 60 * 24));
        for (let day = 0; day <= daysDiff; day++) {
          if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
            let currentDay = moment(editOfferValue.start_date).add(day, 'day').format('dddd');
            if (editOfferValue.day.indexOf(currentDay) != -1) {
              dateDiffErr = 0;
              break;
            }
          } else if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
            let currentDay = '' + moment(editOfferValue.start_date).add(day, 'day').format('D');
            if (editOfferValue.date.indexOf(currentDay) != -1 || editOfferValue.date.indexOf(+currentDay)) {
              dateDiffErr = 0;
              break;
            }
          }
        }
        if (dateDiffErr == 1) {
          this.dateRangeErr = `Unable to create sessions, since provided date range doesn't have selected ${this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly' ? 'day' : 'date'} in it.`
          return;
        } else {
          this.dateRangeErr = ''
        }
      }
      let checkBody =  {start_date:'', end_date: '', start_time:'', job_id:'', tutor_id:'' , mDate:'', day:''}
      
      if(this.OfferDetails.job_detail.job_type_data == 'recurring'){
        checkBody.start_date = moment(editOfferValue.start_date).format('YYYY-MM-DD')
        checkBody.end_date = moment(editOfferValue.end_date).format('YYYY-MM-DD')
        if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly') {
          checkBody.day = editOfferValue.day.join();
        } else if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
          checkBody.mDate = editOfferValue.date.join();
        }
        
      } else {
        checkBody.start_date = moment(editOfferValue.schedule_date).format('YYYY-MM-DD')
        checkBody.end_date = moment(editOfferValue.schedule_date).format('YYYY-MM-DD')
      }
      checkBody.job_id = this.OfferDetails.job_id,
      checkBody.tutor_id = this.OfferDetails.tutor_id
      checkBody.start_time = moment(editOfferValue.time,'hh:mm A').format('HH:mm:ss')
      this.tutorService.fetchAvailabilityDates(checkBody).subscribe((res:any)=> {
        if(res.success){
          const formData  = new FormData();
          if(this.attachmentFile) {
            formData.append("attachment", this.attachmentFile , this.attachmentFile.name);
          }
          formData.append("message", this.editOfferForm.value.message);
          formData.append("accepted_price", this.editOfferForm.value.price);
          formData.append("offer_id",  this.OfferDetails.id);
          formData.append('time', moment(this.editOfferForm.value.time, 'h:mm a').format('HH:mm'));
          if(this.OfferDetails.job_detail.job_type_data == 'recurring'){
            formData.append('start_date', moment(editOfferValue.start_date).format('YYYY-MM-DD'));
            formData.append('end_date', moment(editOfferValue.end_date).format('YYYY-MM-DD'))
            if(this.OfferDetails.job_detail.job_recurring.recurring_type == 'Weekly'){
              formData.append('day', editOfferValue.day.join());
            }else if (this.OfferDetails.job_detail.job_recurring.recurring_type == 'Monthly') {
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
            let element = {date: ele, ...res.data[ele], title: this.OfferDetails.job_detail.job_title,id:ele}
            availabilityArray.push(element)
          }
          let initialState={availability: availabilityArray, data: res.data, tutor_id: this.OfferDetails.tutor_id, formData: formData, offerType: 'edit_tutor'}
          this.availabilityModal = this.modalService.show(AvailibilityModalComponent,{class:'send_offer_job',initialState})
          this.availabilityModal.content.websocket.subscribe((res:any)=> {
            if(res){
              this.getOffer();
              this.commonService.sendNotification({
                receiver_id: this.OfferDetails.student.id,
                reference_id: this.OfferDetails.id,
                notification: 'Job Offer Edit',
                notification_message: this.OfferDetails.job_detail.job_title + ' is edited by Tutor ',
                type: 'job_offer'
              })
            } 
          })
        }
      }) 
    }
  }

  openEditModal(session){
  }

  checkAvailabilityDate(session){
    console.log("session",session)
   
  
    let body={
      tutor_id:this.OfferDetails.tutor_id,
      start_time : moment(session.start_at).format('YYYY-MM-DD HH:mm:ss'),
      session_id : session.id
    }
    this.tutorService.checkSlotAvailability( body).subscribe((res:any)=> {
      this.oldTime.start_time = session.startTime
    this.oldTime.end_time = session.endTime;
    this.updateSessionForm.patchValue({
      schedule_date: session.date,
      start_time: session.startTime,
      end_time: session.endTime, 
      id: session.id,
      duration: session.totalTime
    })
    $('#sessionTimeUpdate').modal('show');
      let date = moment(session.start_at).format('YYYY-MM-DD')
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
      let startTime = moment(value.schedule_date + ' '+ value.start_time,'dddd MM-DD-YYYY hh:mm A')
      let endTime = moment(value.schedule_date + ' '+ value.end_time, 'dddd MM-DD-YYYY hh:mm A')
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
        } else if(startTime.isSameOrBefore(start_time) && endTime.isSameOrAfter(end_time)){
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
    // let endTime = startTime.clone().add(formValue.duration*this.duration,'minutes')
    this.updateSessionForm.patchValue({end_time: startTime.add(this.OfferDetails.job_detail.duration * 60,'minutes').format('HH:mm:ss')});
    // this.checkTimeSlotError();
    // if(startTime.format('HH:mm:ss') > endTime.format('HH:mm:ss')){
    //   this.updateErr = 'EndTimeLess';
    // }else {
    //   this.updateErr = ''
    // }

    let body={
      tutor_id:this.OfferDetails.tutor_id,
      start_time:moment(formValue.schedule_date+' '+formValue.start_time,'dddd MM-DD-YYYY hh:mm A').format('YYYY-MM-DD HH:mm'),
      end_time:moment(formValue.schedule_date+' '+formValue.start_time,'dddd MM-DD-YYYY hh:mm A').add(this.OfferDetails.job_detail.duration * 60,'minutes').format('YYYY-MM-DD HH:mm'),
      session_id : formValue.id
    }
    this.tutorService.checkSelectedSlotAvailability( body).subscribe((res:any)=> {
      if(res.success){
        this.notifier.success(res.success_message);
      } else {
        this.notifier.error(res.error_message);
      }
    })
  }

  timeSlot(time){
    return moment(time, 'YYYY-MM-DD HH:mm').format('hh:mm A')
  }
}
