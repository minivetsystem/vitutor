import { Component, OnInit, ViewChild } from '@angular/core';
import interactionPlugin from "@fullcalendar/interaction"; // for dateClick
import { FullCalendarComponent } from "@fullcalendar/angular";
import { OptionsInput, Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import momentPlugin from '@fullcalendar/moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone'

import { LocalStorageService, AlertService, AttachmentService } from '@app/shared/_services/index';
import { environment } from '../../../environments/environment.prod';
import { StudentService } from '../student.service';
import * as moment from 'moment-timezone';
import { CommonService } from '@app/common/services/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { constantVariables } from '@app/shared/_constants/constants';

declare const $: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  @ViewChild("calendar", { static: false })

  calendarComponent: FullCalendarComponent; // the #calendar in the template

  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin, momentPlugin];
  availability: any;
  private base_url = environment.baseUrl;
  availability_fetch_url: string = this.base_url + "/tutor/availability/fetch";
  token: string;
  oldDate: boolean = false;
  expired: boolean = false;
  currentDate: boolean = false;
  timeZone = "";
  eventView: any;
  jobDetails = null;
  cancelOfferObj = { id: null, job_title: '' };
  reason = '';
  timer: any;
  interval;
  menuToggle;
  eventDatesArray = [];
  calendarLoader = true;
  jobStarted;
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  constructor(
    private localStorageService: LocalStorageService,
    private StudentService: StudentService,
    private notifier: AlertService,
    private attachmentService: AttachmentService,
    private commonService: CommonService,
    private router: Router
  ) {
    if (this.localStorageService.getJwtToken()) {
      this.token = JSON.parse(this.localStorageService.getJwtToken().trim());
    }
    this.fetchJobs();
    this.timeZone = this.localStorageService.getTimeZone()


  }

  fetchJobs() {
    this.StudentService.getScheduledEvents().subscribe((res) => {
      this.availability = res;
      this.eventDatesArray = this.availability.map(ele => {
        return ele.id
      });

      for (let ele of this.availability) {
        ele.header = ele.title
        ele.title = ele.title + ' (' + moment(ele.start).format('hh:mm a') + ' to ' + moment(ele.end).format('hh:mm a') + ')';
      }
      this.calendarLoader = false;
    },
      (error) => {
        this.calendarLoader = false;
      })
  }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res: number) => {
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

    if (dayDate < currentDate) {
      // event.el.classList.add("fc-disabled-day");
      event.el.classList.add("expired");
    }
    // const projectableNodes = Array.from(event.el.childNodes);
    // var tooltip = new Tooltip(event.el, {
    //   title: event.event.extendedProps.description,
    //   placement: "left",
    //   trigger: "hover",
    //   delay: { show: 500, hide: 0 },
    //   container: "body",
    //   template:
    //     '<div class="tooltip calender_tooltip tool_' +
    //     event.event.extendedProps.type +
    //     ' " role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    // });
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
    // let params = {
    //   start_date: event.startStr,
    //   end_date: event.endStr,
    //   range: true,
    // };
    // this.availabilityTypeValue = null;

    // this.updateAvailabilityModalTitle = "Update";
    // if (!bypass) {
    //   let calendarApi = this.calendarComponent.getApi();
    //   let allEvents = calendarApi.getEvents();
    //   let _findExitsEventsByDate = _.findIndex(allEvents, [
    //     "id",
    //     event.startStr,
    //   ]);
    //   if (
    //     event.startStr < moment().format("YYYY-MM-DD") &&
    //     _findExitsEventsByDate == -1
    //   ) {
    //     calendarApi.unselect();
    //     return;
    //   }
    //   if (_findExitsEventsByDate == -1) {
    //     calendarApi.unselect();
    //     this.updateAvailabilityModalTitle = "Add";
    //     Swal.fire({
    //       title: "Set Availability",
    //       text:
    //         "Selected date has no availability or unavailability do you want to add?",
    //       type: "info",
    //       customClass: this.swalInfoOption,
    //       showCancelButton: true,
    //       confirmButtonColor: "#3085d6",
    //       cancelButtonColor: "#d33",
    //       confirmButtonText: "Yes",
    //       cancelButtonText: "Cancel",
    //     }).then(async (result) => {
    //       if (result.value) {
    //         // here we need to give option to user to add availability for day
    //         await (<any>(
    //           this.createAvailabilityForCalenderDay(
    //             params,
    //             event.startStr,
    //             template
    //           )
    //         ));
    //       }
    //     });
    //     return false;
    //   }
    // }

    // let getAvailabilitySlots = "tutor/availability/get-availability-slots";
    // // compare dates
    // var nowDate = moment().format("YYYY-MM-DD");
    // var selectedDate = moment(event.startStr).format("YYYY-MM-DD");
    // // and i checked with if statement
    // this.availabilityUpdateForm.controls.availability["controls"].length = [];
    // this.asyncRequestService.getRequest(getAvailabilitySlots, params).subscribe(
    //   (response: any) => {
    //     this.updateAvailabilitySlotsArray = response.data;
    //     this.rangeDates = response.dates;
    //     if (this.updateAvailabilitySlotsArray.length == 0) {
    //       return;
    //     }
    //     for (let index = 0; index < response.dates.length; index++) {
    //       const element = response.dates[index];

    //       (this.availabilityUpdateForm.get("availability") as FormArray).push(
    //         this.update_availability_date(element)
    //       );

    //       let slots = response.data[response.dates[index].date];
    //       for (let slot = 0; slot < slots.length; slot++) {
    //         const currentSlot = slots[slot];
    //         currentSlot["start_time"] = moment(
    //           `${currentSlot.date} ${currentSlot.start_time}`,
    //           "YYYY-MM-DD hh:mm A"
    //         ).format("hh:mm A");
    //         currentSlot["end_time"] = moment(
    //           `${currentSlot.date} ${currentSlot.end_time}`,
    //           "YYYY-MM-DD hh:mm A"
    //         ).format("hh:mm A");

    //         (this.availabilityUpdateForm.controls.availability["controls"][
    //           index
    //         ].controls.availability_slots as FormArray).push(
    //           this.create_availability_slots
    //         );

    //         if (
    //           _.findIndex(slots, function (o) {
    //             return o.mark_all_day == 1 && o.status == 1;
    //           }) == 0
    //         ) {
    //           this.availabilityTypeValue = true;
    //         } else if (
    //           _.findIndex(slots, function (o) {
    //             return o.mark_all_day == 1 && o.status == 0;
    //           }) == 0
    //         ) {
    //           this.availabilityTypeValue = false;
    //         } else if (
    //           _.findIndex(slots, function (o) {
    //             return o.mark_all_day == 3 && o.status == 1;
    //           }) == 0
    //         ) {
    //           this.availabilityTypeValue = null;
    //         } else {
    //           this.availabilityTypeValue = null;
    //         }
    //       }
    //     }

    //     this.setUpdateSubmitFlag = true;
    //     if (nowDate > selectedDate) {
    //       // if selectedDate is less than today
    //       this.setUpdateSubmitFlag = false;
    //     }
    //     this.modalRef = this.modalService.show(template, {
    //       class: "modal-lg availabilityModal",
    //       backdrop: "static",
    //     });
    //   },
    //   (error: any) => {}
    // );
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
      event.el.classList.add("expired");
    }

    if (!this.eventDatesArray.includes(dayDate) && dayDate > currentDate) {
      event.el.classList.add("grey-background");
    }
  }

  /**
 * @purpose handle calender click event
 * @method handleDateClick
 * @param arg
 */
  handleDateClick(arg, template) {
    $('#dayDetails').modal('show');
    // // if(this.eventView == 'timeGridWeek' || this.eventView == 'timeGridDay'){
    // //   return;
    // // }
    // let params = {
    //   startStr: moment(arg.dateStr, "YYYY-MM-DD").format("YYYY-MM-DD"),
    //   endStr: moment(arg.dateStr, "YYYY-MM-DD")
    //     .add(1, "d")
    //     .format("YYYY-MM-DD"),
    // };

    // this.selectDateRange(params, template);
    // return;
  }

  /**
 * @purpose to trigger click event for event and display data for event
 * @method getEventsDetails
 * @param {*} event
 * @param {*} template
 * @memberof AvailabilityComponent
 */
  getEventsDetails(event: any, template: any) {
    let timeZone = this.localStorageService.getTimeZone()


    moment.tz.setDefault(timeZone);
    let momentNow = moment().tz(timeZone);
    // debugger
    this.jobDetails = this.availability.find((ev) => {
      return ev.slot_id + '-' + ev.id == event.event.extendedProps.job_id + '-' + event.event.id
    })
    let countDownDate = moment(this.jobDetails.start, 'DD-MM-YYYY hh:mm a').valueOf();
    let now = moment().tz(timeZone).valueOf();
    let distance = countDownDate - now;
    this.timer = '';

    this.jobDetails.schedule_date = moment(this.jobDetails.start).format('YYYY-MM-DD');

    if (moment(this.jobDetails.start).format('DD/MM/YYYY') == momentNow.format('DD/MM/YYYY')) {
        this.currentDate = true;
        this.interval = setInterval(() => {
          this.timer = this.commonService.timerStart(this.jobDetails.start);
        }, 1000);
        if(moment().isBetween(moment(this.jobDetails.start),moment(this.jobDetails.end) )){
          this.jobStarted = true;
          $('#eventDetails').modal('show');
          return;
        } else {
          this.jobStarted = false;
        }
      
      // }
    } else {
      this.currentDate = false;
    }
    this.oldDate = moment(this.jobDetails.start).isBefore(moment()) ? true : false;
    this.expired = (moment(this.jobDetails.end).isBefore(moment()) && this.jobDetails.extendedProps.job_status == 'Upcoming') ? true : false;
    this.jobDetails.startTime = moment(this.jobDetails.start).format('hh:mm A');
    this.jobDetails.endTime = moment(this.jobDetails.end).format('hh:mm A');

    this.cancelOfferObj = { id: this.jobDetails.extendedProps.offer_id, job_title: this.jobDetails.title }
    $('#eventDetails').modal('show');
    // if (this.eventView == "timeGridWeek" || this.eventView == "timeGridDay") {
    //   return;
    // }

    // let params = {
    //   dateStr: moment(event.event.start).format("YYYY-MM-DD"),
    // };
    // this.handleDateClick(params, template);
  }

  closeEventModel(name) {
    clearInterval(this.interval);
    this.timer = '';
    $(`#eventDetails`).modal('hide');
  }
  errorImage(event, url) {
    event.target.src = url
  }

  cancelOffer() {
    // this.cancelOfferObj = obj;
    $('#eventDetails').modal('hide');
    $('#cancelOfferModal').modal('show');
  }
  cancelOfferSubmit() {

    const body = {
      offer_id: this.cancelOfferObj.id,
      status: 4,
      comment: this.reason
    }

    this.StudentService.changeOffer(body).subscribe((res: any) => {
      if (!res.success) {
        this.notifier.error(res.error_message);
      } else {


        this.notifier.success(res.success_message);
        this.cancelOfferObj = { id: null, job_title: '' };
        this.reason = '';

        $('#cancelOfferModal').modal('hide');
        this.fetchJobs();
      }

    }, err => {
      this.notifier.error(err.error.error_message);
    })

  }

  closeCancelModal() {
    this.reason = '';
    $('#cancelOfferModal').modal('hide');
  }
  downloadAttachment(job, type, filename) {
    let data = {
      type: type,
      mime_type: job.extendedProps.file_type,
      id: job.extendedProps.offer_id
    }
    const Url = `attachment/${data.type}/${data.id}`;
    this.attachmentService.downloadFile(Url, filename);
  }

  getOfferId(id) {
    $('#eventDetails').modal('hide');
    this.router.navigate([`/viewOffer/view/${id}`])
  }

  joinSession(sessionId) {
    this.StudentService.joinSession(sessionId).subscribe((res: any) => {
      if (res.success == true && res.data != 0) {
        this.commonService.setSessionToken({ videoUrl: res.data.videourl, session_id: sessionId });
        $('#eventDetails').modal('hide');
        let newRelativeUrl = this.router.createUrlTree(['/video']);
        let baseUrl = window.location.href.replace(this.router.url, '');

        window.open(baseUrl + newRelativeUrl, '_blank');
      } else if (res.success == false && res.data != 0) {
        this.notifier.error(res.success_message || res.error_message)
      } else if (res.data == 0 || !res.data.videourl) {
        this.notifier.error("Tutor hasn't started session yet");
      }
    }, (err: any) => {
      this.notifier.error(err.error.error_message || 'Unable to Join session');
    })

  }

  makePayment(job) {
    $('#eventDetails').modal('hide');
    let sessionId = job.session_id
    let amount = 0
    if (job.price_type == 'Hourly') {
      amount = (+(job.accepted_price.replace('$', ''))) * (job.duration)
    } else {
      amount = +(job.accepted_price.replace('$', ''))
    }
    Swal.fire({
      title: 'Make Payment?',
      text: `You sure, you want make Transaction of $${amount}?`,
      showCancelButton: true,
      confirmButtonText: 'Pay',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.StudentService.checkoutPayment(sessionId).subscribe((res: any) => {
          if (res.success) {
            // job['transaction_id'] = 12;
            this.fetchJobs();
            Swal.fire(
              'Make payment!',
              res.success_message,
              'success'
            );
          }
        }, err => {
          Swal.fire(
            'Error',
            err.error.error_message,
            'error'
          );
        });
      }
    })
  }


}
