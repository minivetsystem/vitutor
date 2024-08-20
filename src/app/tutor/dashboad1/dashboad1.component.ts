import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { TutorService } from '../tutor.service';
import * as moment from 'moment-timezone';
import {AlertService, LocalStorageService, WebsocketService} from '../../shared/_services/index';
import { Location } from '@angular/common';

declare var Chart: any;
declare var Circles: any;
declare const $:any

@Component({
  selector: 'app-dashboad1',
  templateUrl: './dashboad1.component.html',
  styleUrls: ['./dashboad1.component.scss']
})
export class Dashboad1Component implements OnInit {
  result:any ={result : {profile_completed: true}}
  menuToggle;
  dasBoardData = {next_class_detail: { cancel_reason: '',date: "",disburse_date: null,disburse_status: 0,
  end_time: "",first_name: "",id: null,job_id: null,job_title: "",
  last_name: "",mark_completed: false,offer_id: null,payment_claim: 0,
  payment_status: null,photo: "",recurring_id: null,start_time: "",start_at:"",end_at:"",
  status: "",total_amount: "",transaction_id: null,tutor_id: null,student_id: null,session_date:null,
  updated_at: "", showBtn: false, session_status: false },
  today_sessions: [],
  total_accepted_job: 0,
  total_bid: 0,
  total_earning: "",
  total_session_count: 0,
  upcoming:false
    }
  interval;
  timer:any;
  totalIncomeChartData;
  dataset
  years = [2021,2020,2019,2018];
  year = 2021
  data;
  options
  @ViewChild('totalIncomeChart', {static : true}) totalIncomeChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('reason', {static: false}) reason: ElementRef;
  earlySessionObj;
  userId;
  earlyReasonErr;
  userInfo;
  earlySessionBtn = false;
  timezone
  constructor(private async: AsyncRequestService, private router: Router, private commonService: CommonService, private tutorService: TutorService, private notifier: AlertService,    private location: Location,private websocketService: WebsocketService, private localStorageService: LocalStorageService
    ) {
    
   }

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
  //  this.tutorGraph(null)
    this.fetchDashboardData();
    this.fetchTutorChart(this.year);
  }

  yearChangeValue(event){
    this.totalIncomeChartData.destroy();
    this.year = event.target.value;
    this.fetchTutorChart(this.year);
  }

  circlesCreate(){
    Circles.create({
      id: 'circles-1',
      radius: 45,
      value: this.dasBoardData.total_session_count || 0,
      maxValue: 100 || this.dasBoardData.total_session_count || 1,
      width: 7,
      text: this.dasBoardData.total_session_count || '0',
      colors: ['#DCE0E3', '#1C7EE1'],
      duration: 400,
      wrpClass: 'circles-wrp',
      textClass: 'circles-text',
      styleWrapper: true,
      styleText: true
})



}

fetchDashboardData(){
  this.tutorService.tutorDashboard().subscribe((res:any)=> {
    res.upcoming = true
    if(res.next_class_detail && Object.keys(res.next_class_detail).length > 0){
     res.next_class_detail.start_time = moment(res.next_class_detail.start_time, 'HH:mm:ss').format('hh:mm A');
    res.next_class_detail.end_time = moment(res.next_class_detail.end_time, 'HH:mm:ss').format('hh:mm A');
    res.next_class_detail.session_date = moment(res.next_class_detail.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY')
    this.timerFunction(res.next_class_detail) ;
    } else {
      res.upcoming = false;
    }
    this.jobSessionStart( res.today_sessions)
    
    this.dasBoardData = Object.assign(this.dasBoardData,res);
    

    this.circlesCreate();
    // this.tutorGraph(null)
  })
}


timerFunction(job){
  let timeZone = this.localStorageService.getTimeZone();
  let schedule_date = job.date + ' ' + job.start_time;
  let schedule_end = job.date + ' ' + job.end_time;
  job['session_status'] = 'pending';
  let countDownDate = moment(schedule_date, 'YYYY-MM-DD hh:mm A').valueOf();
  let endTime = moment(schedule_end, 'YYYY-MM-DD hh:mm A').valueOf();
  let momentNow = moment(moment().tz(timeZone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A')
  let now = moment().valueOf();
  
  let distance = countDownDate - now;
  let endDistance = endTime - now;
  this.timer = false;
   let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let endHours = Math.floor((endDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let endMinutes = Math.floor((endDistance % (1000 * 60 * 60 )) / (1000 * 60));
    
  if(moment(schedule_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') == momentNow.format('DD/MM/YYYY') ){
  // Update the count down every 1 second
  // if(hours <= 0 && minutes <= 15 && minutes > 0){
    job['showBtn'] = true;
    this.earlySessionBtn = false;
    job['session_status'] = 'upcoming';
    // Get today's date and time
    job['showBtn'] = true
    if(moment(job.start_at).diff(moment()) <= 0 && moment(job.end_at).diff(moment())>=0){
      this.earlySessionBtn = false;
      job['session_status'] = 'started';
      job['showBtn'] = true
    }else {
	  this.interval = setInterval(() => {
        this.timer = this.commonService.timerStart(job.start_at);
        if(this.timer == false){
          this.earlySessionBtn = false;
          job['session_status'] = 'upcoming';
        }else {
          this.earlySessionBtn = true;
          job['session_status'] = 'early';
        }
        if(moment(job.start_at).diff(moment()) <= 0 && moment(job.end_at).diff(moment())>=0){
          this.earlySessionBtn = false;
          job['session_status'] = 'started';
          job['showBtn'] = true
        }
		}, 1000);
  }
    
} else if(moment(schedule_date, 'YYYY-MM-DD hh:mm A').isAfter(momentNow)) {
	job['showBtn'] = false;
	job['session_status'] = 'upcoming';
  this.earlySessionBtn = false;
  }else {
  job['showBtn'] = false;
  job['session_status'] = 'expired';
  this.earlySessionBtn = false;
}

}


tutorGraph(dataset){
//   let bar_ctx = this.totalIncomeChart.nativeElement.getContext('2d');

// let blue_gradiant = bar_ctx.createLinearGradient(0, 0, 0, 600);
// blue_gradiant.addColorStop(0, '#40DBF3');

// blue_gradiant.addColorStop(1, '#1C7EE1');
this.data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Aug", "Sep", "Oct", "Nov" , "Dec"],
  datasets: [{
    label: 'Job Accepted',
    data: dataset || [18, 22, 24, 14, 16, 18, 9, 15, 11, 7, 16, 13],
          backgroundColor: '#40DBF3',
          hoverBackgroundColor: '#1C7EE1',
          hoverBorderWidth: 0,
          hoverBorderColor: ''
  }]
};

this.options = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    yAxes: [{
      min: 0,
      ticks: {
        display: true, //this will remove only the label
        beginAtZero: true,
        
      },
      gridLines : {
        drawBorder: true,
        display : true
      }
    }],
    xAxes : [ {
      gridLines : {
        drawBorder: false,
        display : false
      }
    }]
  },
}
this.totalIncomeChartData = new Chart('totalIncomeChart', {
  type: 'bar',
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 'Jul',"Aug", "Sep", "Oct", "Nov" , "Dec"],
    datasets: [{
      label: 'Job Accepted',
      data: dataset || [18, 22, 24, 14, 16, 18, 9, 15, 11, 7, 16, 13],
            backgroundColor: '#40DBF3'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
      legend: {
        display: false,
      },
      tooltip: {
        // Disable the on-canvas tooltip
        enabled: false
      },
    scales: {
      yAxes: [{
        ticks: {
          display: true,
          reverse: false,
          min: 0,
          stepSize: 5,
          callback: (value, index, values) => {
            if (Math.floor(value) === value) {
              return value;
          }
            
    }
        },
        gridLines : {
          drawBorder: true,
          display : true
        }
      }],
      xAxes : [ {
        gridLines : {
          drawBorder: false,
          display : false
        }
      }]
    },
  }
});
this.totalIncomeChartData.update();
}

fetchTutorChart(year){
  this.tutorService.tutorJobPostedDashboard(year).subscribe((res:any)=> {
    // this.totalIncomeChartData = undefined
    this.tutorGraph(Object.values(res.data));
    this.dataset = Object.values(res.data);
    this.years = res.years
  });
}

startSession(session){
  this.tutorService.startSession(session.next_class_detail.id).subscribe((res: any) => {
    if(res.success){
      this.websocketService.emit(`start_session`, {
        full_name: this.userInfo.full_name,
        session_id: session.next_class_detail.id,
        tutor_id: this.userId,
        job_id: this.dasBoardData.next_class_detail.job_id,
        job_title: this.dasBoardData.next_class_detail.job_title,
        student_id: this.dasBoardData.next_class_detail.student_id
      });
      this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: session.next_class_detail.id});
      // this.router.navigate(['/video'])
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

convertDate(date){
  return moment(date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');
}

earlySessionModal(){ 
  $('#earlySession').modal('show');
}

earlyStartRequest(msg){
  this.earlyReasonErr = false;
  this.websocketService.emit('early_session_start_request', {
    job_id: this.dasBoardData.next_class_detail.job_id,
    receiver_id: this.dasBoardData.next_class_detail.student_id,
    reference_id : this.dasBoardData.next_class_detail.id,
    notification: 'Tutor wants to early start session '+this.dasBoardData.next_class_detail.job_title,
    notification_message: msg,
    type: 'session_early_start',
    tutor_id: this.userId,
    job_title: this.dasBoardData.next_class_detail.job_title,
    full_name: this.userInfo.full_name,
    schedule_date: moment(this.dasBoardData.next_class_detail.start_at).format('dddd DD-MM-YYYY hh:mm A'),
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

jobSessionStart(sessions){
  sessions.forEach(ele => {
    
  let startDate = moment(ele.start_at)
  let endTime = moment(ele.end_at)
  let momentNow = moment()
    ele.start_time = moment(ele.start_at, 'HH:mm:ss').format('hh:mm A');
    ele.end_time = moment(ele.end_at, 'HH:mm:ss').format('hh:mm A');
    ele.status == null || ele.status == 'Pending' ? ele.status = 'Upcoming' : ''
  if(momentNow.isAfter(startDate) && momentNow.isBefore(endTime) ){
    ele.sessionStartBtn = true
  } else {
    ele.sessionStartBtn = false;
  }
  })
}

}


