import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { StudentService } from '../student.service';
import * as moment from 'moment-timezone';
import Swal from 'sweetalert2';
import { constantVariables } from '@app/shared/_constants/constants';
import { AlertService, LocalStorageService} from '../../shared/_services/index';
declare var Chart: any;
declare var Circles: any;


@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
	// @Input() toggle;
	menuToggle;
	dashBoard;
	timer:any;
	interval;
	years = [2021];
	year = 2021;
	swalErrorOption = constantVariables.swalErrorOption;
	swalSuccessOption = constantVariables.swalSuccessOption;
	swalInfoOption = constantVariables.swalInfoOption;
	swalWarningOption = constantVariables.swalWarningOption;
	mytotalIncomeChart
	@ViewChild('totalIncomeChart', {static : true}) totalIncomeChart: ElementRef<HTMLCanvasElement>;
	result:any ={result : {profile_completed: true}}
	timezone;

  constructor(private async: AsyncRequestService, private router: Router,private commonService:CommonService, private studentService : StudentService, private notifier : AlertService, private localStorageService: LocalStorageService) { 
	
  }

  ngOnInit() {
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
	  	this.studentJobPosted(this.year);
		this.studentDashboard()
  }

  studentDashboard(){
	  this.studentService.studentDashboard().subscribe((res:any)=> {
		  res.upcoming = true;
		  if(res.upcoming_job_session && Object.keys(res.upcoming_job_session).length > 0){
			this.jobSessionJoin(res.today_sessions)
			res.upcoming_job_session.start_time = moment(res.upcoming_job_session.start_time,'HH:mm:ss').format('hh:mm A');
			res.upcoming_job_session.end_time = moment(res.upcoming_job_session.end_time,'HH:mm:ss').format('hh:mm A');
			res.upcoming_job_session.session_date = moment(res.upcoming_job_session.date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');
			this.timerFunction(res.upcoming_job_session);
		  } else {
			  res.upcoming = false;
		  }
		
		
		this.circleDraw(res);
		
		this.dashBoard = res;
		
	  })
  }

  yearValueChange(event) {
	  this.year = event.target.value;
	  this.mytotalIncomeChart.destroy();
	  this.studentJobPosted(this.year);

  }

  chartDraw(dataset){
	// let bar_ctx = this.totalIncomeChart.nativeElement.getContext('2d');

	// 	let blue_gradiant = bar_ctx.createLinearGradient(0, 0, 0, 600);
	// 	blue_gradiant.addColorStop(0, '#40DBF3');
	// 	blue_gradiant.addColorStop(1, '#1C7EE1');

	 this.mytotalIncomeChart = new Chart('totalIncomeChart', {
			type: 'bar',
			data: {
				labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov" , "Dec"],
				datasets: [{
					label: 'Job Posted',
					data: dataset || [18, 22, 24, 14, 16, 18, 9, 15, 11, 7, 16, 13],
								backgroundColor: '#40DBF3',
								hoverBackgroundColor: '#1C7EE1',
								hoverBorderWidth: 0,
								hoverBorderColor: ''
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				legend: {
					display: false,
				},
				scales: {
					yAxes: [{
						ticks: {
							display: true, //this will remove only the label
							beginAtZero:true,
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
  }
  

  circleDraw(job){
	Circles.create({
		id: 'circles-1',
		radius: 45,
		value: job.total_session_completed || 0,
		maxValue: 100,
		width: 7,
		text: job.total_session_completed || '0',
		colors: ['#DCE0E3', '#1C7EE1'],
		duration: 400,
		wrpClass: 'circles-wrp',
		textClass: 'circles-text',
		styleWrapper: true,
		styleText: true
})
  }

  convertTime(time){
	  return moment(time,'HH:mm:ss').format('hh:mm A');
  }

  timerFunction(job){
	let timeZone = this.localStorageService.getTimeZone();
	let momentNow=moment()
	let schedule_date = moment(job.start_at);
	let schedule_end = moment(job.end_at);
	job['session_status'] = 'pending';
	let countDownDate = schedule_date.valueOf();
	let endTime = schedule_end.valueOf();
	let now = momentNow.valueOf();
	let distance = countDownDate - now;
	let endDistance = endTime - now;
	this.timer = '';
   
	//  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	//   let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	//   let endHours = Math.floor((endDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	//   let endMinutes = Math.floor((endDistance % (1000 * 60 * 60 )) / (1000 * 60));
	if(schedule_date.format('DD/MM/YYYY') == momentNow.format('DD/MM/YYYY') ){
	// Update the count down every 1 second

	  job['showBtn'] = true
	  this.interval = setInterval(() => {
        this.timer = this.commonService.timerStart(job.start_at);
		if (schedule_date.diff(moment()) <= 0 && schedule_end.diff(moment())>=0) {
			job['showBtn'] = true;
			job['session_status'] = 'started';
		  } else if(schedule_end.diff(moment()) <=0) {
			job['showBtn'] = true;
			job['session_status'] = 'expired';
		  } else{
			job['showBtn'] = true;
			job['session_status'] = 'pending';
		  }
      }, 1000);
	
  } else if(schedule_date.isAfter(momentNow)){
	job['showBtn'] = false;
	job['session_status'] = 'upcoming';
  }else {
	job['showBtn'] = false;
	job['session_status'] = 'expired';
  }

  }

  studentJobPosted(year){
	  this.studentService.studentJobPsotedDashboard(year).subscribe((res:any)=> {
		this.totalIncomeChart
		this.chartDraw(Object.values(res.data));
		this.years = res.years
	  })
  }

  makePayment(job){
    let sessionId = job.id
    let amount = 0
    if(job.price_type == 'Hourly'){
      amount = (+(job.total_amount.replace('$','')))*(job.duration)
    } else {
      amount = +(job.total_amount.replace('$',''))
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
            // let session = this.jobsList.find((obj)=> obj.id === sessionId);
            // session ? session['payment_status'] = 1 : '';
			job['payment_status'] = 1;
			let find = this.dashBoard.today_sessions.find(x => x.id == job.id)
			find ? find['payment_status'] = 1 : null
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

  joinSession(sessionId){
    this.studentService.joinSession(sessionId).subscribe((res:any) => {
		debugger

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

  jobSessionJoin(sessions){
	  sessions.forEach(ele => {
		let startDate = moment(ele.start_at)
		let endTime = moment(ele.end_at)
		let momentNow = moment()
		let currentDiff =  momentNow.isAfter(startDate)
		let currentDiff2 =  momentNow.isBefore(endTime)
		let currentDatetiem3 =moment(startDate).diff(momentNow,'minutes')
		if(moment(startDate).diff(momentNow,'minutes') <= 60*2 && currentDiff){
			ele.makePayment = true
			ele.sessionJoinBtn = true
		}else if(moment(startDate).diff(momentNow,'minutes') <= 15){
			let disableInterval = setInterval(()=>{
				let currentDatetiem34 =moment(startDate).diff(momentNow,'minutes')
				// debugger
				if(moment(startDate).diff(momentNow,'minutes') <= 0){
					ele.sessionJoinBtn = true
					ele.sessionJoinBtnDisable = false
					clearInterval(disableInterval);
				}
			},1000)
			ele.sessionJoinBtn = true
			ele.sessionJoinBtnDisable = true
		}else if(currentDiff && currentDiff2){
			ele.sessionJoinBtn = true
			ele.sessionJoinBtnDisable = false
		} else {
			ele.sessionJoinBtnDisable = false
			ele.makePayment = false;
		}
	  })
  }

  convertDate(date){
	  return moment(date, 'YYYY-MM-DD').format('dddd MM-DD-YYYY');
  }

  navigate(url){
	  this.router.navigate(['/student/'+url]);
  }

}
