import { Component, OnInit, ViewChild } from '@angular/core';
import interactionPlugin from "@fullcalendar/interaction"; // for dateClick
import { OptionsInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { FullCalendarComponent } from "@fullcalendar/angular";
import * as moment from 'moment-timezone';
import {AsyncRequestService} from '../../../core/services/async-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {BsModalRef} from 'ngx-bootstrap';
import { AlertService, WebsocketService , LocalStorageService } from '@app/shared/_services';
import { Subject } from 'rxjs';
import { StudentService } from '../../../../app/student/student.service';
import { CommonService } from '@app/common/services/common.service';


declare const $:any

@Component({
  selector: 'app-availibility-modal',
  templateUrl: './availibility-modal.component.html',
  styleUrls: ['./availibility-modal.component.scss']
})
export class AvailibilityModalComponent implements OnInit {

  websocket: Subject<boolean> = new Subject<boolean>();
  @ViewChild("calendar", { static: false })

  calendarComponent: FullCalendarComponent; // the #calendar in the template
  
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
  availability: any;
  data;
  tutor_id;
  sessionUpdateForm: FormGroup;
  duration;
  result;
  job_sessions;
  selected_date;
  availablilitySlots = [];
  bookedSlots = [];
  slotErr;
  successMsg;
  updated_offer_id;
  formData : FormData;
  offerType = 'send_student';
  redSlotsErr: boolean = false;
  // socketData;
  isSlotSelected: boolean = false;


  constructor(private asyncService: AsyncRequestService, 
    private formBuilder: FormBuilder, 
    public modalRef: BsModalRef,
    private notifierService : AlertService,
    private studentService : StudentService,
    private websocketService: WebsocketService,
    private commonService: CommonService,
    private localStorage: LocalStorageService,


    ) { }

  ngOnInit() {
    this.setFormFields()
    this.checkUnavailableSlot()
  }

  setFormFields(){
    return this.sessionUpdateForm = this.formBuilder.group({
      tutor_id: [null, [Validators.required]],
      date: [null, [Validators.required]],
      startTime:[null, [Validators.required]],
      endTime:[null, [Validators.required]],
      start_time: [null,[]],
      end_time : [null, []]
    })
  }

  get form(){
    return this.sessionUpdateForm.controls
  }
  checkUnavailableSlot(){
    for(let ele of this.availability){
      if(ele.availability == 0){
        this.redSlotsErr = true;
        break;
      } else {
        this.redSlotsErr = false;
      }
    }
  }

  renderPopover(event: any) {
    if(event.event.extendedProps.availability == 0){
      event.el.classList.add('unavailable_slot')
      event.el.classList.remove('available_slot')
    } else if (event.event.extendedProps.availability == 1){
      event.el.classList.add('available_slot')
      event.el.classList.remove('unavailable_slot')
    }
  }
  selectDateRange(event: any, template: any, bypass = false) {}
  onDayRender(event: any) {
  }
  handleDateClick(arg, template) {}
  getEventsDetails(event: any, template: any) {

    let startDateTime= moment(event.event.extendedProps.start_time,'YYYY-MM-DD HH:mm')
    let endDateTime = moment(event.event.extendedProps.end_time,'YYYY-MM-DD HH:mm')
    let differnce = endDateTime.diff(startDateTime, 'minutes')
    this.duration=differnce;
    this.job_sessions = this.availability.filter(ele => ((ele.availability == 1) || (ele.availability == 0)));
    this.sessionUpdateForm.patchValue({date: startDateTime.format('YYYY-MM-DD'), startTime: startDateTime.format('hh:mm A').toLowerCase(), endTime: endDateTime.format('hh:mm A').toLowerCase(), tutor_id: this.tutor_id})
    this.slotErr = undefined;
    this.successMsg = undefined;
    this.isSlotSelected = true;
    this.selected_date = startDateTime.format('YYYY-MM-DD'),
    this.checkAvailabilityDate()
    // this.sessionUpdateForm.controls.startTime.setValue(startDateTime.format('hh:mm A').toLowerCase())
    // this.sessionUpdateForm.controls.endTime.setValue(endDateTime.format('hh:mm A').toLowerCase());
    // this.sessionUpdateForm.controls.startTime.updateValueAndValidity();
    // this.sessionUpdateForm.controls.endTime.updateValueAndValidity();

  }

  checkAvailabilityDate(){
    if(this.sessionUpdateForm.invalid){
      this.sessionUpdateForm.markAllAsTouched();
      return
    }
    let value=this.sessionUpdateForm.value
    
    let body={
      tutor_id:this.tutor_id,
      start_time : moment(value.date+' '+value.startTime, 'YYYY-MM-DD hh:mm a').format('YYYY-MM-DD HH:mm:ss')
    }
    this.asyncService.postRequest('tutor/availability/get-available-slot', body).subscribe((res:any)=> {
      this.updateAvailabilitySession(true);
      this.result=res;
      this.availablilitySlots = this.calculateAvalibilitySlot(res.availability)
      // if( res.availability && res.availability.length > 0 ){
      //   let availabilityArray = res.availability
      //   // availabilityArray.forEach(ele => {
      //   //   ele.start_time = value.date + ' ' + ele.start_time;
      //   //   ele.end_time = value.date + ' ' + ele.end_time;
      //   // });
      //   this.availablilitySlots = this.calculateAvalibilitySlot(res.availability)
      // } 
      this.bookedSlots = res.booked_slots;
  //     if( res.booked_slots && res.booked_slots.length > 0) this.bookedSlots = this.calculateAvalibilitySlot(res.booked_slots)
      // this.checkTimeSlotError()
    })
  }


  nextPreviousFunction(type){

    let value=this.sessionUpdateForm.value
    if(type =='next'){
      value.date =  moment(value.date, "YYYY-MM-DD").add(1, 'day').format('YYYY-MM-DD');
    }

    if(type =='previous'){
      value.date =  moment(value.date, "YYYY-MM-DD").subtract(1, 'day').format('YYYY-MM-DD');
    }
    let body={
      tutor_id:this.tutor_id,
      start_time : moment(value.date+' '+value.startTime, 'YYYY-MM-DD hh:mm a').format('YYYY-MM-DD HH:mm:ss')
    }

    this.asyncService.postRequest('tutor/availability/get-available-slot', body).subscribe((res:any)=> {
      this.availablilitySlots = res.availability;

      if( res.availability && res.availability.length > 0 ){
        this.availablilitySlots = this.calculateAvalibilitySlot(res.availability)
      } 
      this.bookedSlots = res.booked_slots;
      this.selected_date = value.date;
    })
  }

  checkTimeSlotError(){
    if(this.result){
      // debugger;
      let value = this.sessionUpdateForm.value;
      let startTime = moment(value.date + ' '+ value.startTime,'YYYY-MM-DD hh:mm A')
      let endTime = moment(value.date + ' '+ value.endTime, 'YYYY-MM-DD hh:mm A')
      if(this.availablilitySlots.length == 0){
        this.slotErr = 'Tutor is unavailable for the day';
        this.successMsg = undefined;
        return;
      } 
      // else if (startTime.isSameOrAfter(endTime)){
      //   this.slotErr = 'Start Time and End Time is incorrect';
      //   this.successMsg = undefined;
      //   return;
      // }
      for(const ele of this.availablilitySlots){
        let start_time = moment(ele.start_time, 'YYYY-MM-DD HH:mm');
        let end_time = moment(ele.end_time, 'YYYY-MM-DD HH:mm') 
        // changes by sabhya
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
        } else if(startTime.isSameOrBefore(start_time) && endTime.isSameOrAfter(end_time)){
           this.slotErr = 'This slot is not available for tutoring session. Please change time';
          this.successMsg = undefined;
          break;
        } else {
          this.slotErr = undefined;
          this.successMsg = 'This slot is available for tutoring session'
        }
      }

      this.checkUnavailableSlot()

    }
  }

  calculateAvalibilitySlot(array){

  
    let slotArray=[]
   for(let element of array) {
    //  debugger
      let startTime=moment(element.start_time, 'HH:mm');
      let endTime = moment(element.end_time, 'HH:mm');
      // debugger;
      // return []
      // if(slotArray.length == 0){
        if(element.mark_all_day == 1){
          element.start_time = startTime.format('YYYY-MM-DD HH:mm')
          element.end_time = endTime.format('YYYY-MM-DD HH:mm')
          slotArray.push(element);
        // break;
        } else {
          element.start_time = startTime.format('YYYY-MM-DD HH:mm')
          element.end_time = endTime.format('YYYY-MM-DD HH:mm');
          slotArray.push(element);
        }
        
      // }else if (slotArray.length > 0){
        
      //   let selectedSlot;
      //  for(let ele of slotArray)  {
      //     let elementStartTime=moment(ele.start_time, 'YYYY-MM-DD HH:mm');
      //     let elementEndTime = moment(ele.end_time, 'YYYY-MM-DD HH:mm');
      //     if(!element.mark_all_day || element.mark_all_day == 0){
      //       if(startTime.isBefore(elementStartTime) &&  endTime.isBetween(elementStartTime, elementEndTime)){
      //         ele.start_time = startTime.format('YYYY-MM-DD HH:mm')
      //         ele.end_time = elementEndTime.format('YYYY-MM-DD HH:mm')
      //         selectedSlot = null
      //       } else if(startTime.isSameOrAfter(elementStartTime) && endTime.isSameOrBefore(elementEndTime)){
      //         //do nothing
      //         selectedSlot = null;
      //       }else if(startTime.isSameOrBefore(elementEndTime) && endTime.isSameOrAfter(elementEndTime)){
      //         ele.end_time = endTime.format('YYYY-MM-DD HH:mm')
      //         ele.start_time = elementStartTime.format('YYYY-MM-DD HH:mm');
      //         selectedSlot = null
      //       } else if(startTime.isSameOrBefore(elementStartTime) && endTime.isSameOrAfter(elementEndTime)){
      //         ele.end_time = endTime.format('YYYY-MM-DD HH:mm')
      //         ele.start_time = startTime.format('YYYY-MM-DD HH:mm');
      //         selectedSlot = null
      //       }else if (startTime.isSame(elementStartTime) && endTime.isSame(elementEndTime)){
      //         // Do Nothing
      //         selectedSlot = null
      //       }else {
      //         selectedSlot = element
              
      //       }
      //     } else if (ele.mark_all_day == 1){
            
      //       ele.start_time = startTime.format('YYYY-MM-DD HH:mm')
      //       ele.end_time = endTime.format('YYYY-MM-DD HH:mm')
      //       slotArray = [];
      //       slotArray.push(ele);
      //       break;
      //     }
      //   }
      //   if(selectedSlot){
          // slotArray.push(selectedSlot);
      //   }
      // }
    };
    slotArray = slotArray.sort((a,b)=> a.start_time > b.start_time ? 1 : -1)
    return slotArray
  }

  changeTime(event) {
    let formValue = this.sessionUpdateForm.value;
    let startTime = moment(formValue.startTime,'hh:mm a');
    // let endTime = startTime.clone().add(formValue.duration*this.duration,'minutes')
    this.sessionUpdateForm.patchValue({endTime: startTime.add(this.duration,'minutes').format('hh:mm a')});
    this.updateAvailabilitySession(false)
    // this.checkTimeSlotError();
    // if(startTime.format('HH:mm:ss') > endTime.format('HH:mm:ss')){
    //   this.updateErr = 'EndTimeLess';
    // }else {
    //   this.updateErr = ''
    // }
  }

  updateAvailabilitySession(change){
    let formValue = this.sessionUpdateForm.value;
    let new_array = this.availability.map(ele => JSON.parse(JSON.stringify(ele)));

    let find = new_array.find((ele) => ele.id == formValue.date)
    let old:any = {};
    if(find){
      old.start_time = find.start_time;
      old.end_time = find.end_time;
      find.start_time = moment(formValue.date + ' ' + formValue.startTime,'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD HH:mm')
      find.end_time = moment(formValue.date + ' ' + formValue.endTime,'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD HH:mm')
      find.availability = 1;
     
    } 
    this.slotErr= undefined;
    this.successMsg = undefined;
    this.checkUnavailableSlot();
    let endTime = moment(formValue.date+' '+formValue.startTime,'YYYY-MM-DD HH:mm a').add(this.duration,'minutes').format('YYYY-MM-DD HH:mm a');
    this.asyncService.postRequest('tutor/availability/check-available-slot', {
      start_time:moment(formValue.date+' '+formValue.startTime,'YYYY-MM-DD HH:mm a').format('YYYY-MM-DD HH:mm'),
      end_time:moment(endTime, 'YYYY-MM-DD HH:mm a').format('YYYY-MM-DD HH:mm'),
      tutor_id:this.tutor_id
    }).subscribe((res:any)=> {
      if(res.success){
        this.notifierService.success(res.success_message);
        this.availability = new_array;
      }else{
        this.sessionUpdateForm.patchValue({startTime: moment(old.start_time).format('hh:mm a'),
           endTime: moment(old.end_time).format('hh:mm a'),
          tutor_id: this.tutor_id
        })
        this.notifierService.error(res.error_message);
        if(!change){
          let body={
            tutor_id:this.tutor_id,
            start_time : moment(formValue.date+' '+formValue.startTime, 'YYYY-MM-DD hh:mm a').format('YYYY-MM-DD HH:mm:ss')
          }
          this.asyncService.postRequest('tutor/availability/get-available-slot', body).subscribe((res:any)=> {
            this.availablilitySlots = this.calculateAvalibilitySlot(res.availability)
            this.bookedSlots = res.booked_slots;
            if(this.availablilitySlots.length > 0)
              this.redSlotsErr = true;
          })
        }
        
      }
    })
  }
  removeAvailabilitySlot(){
    let index;
    let formValue = this.sessionUpdateForm.value;
    let new_array = this.availability.map(ele => JSON.parse(JSON.stringify(ele)));

    let find = new_array.findIndex(ele => ele.id == formValue.date)
    if(find > -1){
      
      this.availability = [...new_array.slice(0,find), ...new_array.slice(find+1)]

    } 

    this.slotErr= undefined;
    this.successMsg = undefined;
    setTimeout(()=> {
      this.calendarComponent.getApi().render();
    },1000)

    this.sessionUpdateForm.reset();
    this.checkUnavailableSlot();
    this.availablilitySlots = [];
    this.bookedSlots = [];
    this.isSlotSelected = false;
  }



  sendOffer(){
   
    let job_sessions = this.availability.filter(ele => ele.availability == 1)
    if(this.formData.has('job_sessions')){this.formData.delete('job_sessions')}
    this.formData.append('job_sessions', JSON.stringify(job_sessions))
    let url
    if(this.offerType == 'send_student'){
      url='jobs/send-offer';
    }else if(this.offerType == 'edit_student'){
      url = 'jobs/offer-update'
    } else if (this.offerType == 'edit_tutor'){
      url = 'jobs/tutor-edit-offer'
    }
    if(url){
      this.asyncService.postRequest( url, this.formData).subscribe((res:any)=> {
        if(res.success){
          this.notifierService.success(res.success_message);
           this.modalRef.hide();
           this.websocket.next(true);
          }
        else if(!res.success) this.notifierService.error(res.success_message || res.error_message)
        
      }, err => {
        this.notifierService.error(err.error.error_message || 'Unable to submit offer')
      })
    } else {
      this.notifierService.error('Unable to submit offer')
    }
  }

  timeSlot(time){
    return moment(time, 'HH:mm').format('hh:mm A')
  }
  BookedtimeSlot(time){
    return moment(time, 'YYYY-MM-DD HH:mm').format('hh:mm A')
  }

  checkGreenSlot(){
    if(this.availability.length == 0){
      return false
    } else if (this.availability.length == 1 && this.availability[0].availability == 0){
      return false
    }else if(this.availability.length == 1 && this.availability[0].availability == 1){
      return true
    }else if (this.availability.length > 1){
      for(let ele of this.availability){
        if(ele.availability == 1){
          return true;
          break;
        }
      }

      return false
    } 
  }

  openWarningModal(){
    let isGreen = this.checkGreenSlot()
    if(!isGreen){
      this.notifierService.error("Tutor is unavailable for this slot please check tutor's availability .")
      return;
    } 
    if(this.redSlotsErr){
      $('#warning').modal('show')
      return
    } else {
      if(this.offerType != 'tutor-offer-accept')
        this.sendOffer()
      else
        this.acceptTutorOffer()
    }
  }

  closeWarningModal(){
    $('#warning').modal('hide');
    if(this.offerType != 'tutor-offer-accept')
        this.sendOffer()
      else
        this.acceptTutorOffer()
  }


  acceptTutorOffer(){
   
    let job_sessions = this.availability.filter(ele => ele.availability == 1)
    if(this.formData.has('job_sessions')){this.formData.delete('job_sessions')}
      this.formData.append('job_sessions', JSON.stringify(job_sessions))
    this.formData.append('offer_id' , this.updated_offer_id)
    this.formData.append('status' , '1')
     let userId = this.localStorage.getRefId();

    this.studentService.changeTutorOffer(this.formData).subscribe((res:any) => {
      if(res.success){
        this.notifierService.success(res.success_message);
        this.modalRef.hide();
        this.websocket.next(true);
      //   this.websocketService.emit('message_read',{message_board_room_id : this.ChatDetailsTutor.message_board_room_id , user_id : userId});
      //   this.commonService.sendNotification({
      //     'receiver_id' : this.ChatDetailsTutor.receiver_id,
      //     'reference_id' : this.ChatDetailsTutor.message_board_room_id,
      //     'notification'  : 'Offer Accepted',
      //     'notification_message' : `Offer for ${this.ChatDetailsTutor.job_title} is accepted`,
      //     'type' : 'job_offer'
      // })
       
      }else {
        this.notifierService.error(res.success_message);
      }
    }, err => {
      this.notifierService.error(err.error_message);
    })
  }

}
