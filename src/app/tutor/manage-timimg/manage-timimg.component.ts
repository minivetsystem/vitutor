import {
  Component,
  OnInit
} from '@angular/core';
import {
  TutorService
} from '../tutor.service';
import {
  FormGroup,
  FormArray,
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  AlertService,
  LocalStorageService
} from '@app/shared/_services';
import {
  environment
} from 'src/environments/environment';
// import * as moment from 'moment';
import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';
import {
  constantVariables
} from '@app/shared/_constants/constants';
import {
  checkTime
} from '@app/shared/_helpers';
import _ from 'lodash';
import { formatDate, BsModalService, BsModalRef } from 'ngx-bootstrap';
import { HostListener } from "@angular/core";
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { ThrowStmt } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-manage-timimg',
  templateUrl: './manage-timimg.component.html',
  styleUrls: ['./manage-timimg.component.scss']
})
export class ManageTimimgComponent implements OnInit {
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  availabilityForm: FormGroup;
  availabilityUpdateForm: FormGroup;
  private base_url = environment.baseUrl;
  availability_fetch_url: string = this.base_url + '/tutor/availability/fetch';
  hasFormSubmitted = false;
  // availability: any;
  token: string;
  availabilityType: number;
  availabilityOptionType: number = 0;
  startMinDate: Date;
  startMaxDate: Date;
  endMinDate: Date;
  endMaxDate: Date;
  startDate: Date;
  endDate: Date;
  startDateInput: Date[];
  endDateInput: Date[];
  weekDays = [];
  calenderDefaultSettingsArray = [];
  formErrorsIndex = [];
  modalRef: BsModalRef | null;
  updateAvailabilitySlotsArray = [];
  calenderDefaultSettingsArrayKeysArray = [];
  days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  daysArr = [
    { name: "Sunday", selected: false },
    { name: "Monday", selected: false },
    { name: "Tuesday", selected: false },
    { name: "Wednesday", selected: false },
    { name: "Thursday", selected: false },
    { name: "Friday", selected: false },
    { name: "Saturday", selected: false },
  ];
  weekList = [];
  availabilityTypeText: string;

  timeZoneListArray = [];
  selectedTimeZone: string;
  instantTutoring = null;
  menuToggle;
  result:any ={result : {profile_completed: true}}
  timezone;
  
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode != 13) {
      event.returnValue = false;
      event.preventDefault();
    }
  }
  constructor(
    private tutorService: TutorService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private notifier: AlertService,
    private commonService: CommonService,
    private async: AsyncRequestService
  ) {
    this.profileComplete();
     let timeZones = moment.tz.names();
    let offsetTmz=[];
    for(const i in timeZones)
    {
      offsetTmz.push({"name":"(GMT"+moment.tz(timeZones[i]).format('Z')+")" + timeZones[i] , "value" : timeZones[i]});
    }
    this.timeZoneListArray = offsetTmz;
    this.selectedTimeZone =  this.localStorageService.getTimeZone()    // localStorage.setItem("token","eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC8xMjcuMC4wLjE6ODAwMFwvYXBpXC92MVwvbG9naW4iLCJpYXQiOjE2MDM2ODc5MjksImV4cCI6MTYwMzc3NDMyOSwibmJmIjoxNjAzNjg3OTI5LCJqdGkiOiJzVGNnYUdyUE1RcGpXbklaIiwic3ViIjo2LCJwcnYiOiI4N2UwYWYxZWY5ZmQxNTgxMmZkZWM5NzE1M2ExNGUwYjA0NzU0NmFhIn0.kO_qzG64vhULKUmSPkr-PboYLRSw5aEbd8Ol4EXo2nQ")
  }

  profileComplete(){
    this.async.getRequest(`profile/check-profile-status`).subscribe(res => {
      this.result = res;
     }, err => {
       // this.router.navigate(['/']);
       // return false;
     });
  }
  trackByIdentity = (index: number, item: any) => item;

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.tutorService.getInstantTutoringType().subscribe((res: any) => {
      this.instantTutoring = res.instant_tutoring;
    })
    this.localStorageService.timeZone.subscribe((res:any) => {
      if(res){
        this.timezone = res
      }else {
        this.timezone = this.localStorageService.getTimeZone();
      }
    })
    
    this.availabilityForm = this.formBuilder.group({
      start_date: [null, [Validators.required]],
      end_date: [null, Validators.required],
      status: [null],
      availability: this.formBuilder.array([]),
    });

    this.availabilityUpdateForm = this.formBuilder.group({
      availability: this.formBuilder.array([]),
    });
    this.defaultDates();
    // this.getAvailability();

    // uncomment
    if (this.localStorageService.getJwtToken()) {
      this.token = JSON.parse(this.localStorageService.getJwtToken().trim());
    }


    // let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this.availability =
    //   `${this.availability_fetch_url}?token=` +
    //   this.token +
    //   `&timeZone=${timezone}`; //default setting for tutor availbility which indicates that user wants to skip those dates
    this.availabilityType = 1;
    // this.onClickSetAvailabilityType(0);
    this.setTypeAvailability(1);
  }

  setTypeAvailability(type: number) {
    // this.isCollapsed = false;
    this.calenderDefaultSettingsArrayKeysArray = [];

    this.availabilityTypeText = this.availabilityType
      ? "Availability"
      : "Unavailability";

    this.tutorService
      .checkDefaultCalender()
      .subscribe(
        async (response: any) => {
          if(this.localStorageService.getTimeZone()){
            this.selectedTimeZone = this.localStorageService.getTimeZone()
          } else {
            // this.selectedTimeZone = response && response.timezone ? response.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
          }
          
          if (response.statusCode) {
            this.calenderDefaultSettingsArray = [];
            await (<any>this.onClickSetAvailabilityType(0));
          } else {
            for (let i = 0; i < this.days.length; i++) {
              for (let j = 0; j < Object.keys(response).length; j++) {
                let data = response[Object.keys(response)[j]];
                if (this.days[i] == data[0].day) {
                  this.calenderDefaultSettingsArrayKeysArray.push(
                    Object.keys(response)[j]
                  );
                  break;
                }
              }
            }
            this.calenderDefaultSettingsArray = response;
            await (<any>this.onClickSetAvailabilityType(0));
          }
        },
        (error) => {
        }
      );
  }



  get availabilityList(): FormArray {
    return this.availabilityForm.get('availability') as FormArray;
  }

  addTimeSlot(availability: any) {
    let lastIndex =
      availability.controls.availability_slots.controls.length - 1;
    let children = availability.controls.availability_slots.controls[lastIndex];

    availability.get('availability_slots').push(this.availability_slots);

    if (children) {
      let currentIndex = lastIndex + 1;
      let current =
        availability.controls.availability_slots.controls[currentIndex];

      current.controls['start_time'].setValue(
        moment(children.value.end_time, 'hh:mm A')
        .format('hh:mm A')
        .toLowerCase()
      );
      current.controls['end_time'].setValue(
        moment(current.value.start_time, 'hh:mm A')
        .add(1, 'hour')
        .format('hh:mm A')
        .toLowerCase()
      );

      this.markFormGroupTouched(availability, current, currentIndex);
    }
  }
  private markFormGroupTouched(
    availability: any,
    current: any,
    currentIndex: number
  ) {
    setTimeout(() => {
      this.getCurrentTimeSlot(availability, current, currentIndex);
    }, 500);
  }

  defaultDates() {
    // setting for dates
    this.startMinDate = new Date();
    this.startMaxDate = new Date();
    this.startMinDate.setDate(this.startMinDate.getDate());
    this.startMaxDate.setDate(this.startMaxDate.getDate() + 30);
    this.endMinDate = new Date();
    this.endMaxDate = new Date();
    this.endMinDate.setDate(this.endMinDate.getDate());
    this.endMaxDate.setDate(this.endMaxDate.getDate() + 30);
  }

  async getCurrentTimeSlot(
    availability: any,
    children: any,
    currentIndex: number
  ) {
    if (children) {
      let checkError = false;

      for (
        let index = 0; index < availability.controls.availability_slots.controls.length; index++
      ) {
        var element =
          availability.controls.availability_slots.controls[index].value;


        if (currentIndex != index) {
          if (element.start_time && element.end_time) {
            let exitsStartTime = moment(element.start_time, 'hh:mm A');
            let exitsEndTime = moment(element.end_time, 'hh:mm A');
            let currentStartTime = moment(children.value.start_time, 'hh:mm A');
            let currentEndTime = moment(children.value.end_time, 'h:mm A');
           

            let equalStartTime = currentStartTime.isSame(exitsStartTime);
            let equalEndTime = currentEndTime.isSame(exitsEndTime);

            //first check time cannot be equal
            if (equalStartTime && equalEndTime) {
              children.controls["start_time"].setErrors({
                incorrect: true
              });
              checkError = true;
              // this.setAllDayValue(children,availability);
            }
           
            //check if current selected time in exits start and end time
            if (currentStartTime.isBetween(exitsStartTime, exitsEndTime)) {
              children.controls["start_time"].setErrors({
                incorrect: true
              });
              checkError = true;
            
              // this.setAllDayValue(children,availability);
            }
            //check if current selected time in exits start and end time
            if (currentEndTime.isBetween(exitsStartTime, exitsEndTime)) {
              children.controls["start_time"].setErrors({
                incorrect: true
              });
              checkError = true;
             
              // this.setAllDayValue(children,availability);
            }

            // check if exits time in current start and end time
            if (exitsStartTime.isBetween(currentStartTime, currentEndTime)) {
              children.controls["start_time"].setErrors({
                incorrect: true
              });
              checkError = true;
             
              // this.setAllDayValue(children,availability);
            }

            // check if exits exitsEndTime in current start and end time
            if (exitsEndTime.isBetween(currentStartTime, currentEndTime)) {
              children.controls['start_time'].setErrors({
                incorrect: true
              });
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
  removeTimeSlot(availability: any, child: number, flag = 0) {
   

    if (!flag) {
      availability.controls.availability_slots.removeAt(child);
      this.markFormGroupTouched(
        availability,
        availability.controls.availability_slots.controls[child],
        child
      );
      if (availability.controls.availability_slots.length == 0) {
        this.modalRef.hide();
      }
      return;
    }

    let id = flag;

    availability.controls.availability_slots.removeAt(child);
   
    this.updateAvailabilitySlotsArray[
      moment(availability.value.date, "MM/DD/YYYY").format("YYYY-MM-DD")
    ].splice(child, 1);
    
    // return;
    // this.notifier.success(response.success_message);
    // this.refreshEvents();
    let newSlot = this.updateAvailabilitySlotsArray[
      moment(availability.value.date, "MM/DD/YYYY").format("YYYY-MM-DD")
    ];
    if (availability.controls.availability_slots.value.length == 0) {
      this.modalRef.hide();
    } else {
      if (newSlot.length) {
        for (var i = 0; i < newSlot.length; i++) {
          if (newSlot[i].booked_status != 4 && newSlot[i].status != 3) {
            return;
          }
        }
        this.modalRef.hide();
      } else {
        this.modalRef.hide();
      }
    }
    this.markFormGroupTouched(
      availability,
      availability.controls.availability_slots.controls[child],
      child
    );
  
}
addItem(array) {
  array.push({
    startHour: '00',
    startMinutes: '00',
    startMeridiem: 'AM',
    endHour: '00',
    endMinutes: '00',
    endMeridiem: 'AM'
  });
}
removeItem(index, array) {
  array = array.splice(index, 1);
}
pad2(event, value) {
  const numb = parseInt(event.target.value, 10);
  value = (numb < 10 ? '0' : '') + numb;
}

saveTiming() {
  this.tutorService.sendTiming(this.weekList).subscribe(res => {
  });
}

onSubmit() {
  this.hasFormSubmitted = true;
  if (!this.availabilityForm.valid) {
    return;
  }
 
  let dateRange = {
    startDate: moment(this.availabilityForm.value.start_date).format(
      'YYYY-MM-DD'
    ),
    endDate: moment(this.availabilityForm.value.end_date).format(
      'YYYY-MM-DD'
    ),
  };
  this.tutorService.checkAvailability(dateRange).subscribe(async (res: any) => {
    if (res.success) {
      this.availabilityType = 1;
      // if date has no availability than submit form
      await (this.submitForm());
      
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: res.error_message,
        type: 'info',
        customClass: this.swalInfoOption,
        showCancelButton: true,
        // allowOutsideClick : true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        backdrop: false,

        confirmButtonText: 'Yes!, override',
        cancelButtonText: 'Skip existing & continue',
      }).then(async (result) => {
        if (result.value) {
          this.availabilityType = 1;
          setTimeout(async () => {
            await (this.submitForm());
          }, 100);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          this.availabilityType = 0;
          setTimeout(async () => {
            await (this.submitForm());
          }, 100);
        } else {
        }
      });
    }
  });
  return;
}

// checkAvailability(dateRange = {}) {
//   let url = "tutor/availability/check-availability";
//   return this.asyncRequestService.postRequest(url, dateRange);
// }

submitForm() {
  this.hasFormSubmitted = true;
  if (!this.availabilityForm.valid) {
    return;
  }
  // return;
  this.availabilityForm.value.start_date = moment(
    this.availabilityForm.value.start_date
  ).format('MM/DD/YYYY');
  this.availabilityForm.value.end_date = moment(
    this.availabilityForm.value.end_date
  ).format('MM/DD/YYYY');
  // calling the server api to save availability
  
 
  
  // this.availabilityForm.get('selectedTimezone').setValue(this.selectedTimeZone)
  // this.availabilityForm.get('selectedTimezone').updateValueAndValidity();
 let value = this.availabilityForm.value
 value['selectedTimezone'] = this.selectedTimeZone
  this.tutorService.saveAvailability(value)
    .subscribe(
      (response: any) => {
        if(response.selectedtimezone){
          this.localStorageService.setTimeZone(response.selectedtimezone)
        }
        if (response.datesHasBookings > 0) {
         
          this.notifier.success(response.success_message);
        } else {
          this.notifier.success(response.success_message);
        }
        this.hasFormSubmitted = false;
        this.setTypeAvailability(1);
        this.profileComplete();
        // this.availabilityForm.controls.start_date.setValue(null);
        // this.availabilityForm.controls.end_date.setValue(null);
        // this.defaultDates();
        // this.getAvailability();
      },
      (errorResponse) => {
        this.notifier.error(errorResponse.error.success_message);
      }
    );
}

onClickSetAvailabilityType(type: number) {
  let current = moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A');
  this.availabilityOptionType = type;

  if (this.availabilityOptionType == 0) {
    this.availabilityForm.controls.start_date.setValue(current.toDate());
    this.availabilityForm.controls.end_date.setValue(
      current.add( 1, 'week').toDate()
    );
    // call function to render form controls
    this.createAvailabilitySlots(current.add( 1,'week').toDate());
  } else {
    this.resetTimeSlots();
  }
}

resetTimeSlots(): void {
  this.availabilityForm.controls.availability["controls"].length = [];
}
createAvailabilitySlots(endDate: any) {
  let current = moment(moment().tz(this.timezone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A');
  this.resetTimeSlots();
  if (Object.keys(this.calenderDefaultSettingsArray).length) {
    let calenderDefaultSettingsArrayKeys = this.calenderDefaultSettingsArrayKeysArray;
    for (
      let index = 0; index < calenderDefaultSettingsArrayKeys.length; index++
    ) {
      const key = calenderDefaultSettingsArrayKeys[index];
      let startWeek = current.day('sunday').add(index, 'd');
      this.weekDays.push(this.days[startWeek.day()]);
      (this.availabilityForm.get('availability') as FormArray).push(
        this.week_availability_date(startWeek)
      );

      for (
        let j = 0; j < this.calenderDefaultSettingsArray[key].length; j++
      ) {
        const currentArray = this.calenderDefaultSettingsArray[key][j];
        (this.availabilityForm.controls.availability["controls"][index]
          .controls.availability_slots as FormArray).push(
          this.week_availability_slots(currentArray)
        );
        this.setMarkAllDay(
          this.calenderDefaultSettingsArray[key],
          this.availabilityForm.controls.availability["controls"][index]
        );
      }
    }
  } else {
    if (endDate) {
      const timeDiff =
        endDate.getTime() - this.availabilityForm.value.start_date.getTime();
      const DaysDiff = timeDiff / (1000 * 3600 * 24);
      for (let index = 0; index <= DaysDiff; index++) {
        if (index < 7) {
          const startDate = current.day('sunday').add(index, 'd');

          (this.availabilityForm.get('availability') as FormArray).push(
            this.availability_date(startDate)
          );
          this.availabilityForm.controls.availability['controls'][
            index
          ].controls.availability_slots.controls[0].controls.start_time.setValue(
            '09:00 am'
          );
          this.availabilityForm.controls.availability["controls"][
            index
          ].controls.availability_slots.controls[0].controls.end_time.setValue(
            '10:00 am'
          );

          this.weekDays.push(this.days[startDate.day()]);
        } else {
          return false;
        }
      }
    }
  }
  return;
}
week_availability_date(date: any): FormGroup {
  return this.formBuilder.group({
    day: [date.format('dddd')],
    date: [date.format('MM/DD/YYYY')],
    mark_all_day: [null],
    availability_slots: this.formBuilder.array([]),
  });
}
availability_date(date: any): FormGroup {
  return this.formBuilder.group({
    date: [date.format('MM/DD/YYYY')],
    day: [date.format('dddd')],
    mark_all_day: [null],
    availability_slots: this.formBuilder.array([this.availability_slots]),
  });
}

get availability_slots(): FormGroup {
  return this.formBuilder.group({
    start_time: [null, [Validators.required]],
    end_time: [null, [Validators.required]],
    status: [false],
    // mark_all_day: [null],
  }, {
    validator: checkTime('start_time', 'end_time'),
  });
}
week_availability_slots(data: any): FormGroup {
  return this.formBuilder.group({
    start_time: [data && data.mark_all_day ? data.start_time : moment(data.start_time,"h:mm A").format("h:mm A") , [Validators.required]],
    end_time: [data && data.mark_all_day ? data.end_time : moment(data.end_time,"h:mm A").format("h:mm A"), [Validators.required]],
    status: [data.status],
  }, {
    validator: checkTime('start_time', 'end_time'),
  });
}
setMarkAllDay(calender, availability: any) {
  if (calender[0].mark_all_day == 1) {
    _.map(availability.controls.availability_slots.controls, (item, idx) => {
      if (item.controls.start_time.enabled) {
        item.controls.start_time.disable();
      } else {
        item.controls.start_time.enable();
      }

      if (item.controls.end_time.enabled) {
        item.controls.end_time.disable();
      } else {
        item.controls.end_time.enable();
      }

      return true;
    });
    availability.controls.mark_all_day.setValue(true);
  } else {
    return false;
  }
}
setEndDate(event: any) {
  this.endMinDate = new Date(event);
  this.endMaxDate = new Date(event);
  this.endMinDate.setDate(this.endMinDate.getDate());
  this.endMaxDate.setDate(this.endMaxDate.getDate() + 30);
  this.availabilityForm.controls.availability["controls"].length = [];
}

onChangeRenderForm(event: any, template: any) {
  this.weekDays = [];
  this.hasFormSubmitted = false;

  let checkAvailabilityFlag = false;
  // this.createAvailabilitySlots(event);
}
markAllDay(formArray: any) {
  return _.map(
    formArray.controls.availability_slots.controls,
    (item, idx) => {
      if (item.controls.start_time.enabled) {
        item.controls.start_time.disable();
      } else { item.controls.start_time.enable(); }
      if (item.controls.end_time.enabled) { item.controls.end_time.disable();
      } else { item.controls.end_time.enable(); }
      return true;
    }
  );
}

update_availability_date(data: any): FormGroup {

  return this.formBuilder.group({
    date: [moment(data.date).format("MM/DD/YYYY")] || [
      formatDate(new Date(data.date), "MM/DD/YYYY"),
    ],
    mark_all_day: [null],
    id: [data.tutor_availability_id],
    availability_slots: this.formBuilder.array([]),
  });
}
get create_availability_slots(): FormGroup {
  return this.formBuilder.group(
    {
      id: [null],
      start_time: [null, [Validators.required]],
      end_time: [null, [Validators.required]],
      type: [null],
    },
    {
      validator: checkTime("start_time", "end_time"),
    }
  );
}

getTimezoneName() {
  const today = new Date();
  const short = today.toLocaleDateString(undefined);
  const full = today.toLocaleDateString(undefined, { timeZoneName: 'long' });
  // Trying to remove date from the string in a locale-agnostic way
  const shortIndex = full.indexOf(short);
  if (shortIndex >= 0) {
    const trimmed = full.substring(0, shortIndex) + full.substring(shortIndex + short.length);
    
    // by this time `trimmed` should be the timezone's name with some punctuation -
    // trim it from both sides
    return trimmed.replace(/^[\s,.\-:;]+|[\s,.\-:;]+$/g, '');

  } else {
    // in some magic case when short representation of date is not present in the long one, just return the long one as a fallback, since it should contain the timezone's name
    return full;
  }
}

 handleChange(evt) {
  this.tutorService.setInstantType({"instant_tutoring" : this.instantTutoring}).subscribe((res:any) => {
    this.notifier.success(res.success_message);
  }, err => {
    this.notifier.error(err.error.error_message);
  })
 }


}
