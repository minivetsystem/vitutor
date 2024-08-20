import { AfterViewInit, Component, ElementRef, OnInit, ViewChild , Renderer2, OnDestroy} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {VideoService} from '../video.service';
// import { DOCUMENT } from '@angular/platform-browser';
declare const groupworld: any
import {CommonService} from '../../common/services/common.service'
import { LocalStorageService, AlertService, WebsocketService } from '@app/shared/_services';
import { Router } from '@angular/router';
import * as moment from 'moment';
declare const $: any;

@Component({
  selector: 'app-player',
  template: `
  
  <app-header3></app-header3>
  <div>
    <div *ngIf="url" >
    <iframe   allow="camera;microphone"  frameborder="0" class="iframeClass"   [src]="safeUrl" title="vitutors session"></iframe>
    </div>
    
   <div *ngIf="!url">
   <h3> Unable to play video</h3>
   </div>
   <div class="mt-10 text-center" *ngIf="role">
   <button *ngIf="role == 'student' "class="btn btn-red" (click)="leaveSession()">Leave Session </button>
   <button *ngIf="role == 'tutor' "class="btn btn-primary" (click)="markAsComplete()">Mark Session Completed </button>
  <!--<button *ngIf="role == 'tutor' "class="btn btn-danger" (click)="triggerRefresh()">Refresh </button>-->
   
   </div>
   </div>

   <div id="extendSession" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <!-- Modal content-->
        <div  class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Extend Session</h4>
                <button type="button" class="close" data-dismiss="modal" ><img src="assets/img/images/close-14.svg"></button>
            </div>
            <div class="modal-body">
                <div class="col-lg-12 ">
                 <p> Session is coming to end, do you want to extend it by 1 hour?</p>
               </div>
              
                <div class="col-lg-12 text-center">
                    <button class="btn btn-orange mr-3" data-dismiss="modal">Cancel</button>
                    <button class="btn btn-red mr-3" (click)="updateEndTime()">Extend</button>
                    

                </div>
            </div>
        </div>
    </div>
</div>
  `,
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('player', {static: false}) player : ElementRef;
  token;
  url = 'https://api.vitutors.com/one-to-one-session?token='
  safeUrl;
  role = 'student';
  sessionId;
  interval;
  leavePage : boolean = false;
  endTime;
  refId;
  studentID
  tutorID;
  constructor(private videoService: VideoService, private renderer2: Renderer2, private commonService: CommonService, private sanitizer: DomSanitizer, private localStrageService: LocalStorageService, private router : Router, private notify: AlertService, private websocketService: WebsocketService) { 
    this.videoService.loadDynamicScript();
    this.role = this.localStrageService.getRole();
    this.refId = this.localStrageService.getRefId();
  } 

  ngOnInit() {
    this.commonService.sessionToken.subscribe((res:any)=> {
      if(res) {
        this.url = res.videoUrl;
        this.sessionId = res.session_id;
        this.fetchSession(this.sessionId);
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url )
      } else {
        this.leavePage = true; 
        this.notify.error('Unable to connect to session. Please try again')
        setTimeout(()=> {
          window.open('','_self').close();
        },2000)
        // this.router.navigate(['/'+this.role == 'student'?'student': 'tutor'+ '/dashboard'])
      }

    });

   
      this.commonService.listenRefresh(this.refId).subscribe((res: any) => {
        this.notify.success("Session is successfully completed. The window will automatically close in few seconds");
        setTimeout(()=> window.open('','_self').close(), 2500)
       
      })
    
  }



  leaveSession(){
    let body = new FormData()
    body.append('id', this.sessionId);
    this.videoService.leaveSession(body).subscribe((res:any)=> {
      // this.notify.success(res.success_message);
        this.leavePage = true;
        // this.router.navigate(['/student/dashboard']);
        // this.commonService.setSessionToken(null);
        window.open('','_self').close();
    }, err => {
      this.notify.error(err.error.error_message);
    })
   

  }

  markAsComplete(){
    
    let body = new FormData()
    body.append('id', this.sessionId);
    this.videoService.tutorSessionComplete(body).subscribe((res:any)=> {
      this.notify.success(res.success_message);
      this.triggerRefresh();
        this.leavePage = true;
        
        // this.router.navigate(['/tutor/dashboard']);
        // window.open('','_self').close();
      
    }, err => {
      this.notify.error(err.error.error_message);
    })

  }
    
  ngAfterViewInit(){

    };
    // documentElement.appendChild(scriptElement);
    

    canLeave(){
      return this.leavePage;
    }

    fetchSession(sessionId){
      this.videoService.fetchSessionRecord({id: sessionId}).subscribe((res: any)=> {
        this.endTime = res.data.end_time
        this.endTime = moment(this.endTime, 'YYYY-MM-DD HH:mm:ss').subtract('5','minutes').format('HH:mm:ss');
        if(this.role == 'tutor'){
          this.timerFunction(this.endTime);
        }
        this.studentID= res.data.student_id
        this.tutorID = res.data.tutor_id
       
      });
    }

    timerFunction(end_time){
      let timeZone = this.localStrageService.getTimeZone();
      let countDownDate = moment(end_time, 'HH:mm:ss').subtract('5','minutes').valueOf();
        this.interval = setInterval(() => {
          
        // Get today's date and time
        let now1 = moment(moment().tz(timeZone).format('YYYY-MM-DD hh:mm A'),'YYYY-MM-DD hh:mm A').valueOf()
        let distance1 = countDownDate - now1;
        if (distance1 < 0) {
          clearInterval(this.interval); 
          if(this.role == 'tutor'){
            $('#extendSession').modal('show');
          }
        }
      }, 1000);
   
    }

    updateEndTime(){
      $('#extendSession').modal('hide');
      this.endTime = moment(this.endTime, 'HH:mm:ss').add('1','hour').format('HH:mm:ss');
      this.timerFunction(this.endTime);
      // this.commonService.sendNotification()

    }

    ngOnDestroy(){
      // this.websocketService.closeListener(`refresh_user_${this.refId}`);
      this.commonService.closeRefresh(this.refId);
    }

    triggerRefresh(){
      this.commonService.sendRefresh(this.studentID);
        this.commonService.sendRefresh(this.tutorID);   
    }

    
 

  }


