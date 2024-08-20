import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import interactionPlugin from "@fullcalendar/interaction"; // for dateClick
import { OptionsInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { FullCalendarComponent } from "@fullcalendar/angular";
import { LocalStorageService } from '@app/shared/_services/local-storage/local-storage.service';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import { TutorService } from '../tutor.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AsyncRequestService } from '@app/core/services/async-request.service';
declare const $: any;
import { formatDate} from "ngx-bootstrap";
import { checkTime } from "@app/shared/_helpers";
import _ from "lodash";
import { AlertService } from '@app/shared/_services';
import Swal from "sweetalert2";
import { constantVariables } from '@app/shared/_constants/constants';
import {AttachmentService} from '@app/shared/_services/attachment.service';
import { CommonService } from '@app/common/services/common.service';
import { Router } from '@angular/router';
import { WebsocketService} from '@app/shared/_services/websocket.service'

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  @ViewChild('reason', {static: false}) reason: ElementRef;
  @ViewChild("calendar", { static: false })
  calendarComponent: FullCalendarComponent; // the #calendar in the template
  
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
  availability: any;
  private base_url = environment.baseUrl;
  // availability_fetch_url: string = this.base_url + "/tutor/availability/fetch";
  availability_fetch_url: string = this.base_url + "/tutor/availability/fetch-job";  
  token: string;
  
  eventView: any;
  startBtn:boolean
  //  new 
  updateAvailabilityModalTitle = "Update";
  availabilityUpdateForm: FormGroup;
  updateAvailabilitySlotsArray = [];
  rangeDates: any;
  availabilityTypeValue = null;
  setUpdateSubmitFlag: boolean = true;
  updateAvailabilityFormSubmitted = false;
  availability_create_update_url: string = "tutor/availability/create-update";
  calenderDefaultSettingsArrayKeysArray = [];
  swalErrorOption = constantVariables.swalErrorOption;
  deleteAvailabilitySlot = "tutor/availability/slot/delete";
  jobDetails = null;
  readonly=true;
  day_name = '';
  terminateReason = '';
  terminateSubmitted = false;
  terminateOfferObj = {id: null, job_title:''};
  oldDate: boolean = false;
  expired: boolean = false;
  currentDate: boolean = false;
  timer:any;
  interval;
  menuToggle;
  eventDatesArray = [];
  calendarLoader = true;
  earlyStartBtn = false;
  earlySessionObj;
  userId;
  earlyReasonErr;
  userInfo;
  constructor(
    private localStorageService: LocalStorageService,
    private TutorService : TutorService,
    private formBuilder: FormBuilder,
    private asyncRequestService: AsyncRequestService,
    private alertService: AlertService,
    private attachmentService: AttachmentService,
    private commonService: CommonService,
    private router: Router,
    private websocketService: WebsocketService
  ) {
    if (this.localStorageService.getJwtToken()) {
      this.token = JSON.parse(this.localStorageService.getJwtToken().trim());
    }

    this.availabilityUpdateForm = this.formBuilder.group({
      availability: this.formBuilder.array([]),
    });
    this.fetchJobs();
     
  }

  fetchJobs(){
    this.TutorService.getScheduledEvents().subscribe((res) => {
      this.calendarLoader = false;
      this.availability = res;
      this.eventDatesArray = this.availability.map(ele => {
        return ele.id
      });
      for(let ele of this.availability){
        ele.header = ele.title
        ele.title = ele.title + ' (' + moment(ele.start).format('hh:mm a') + ' to ' + moment(ele.end).format('hh:mm a')+ ')'; 
      }
    },
    (error) => {
      this.calendarLoader = false;
    })
  }
  ngOnInit() {
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.userId = this.localStorageService.getRefId();
    this.userInfo = this.localStorageService.getUserData();
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    // this.availability =
    //   `${this.availability_fetch_url}?token=` +
    //   this.token +
    //   `&timeZone=${timezone}`; //default setting for tutor availbility which indicates that user wants to skip those dates
  }

    /**
   * @purpose to render popovers
   * @method renderPopover
   * @param {any} event
   * @memberof BookingCalenderComponent
   */
  renderPopover(event: any) {
    this.eventView = event.view.viewSpec.type;

    // return;
    let currentDate = moment().format('YYYY-MM-DD')
    let dayDate = event.event.id;
    
    if (dayDate <currentDate) {
      // event.el.classList.add("fc-disabled-day");
      event.el.classList.add("expired");
    }
  }

    /**
   * @purpose to render update form with exits data
   * @method selectDateRange
   * @date 2021-01-04
   * @param {*} event
   * @param {*} template
   * @memberof AvailabilityComponent
   */
  selectDateRange(event: any, template: any, bypass = false) {
    
    this.day_name = moment(event.startStr).format('dddd');
    let params = {
      start_date: event.startStr,
      end_date: event.endStr,
      date: event.date,
      range: true,
    };
    this.availabilityTypeValue = null;

    this.updateAvailabilityModalTitle = "Update";
    if (!bypass) {
      let calendarApi = this.calendarComponent.getApi();
      let allEvents = calendarApi.getEvents();
      let _findExitsEventsByDate = _.findIndex(allEvents, [
        "id",
        event.startStr,
      ]);
      if (
        event.startStr < moment().format("YYYY-MM-DD") &&
        _findExitsEventsByDate == -1
      ) {
        calendarApi.unselect();
        // return;
      }
      // if (_findExitsEventsByDate == -1) {
      //   calendarApi.unselect();
      //   this.updateAvailabilityModalTitle = "Add";
      //   // Swal.fire({
      //   //   title: "Set Availability",
      //   //   text:
      //   //     "Selected date has no availability or unavailability do you want to add?",
      //   //   type: "info",
      //   //   customClass: this.swalInfoOption,
      //   //   showCancelButton: true,
      //   //   confirmButtonColor: "#3085d6",
      //   //   cancelButtonColor: "#d33",
      //   //   confirmButtonText: "Yes",
      //   //   cancelButtonText: "Cancel",
      //   // }).then(async (result) => {
      //   //   if (result.value) {
      //   //     // here we need to give option to user to add availability for day
      //   //     await (<any>(
      //   //       this.createAvailabilityForCalenderDay(
      //   //         params,
      //   //         event.startStr,
      //   //         template
      //   //       )
      //   //     ));
      //   //   }
      //   // });
      //   return false;
      // }
    }



    let getAvailabilitySlots = "tutor/availability/get-availability-slots";
    // compare dates
    var nowDate = moment().format("YYYY-MM-DD");
    var selectedDate = moment(event.startStr).format("YYYY-MM-DD");
    // and i checked with if statement
    this.availabilityUpdateForm.controls.availability["controls"].length = [];
    this.asyncRequestService.getRequest(getAvailabilitySlots, params).subscribe(
      (response: any) => {
        this.updateAvailabilitySlotsArray = response.data;
        this.rangeDates = response.dates;
        if (this.updateAvailabilitySlotsArray.length == 0) {
          return;
        }
        for (let index = 0; index < response.dates.length; index++) {
          const element = response.dates[index];
          
          (this.availabilityUpdateForm.get("availability") as FormArray).push(
            this.update_availability_date(element)
          );

          let slots = response.data[response.dates[index].date];
          for (let slot = 0; slot < slots.length; slot++) {
            const currentSlot = slots[slot];
            currentSlot["start_time"] = moment(
              `${currentSlot.start_time}`,
              "hh:mm a"
            ).format("hh:mm A");
            currentSlot["end_time"] = moment(
              `${currentSlot.end_time}`,
              "hh:mm a"
            ).format("hh:mm A");
            (this.availabilityUpdateForm.controls.availability["controls"][
              index
            ].controls.availability_slots as FormArray).push(
              this.create_availability_slots
            );

            if (
              _.findIndex(slots, function (o) {
                return o.mark_all_day == 1 && o.status == 1;
              }) == 0
            ) {
              this.availabilityTypeValue = true;
            } 
            else if (
              _.findIndex(slots, function (o) {
                return o.mark_all_day == 0 && o.status == 0;
              }) == 0
            ) {
              this.availabilityTypeValue = false;
            }else if (
              _.findIndex(slots, function (o) {
                return o.mark_all_day == 1 && o.status == 0;
              }) == 0
            ) {
              this.availabilityTypeValue = false;
            } else if (
              _.findIndex(slots, function (o) {
                return o.mark_all_day == 3 && o.status == 1;
              }) == 0
            ) {
              this.availabilityTypeValue = null;
            } else {
              this.availabilityTypeValue = null;
            }
          }
        }

        this.setUpdateSubmitFlag = true;
        if (nowDate > selectedDate) {
          // if selectedDate is less than today
          this.setUpdateSubmitFlag = false;
        }

        // here attach the template -------------------------
        
        // this.modalRef = this.modalService.show(template, {
        //   class: "modal-lg availabilityModal",
        //   backdrop: "static",
        // });
        $(`#${template}`).modal('show');
      },
      (error: any) => {}
    );
  }

  get availabilityControl(){
    return (this.availabilityUpdateForm.controls.availability as FormGroup)
  }

    /**
   * @purpose to set past dates disabled
   * @method onDayRender
   * @param {*} event
   * @memberof BookingCalenderComponent
   */
  onDayRender(event: any) {
    this.eventView = event.view.viewSpec.type;
    // return;
    let currentDate = moment().format("YYYY-MM-DD");
    let dayDate = moment(event.date).format("YYYY-MM-DD");

    if (dayDate < currentDate) {
      event.el.classList.add("fc-disabled-day");
    }

    
      if(!this.eventDatesArray.includes(dayDate) && dayDate > currentDate){
        event.el.classList.add("grey-background");
      }
    
  }

    /**
   * @purpose handle calender click event
   * @method handleDateClick
   * @param arg
   */
  handleDateClick(arg, template) {
    // $('#dayDetails').modal('show');
    // if(this.eventView == 'timeGridWeek' || this.eventView == 'timeGridDay'){
    //   return;
    // }
    let params = {
      startStr: moment(arg.dateStr, "YYYY-MM-DD").format("YYYY-MM-DD"),
      endStr: moment(arg.dateStr, "YYYY-MM-DD")
        .add(1, "d")
        .format("YYYY-MM-DD"),
        date: moment(arg.dateStr, "YYYY-MM-DD").format("YYYY-MM-DD")
    };

    this.selectDateRange(params, template);
    return;
  }

    /**
   * @purpose to trigger click event for event and display data for event
   * @method getEventsDetails
   * @param {*} event
   * @param {*} template
   * @memberof AvailabilityComponent
   */
  getEventsDetails(event: any, template: any) {
    let timeZone = this.localStorageService.getTimeZone();
    let momentNow = moment(moment().tz(timeZone).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A')
    // this.jobDetails = event.event;
    this.jobDetails = this.availability.find((ev) => {
      return ev.slot_id + '-' + ev.id == event.event.extendedProps.job_id + '-' + event.event.id
    })

    let countDownDate = moment(this.jobDetails.start).valueOf();
    let now = momentNow.valueOf();
    let distance = countDownDate - now;
    this.timer = undefined;
    
     let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    if(moment(this.jobDetails.start).format('DD/MM/YYYY') == momentNow.format('DD/MM/YYYY') ){
    // Update the count down every 1 second
    this.currentDate = true;
      this.interval = setInterval(() => {
        this.timer = this.commonService.timerStart(this.jobDetails.start);;
        if (this.timer == false) {
          this.timer = false;
          this.earlyStartBtn = false;
        }else{
          this.earlyStartBtn = true;
        }
        
        if (moment(this.jobDetails.start).diff(moment()) <= 0 && moment(this.jobDetails.end).diff(moment())>=0) {
          this.startBtn = true;
        } else {
          this.startBtn = false;
        }
      }, 1000);
 
  } else {
    this.startBtn = false;
    this.currentDate = false;
    this.earlyStartBtn = false;
  }
    this.jobDetails.schedule_date = moment(this.jobDetails.start).format('YYYY-MM-DD');
    this.jobDetails.startTime = moment(this.jobDetails.start).format('hh:mm A');
    this.jobDetails.endTime = moment(this.jobDetails.end).format('hh:mm A');
    this.oldDate = moment(this.jobDetails.start).isBefore(moment()) ? true : false;
    this.expired = (moment(this.jobDetails.end).isBefore(moment()) && this.jobDetails.extendedProps.job_status == 'Upcoming') ? true : false;

    this.terminateOfferObj = {id: this.jobDetails.extendedProps.offer_id, job_title: this.jobDetails.header}
    $('#eventDetails').modal('show');
    // if (this.eventView == "timeGridWeek" || this.eventView == "timeGridDay") {
    //   return;
    // }

    // let params = {
    //   dateStr: moment(event.event.start).format("YYYY-MM-DD"),
    // };
    // this.handleDateClick(params, template);
  }

  // new

    /**
   * @purpose tp create availability for particular day
   * @method createAvailabilityForCalenderDay
   * @param {*} params
   * @param {string} startDate
   * @param {TemplateRef<any>} template
   * @memberof AvailabilityComponent
   */
  createAvailabilityForCalenderDay(
    params: any,
    startDate: string,
    template: TemplateRef<any>
  ): void {
    this.availabilityUpdateForm.controls.availability["controls"].length = [];
    let getAvailabilitySlots = "tutor/availability/get-availability-slots";
    // compare dates

    this.asyncRequestService
      .getRequest(getAvailabilitySlots, params)
      .subscribe((response: any) => {
        this.updateAvailabilitySlotsArray = response.data;
        this.rangeDates = response.dates;
        if (this.updateAvailabilitySlotsArray.length == 0) {
          return;
        }
        for (let index = 0; index < response.dates.length; index++) {
          const element = response.dates[index];
          (this.availabilityUpdateForm.get("availability") as FormArray).push(
            this.update_availability_date(element)
          );
          let slots = response.data[response.dates[index].date];
          for (let slot = 0; slot < slots.length; slot++) {
            const data = slots.length;
            // this.day_name = data.day_name;
            (this.availabilityUpdateForm.controls.availability["controls"][
              index
            ].controls.availability_slots as FormArray).push(
              this.create_availability_slots
            );
          }
        }
        this.setUpdateSubmitFlag = true;
        $(`#${template}`).modal('show');
      
        // attach modal here ----------------------------------------
        // this.modalRef = this.modalService.show(template, {
        //   class: "modal-lg availabilityModal",
        //   backdrop: "static",
        // });
      });
  }

    /**
   * @purpose to get availability_date array
   *
   * @param {*} data
   * @returns {FormGroup}
   * @memberof AvailabilityComponent
   */
  update_availability_date(data: any): FormGroup {

    return this.formBuilder.group({
      date: [moment(data.date).format("MM/DD/YYYY")] || [
        formatDate(new Date(data.date), "MM/DD/YYYY"),
      ],
      mark_all_day: [data.mark_all_day],
      id: [data.tutor_availability_id],
      availability_slots: this.formBuilder.array([]),
      day: moment(data.date).format("dddd")
    });
  }

    /**
   * @purpose to create update availability slots
   *
   * @returns {FormGroup}
   * @memberof AvailabilityComponent
   */
  get create_availability_slots(): FormGroup {
    return this.formBuilder.group(
      {
        id: [null],
        start_time: [null, [Validators.required]],
        end_time: [null, [Validators.required]],
        type: [null],
        status:[true]
      },
      {
        validator: checkTime("start_time", "end_time"),
      }
    );
  }

     /**
   * @purpose to create update availability slots
   *
   * @returns {FormGroup}
   * @memberof AvailabilityComponent
   */
  create_availability_slot(data): FormGroup {
    return this.formBuilder.group(
      {
        id: [data.id],
        start_time: [data.start_time, [Validators.required]],
        end_time: [data.end_time, [Validators.required]],
        type: [null],
        status: [true]
      },
      {
        validator: checkTime("start_time", "end_time"),
      }
    );
  }

  testChange(value, index, date){
    let valueFrom = this.availabilityUpdateForm.value

  }


    /**
   * @purpose to submit update availability to server
   *
   * @method onUpdateForm
   * @returns array
   * @memberof AvailabilityComponent
   */
  onUpdateForm() {
    
    this.updateAvailabilityFormSubmitted = true;

    if (!this.availabilityUpdateForm.valid) {
      return;
    }
    // return;
    //calling the server api to save availability
    let value = Object.assign({day:this.day_name},this.availabilityUpdateForm.value)
    if(value.availability[0].mark_all_day == null && this.availabilityTypeValue != null){
      value.availability[0].mark_all_day = this.availabilityTypeValue
    }
    if(value.availability[0].mark_all_day != null && (!value.availability[0].availability_slots || value.availability[0].availability_slots.length == 0 )){
      if(value.availability[0].mark_all_day == false){
        value.availability[0].availability_slots = [{
          id: null, start_time: '12:00 AM', end_time: '11:59 PM', type: 1, status: false
        }]
      } else if(value.availability[0].mark_all_day == true){
        value.availability[0].availability_slots = [{
          id: null, start_time: '12:00 AM', end_time: '11:59 PM', type: 1, status: true
        }]
      }
     
    }
    this.asyncRequestService
      .postRequest(
       'tutor/availability/update-calendar',
       value
      )
      .subscribe(
        (response: any) => {
          this.alertService.success(response.success_message);
          this.updateAvailabilityFormSubmitted = false;
          this.calenderDefaultSettingsArrayKeysArray = [];
          // this.availabilityForm.reset();
          // this.availabilityTypeValue = null;
          $('#dayDetails').modal('hide');
        },
        (errorResponse) => {
          this.alertService.error(errorResponse.error.error_message);
        }
      );
  }

  closeDayModel(name) {
    $(`#dayDetails`).modal('hide');
  }

  closeEventModel(name) {
    $('#eventDetails').modal('hide');
  }

  setShowvalue(formValue, variable) {
    if (formValue == null && (variable == true || variable == false)) {
      return true;
    } else if (formValue == true && variable == true) {
      return true;
    } else if (formValue == false && variable == false) {
      return true;
    } else {
      return false;
    }
  }

    /**
   * @purpose to set controls disable
   * @method setControlDisable
   * @param {*} controls
   * @param {*} data
   * @returns
   * @memberof AvailabilityComponent
   */
  setControlDisable(controls: any, data: any) {
    /**
     * Case 1 first we are checking if status is 3 than slot is booked and user cannot update or delete.
     * Case 2 if user check slots from past dates so user cannot update slots
     */
    var nowDate = moment().format("YYYY-MM-DD");
    var selectedDate = moment(data.date).format("YYYY-MM-DD");
    if (
      data.status == 3 ||
      this.availabilityTypeValue == true ||
      this.availabilityTypeValue == false
    ) {
      controls["controls"].start_time.disable();
      controls["controls"].end_time.disable();
      controls["controls"].type.disable();
      controls["controls"].id.disable();
      controls["controls"].status.disable();
    }

    return false;
  }

    /**
   * @purpose to render validation error for slot
   * @method getCurrentTimeSlot
   * @date 2019-09-06
   * @return array
   * */
  formErrorsIndex = [];
  async getCurrentTimeSlot(
    availability: any,
    children: any,
    currentIndex: number
  ) {
    if (children) {
      let checkError = false;

      for (
        let index = 0;
        index < availability.controls.availability_slots.controls.length;
        index++
      ) {
        var element =
          availability.controls.availability_slots.controls[index].value;

        if (currentIndex != index) {
          if (element.start_time && element.end_time) {
            let exitsStartTime = moment(element.start_time, "hh:mm A");
            let exitsEndTime = moment(element.end_time, "hh:mm A");
            let currentStartTime = moment(children.value.start_time, "hh:mm A");
            let currentEndTime = moment(children.value.end_time, "hh:mm A");
            // this.setAllDayValue(children,availability);
           
            
            let equalStartTime = currentStartTime.isSame(exitsStartTime);
            let equalEndTime = currentEndTime.isSame(exitsEndTime);

            //first check time cannot be equal
            if (equalStartTime && equalEndTime) {
              children.controls["start_time"].setErrors({ incorrect: true });
              checkError = true;
              // this.setAllDayValue(children,availability);
            }
            //check if current selected time in exits start and end time
            if (currentStartTime.isBetween(exitsStartTime, exitsEndTime)) {
              children.controls["start_time"].setErrors({ incorrect: true });
              checkError = true;
              // this.setAllDayValue(children,availability);
            }
            //check if current selected time in exits start and end time
            if (currentEndTime.isBetween(exitsStartTime, exitsEndTime)) {
              children.controls["start_time"].setErrors({ incorrect: true });
              checkError = true;
              // this.setAllDayValue(children,availability);
            }

            // check if exits time in current start and end time
            if (exitsStartTime.isBetween(currentStartTime, currentEndTime)) {
              children.controls["start_time"].setErrors({ incorrect: true });
              checkError = true;
            
              // this.setAllDayValue(children,availability);
            }

            // check if exits exitsEndTime in current start and end time
            if (exitsEndTime.isBetween(currentStartTime, currentEndTime)) {
              children.controls["start_time"].setErrors({ incorrect: true });
              checkError = true;
             
              // this.setAllDayValue(children,availability);
            }
           
            if (
              availability.controls.availability_slots.controls[index].controls
                .start_time.errors &&
              !this.formErrorsIndex.includes(index)
            ) {
              this.formErrorsIndex.push(index);
              // this.setAllDayValue(children,availability);
            }

            if (!checkError) {
              children.controls["start_time"].setValue(
                children.value.start_time
              );
              children.controls["start_time"].setErrors(null);
              //here we check if current element is valid slot than remove from errorArray
              let currentErrorIndex = _.indexOf(
                this.formErrorsIndex,
                currentIndex
              );
              if (currentErrorIndex > -1) {
                this.formErrorsIndex.splice(currentErrorIndex, 1);
              }
              // this.setAllDayValue(children,availability);
            } else {
              // var x: any;
              // x = document.getElementById("appDate_true");
              // x.querySelector(".ngx-timepicker").click();
              // this.setAllDayValue(children,availability);
              // children.controls.markAsTouched();
            }
          }
        } else {
          if (availability.controls.availability_slots.controls.length == 1) {
            children.controls["start_time"].setValue(children.value.start_time);
            children.controls["start_time"].setErrors(null);
            // this.setAllDayValue(children,availability);
            return false;
          }
        }
      }

      if (!checkError && this.formErrorsIndex.length > 0) {
        await this.renderSlotValidation(this.formErrorsIndex, availability);
      }
    }
  }

    /**
   * @purpose to render validation errors
   *
   * @param {*} formErrorsIndex
   * @param {*} availability
   * @memberof AvailabilityComponent
   */
  renderSlotValidation(formErrorsIndex: any, availability: any) {
    for (let index = 0; index < formErrorsIndex.length; index++) {
      const element = formErrorsIndex[index];
      this.markFormGroupTouched(
        availability,
        availability.controls.availability_slots.controls[element],
        element
      );
    }
  }

    /**
   * @purpose to render validation for form
   * @method markFormGroupTouched
   * @private
   * @param {*} availability
   * @param {*} current
   * @param {*} currentIndex
   * @memberof AvailabilityComponent
   */
  private markFormGroupTouched(
    availability: any,
    current: any,
    currentIndex: number
  ) {
    setTimeout(() => {
      this.getCurrentTimeSlot(availability, current, currentIndex);
    }, 500);
  }

  deleteTimeSlot(availability: any, child: any, flag = 0) {
    // return;
    Swal.fire({
      title: "Delete?",
      text: "Are you sure to delete this time slot.",
      type: "error",
      customClass: this.swalErrorOption,
      confirmButtonText: "Confirm",
      showCancelButton: true,
      focusCancel: false,
    }).then((result) => {
      if (result.value) {
        this.removeTimeSlot(availability, child, flag);
      }
    });
  }

    /**
   * @purpose to remove time slot
   * @method removeTimeSlot
   * @param availability
   * @param child
   */
  removeTimeSlot(availability: any, child: number, flag = 0) {

    if (!flag) {
      availability.controls.availability_slots.removeAt(child);
      this.markFormGroupTouched(
        availability,
        availability.controls.availability_slots.controls[child],
        child
      );
      if (availability.controls.availability_slots.length == 0) {
        // this.modalRef.hide();
        // hide model
      }
      return;
    }

    let id = flag;
    this.asyncRequestService
      .deleteRequest(`${this.deleteAvailabilitySlot}/${id}`)
      .subscribe(
        (response: any) => {
          availability.controls.availability_slots.removeAt(child);
          this.updateAvailabilitySlotsArray[
            moment(availability.value.date, "MM/DD/YYYY").format("YYYY-MM-DD")
          ].splice(child, 1);
          
          // return;
          this.alertService.success(response.success_message);
          // this.refreshEvents();
          let newSlot = this.updateAvailabilitySlotsArray[
            moment(availability.value.date, "MM/DD/YYYY").format("YYYY-MM-DD")
          ];
          if (availability.controls.availability_slots.value.length == 0) {
            // this.modalRef.hide();
            // hide model

          } else {
            if (newSlot.length) {
              for (var i = 0; i < newSlot.length; i++) {
                if (newSlot[i].booked_status != 4 && newSlot[i].status != 3) {
                  return;
                }
              }
              // this.modalRef.hide();
              // hide model
            } else {
              // hide model
              // this.modalRef.hide();
            }
          }
          this.markFormGroupTouched(
            availability,
            availability.controls.availability_slots.controls[child],
            child
          );
        },
        (error: any) => {
          this.alertService.error(error.error.error_message);
        }
      );
  }

    /**
   * @purpose to add time slot for update form
   * @method addTimeSlot
   * @param availability
   */
  addTimeSlotForUpdate(availability: any) {
    let lastIndex =
      availability.controls.availability_slots.controls.length - 1;
    let children = availability.controls.availability_slots.controls[lastIndex];

    availability.get("availability_slots").push(this.create_availability_slots);

    if (children) {
      let currentIndex = lastIndex + 1;
      let current =
        availability.controls.availability_slots.controls[currentIndex];

      current.controls["start_time"].setValue(
        moment(children.value.end_time, "hh:mm A")
          .format("hh:mm A")
          .toLowerCase()
      );
      current.controls["end_time"].setValue(
        moment(current.value.start_time, "hh:mm A")
          .add(1, "hour")
          .format("hh:mm A")
          .toLowerCase()
      );
      this.markFormGroupTouched(availability, current, currentIndex);
    }
  }

  setTypeAvailabilityForAllDay(availability: any, type: string, event: any) {
    if (event.target.checked) {
      _.map(availability.controls.availability_slots.controls, (item: any) => {
        item.controls.start_time.disable();
        item.controls.type.disable();
        item.controls.end_time.disable();
        item.controls.status.disable();
        if (!item.controls.id.value) item.controls.id.disable();
        return item;
      });

      if (type == "available") {
        this.availabilityTypeValue = true;
        availability.controls.mark_all_day.setValue(this.availabilityTypeValue);
        _.map(availability.controls.availability_slots.controls, function (
          item: any
        ) {
          item.controls.type.setValue(true);
          item.controls.status.setValue(true);
        });
        this.availabilityTypeValue = true;
      } else if (type == "unavailable") {
        this.availabilityTypeValue = false;
        availability.controls.mark_all_day.setValue(this.availabilityTypeValue);
        _.map(availability.controls.availability_slots.controls, function (
          item: any
        ) {
          item.controls.type.setValue(false);
          item.controls.status.setValue(false);
        });
        this.availabilityTypeValue = false;
      }
    } else {
      this.availabilityTypeValue = null;
      availability.controls.mark_all_day.setValue(this.availabilityTypeValue);
      _.map(availability.controls.availability_slots.controls, (item: any) => {
        item.controls.start_time.enable();
        item.controls.type.enable();
        item.controls.end_time.enable();
        item.controls.id.enable();
        item.controls.status.enable();
        return item;
      });

      setTimeout(async () => {
        let lastIndex =
          availability.controls.availability_slots.controls.length - 1;
        await this.markFormGroupTouched(
          availability,
          availability.controls.availability_slots.controls[lastIndex],
          lastIndex
        );
      });
      // we need to init  validation after enable disabled controls
    }
    return;
  }
  errorImage(event, url){
    event.target.src = url
  }
  terminateOffer() {
    // this.terminateOfferObj = obj;
    $('#eventDetails').modal('hide');
    $('#terminateOfferModal').modal('show');
  }
  closeTerminateModal() {
    this.terminateReason = '';
    this.terminateSubmitted = false;
    $('#terminateOfferModal').modal('hide');
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

    this.TutorService.changeOffer(body).subscribe((res: any) => {
        this.alertService.success(res.success_message);
        this.terminateOfferObj = {id: null, job_title:''};
        this.terminateReason = '';
        this.terminateSubmitted = false;
        this.fetchJobs();
        $('#terminateOfferModal').modal('hide');
    }, err => {
      this.alertService.error(err.error.error_message);
    })
  }
  downloadAttachment(job,type, fileName){
    let data = {
      type : type,
      mime_type : job.extendedProps.file_type,
      id: job.extendedProps.offer_id
    }
    const Url = `attachment/${data.type}/${data.id}`;
    this.attachmentService.downloadFile(Url, fileName);
  }
  test(){  }

  viewSessionDetail(id){
    $('#eventDetails').modal('hide');
    this.router.navigate([`/tutor/offerDetails/${id}`])
  }

   startSession(session){
     if(session && session.extendedProps){

     
    this.TutorService.startSession(session.extendedProps.session_id).subscribe((res: any) => {
      if(res.success){
        this.websocketService.emit(`start_session`, {
          full_name: this.userInfo.full_name,
          session_id: session.extendedProps.session_id,
          tutor_id: this.userId,
          job_id: session.extendedProps.job_id,
          job_title: session.header,
          student_id: session.extendedProps.student_id
        });
        this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: session.extendedProps.session_id});
        let newRelativeUrl = this.router.createUrlTree(['/video']);
        let baseUrl = window.location.href.replace(this.router.url, '');
        window.open(baseUrl + newRelativeUrl, '_blank');
        
        $('#eventDetails').modal('hide');
        // this.router.navigate(['/video'])
        
     
        
      } else {
        this.alertService.error(res.success_message || res.error_message)
      }
    }, err => {
      this.alertService.error(err.error.error_message || 'Unable to start session')
    })
  } else {
      this.alertService.error('Session cannot be start due to technical issue')  
  }
  }

   earlySessionModal(job){ 
    this.earlySessionObj = job;
    $('#eventDetails').modal('hide');
    $('#earlySession').modal('show');
  }

  earlyStartRequest(msg){
    // if(!msg || msg == ''){
    //   this.earlyReasonErr = true;
    //   return;
    // } else if (!this.earlySessionObj){
    //   return;
    // }
    this.earlyReasonErr = false;
      // debugger
    this.websocketService.emit('early_session_start_request', {
      job_id: this.earlySessionObj.extendedProps.job_id? this.earlySessionObj.extendedProps.job_id: null,
      receiver_id: this.earlySessionObj.extendedProps.student_id? this.earlySessionObj.extendedProps.student_id: null,
      reference_id : this.earlySessionObj.extendedProps.session_id? this.earlySessionObj.extendedProps.session_id: null,
      notification: 'Tutor wants to early start session '+this.earlySessionObj.extendedProps.header? this.earlySessionObj.extendedProps.header: this.earlySessionObj.header,
      notification_message: msg,
      type: 'session_early_start',
      tutor_id: this.userId,
      job_title: this.earlySessionObj.header? this.earlySessionObj.header: this.earlySessionObj.extendedProps.header,
      full_name: this.userInfo.full_name,
      schedule_date: this.earlySessionObj.schedule_date? moment(this.earlySessionObj.start).format('dddd DD-MM-YYYY hh:mm A'): null,
    });

    $('#earlySession').modal('hide');
    this.reason.nativeElement.value= '';
    this.alertService.success('Request sent to student successfully');
  }

  sendReason(event){
    if(event.target.value == ''){
      this.earlyReasonErr = true;
    } else {
      this.earlyReasonErr = false;
    }
  }


  

}
