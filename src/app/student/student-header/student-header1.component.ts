import { Component, OnInit, Output , EventEmitter, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { LocalStorageService, AlertService, UserService , WebsocketService} from '@app/shared/_services';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService} from 'src/app/common/services/common.service'
// import { EventEmitter } from 'events';
import {StudentService} from '../student.service';
declare const $:any;


@Component({
  selector: 'app-student-header1',
  templateUrl: './student-header1.component.html',
  styleUrls: ['./student-header1.component.scss']
})
export class StudentHeader1Component implements OnInit, OnDestroy {
  @Output() menu: EventEmitter<any> = new EventEmitter();
  logout_url = 'logout';
  response: any;
  isLoggedInUser = false;
  toggle: boolean;
  searchSubmitted = false;
  dashboardUrl: string = '';
  user_profile_url: string = '';
  user_settings_url: string = '';
  profileUrl: string = '';
  showSearchBox = false;
  imageSrc = 'assets/img/user.png';
  userInfo:any;
  searchForm: FormGroup;
  cartVisible = false;
  isMenuToggle = false;
  menuOpen = 0;
  toggleNav = false;
  userId;
  notificationList = [];
  earlySessionObj;
  earlyReasonErr = false;
  joinSessionObj;
  timeZone;
  categoriesLists;
  keyword='display_name';
  initialValue
  searchTerm;
  totalNotificationCount

  @ViewChild('reason', {static : false}) reason: ElementRef
  constructor(
    private asyncRequestService: AsyncRequestService,
    private localStorageService: LocalStorageService,
    private notifierService: AlertService,
    private cookieService: CookieService,
    private userService: UserService,
    private router: Router,
    private commonService: CommonService,
    private websocketService: WebsocketService, 
    private studentService: StudentService
    ) {
      this.localStorageService.currentData.subscribe((result) => {
        if(result) {
          if (this.localStorageService.getUserData()) {
            this.userInfo = this.localStorageService.getUserData();
          }
        }
      })
      this.localStorageService.timeZone.subscribe((res:any) => {
        this.timeZone = res;
      })
      this.userId = this.localStorageService.getRefId();
     }

  ngOnInit() {
    if (this.localStorageService.getUserData()) {
      this.userInfo = this.localStorageService.getUserData();
    }
     (<any>this.getCategories())
    this.receiveNotification();
    this.sendNotification();
    this.getEarlySessionRequest();
    this. joinSessionEarly();
    this.emitNotificationCount();
    this.notificationCount();
    this.commonService.listenRefresh(this.userId).subscribe((res:any)=> {
        window.location.reload();
    })

   
    
  }

  getCategories(){
    this.studentService.fetchCategories().subscribe((res:any) => {
      this.categoriesLists = res.allCats
    })
  }

  sendNotification(){
    this.websocketService.emit('notification_list',{user_id: this.userId});
    this.websocketService.listen(`notification_list_${this.userId}`).subscribe((res:any)=> {
      this.notificationList = res.data;

      
    });
    
  }

  receiveNotification(){
    this.websocketService.listen(`new_notification_${this.userId}`).subscribe((res: any) => {
      this.notificationList.unshift(res);
    });
  }

  notificationCount(){
    this.websocketService.listen(`notification_count_${this.userId}`).subscribe((res: any) => {
      this.totalNotificationCount = res.data;
    });
  }

  emitNotificationCount(){
    this.websocketService.emit('notification_count',{user_id: this.userId});
  }

  

  onLogout() {
    
    this.asyncRequestService.getRequest(this.logout_url).subscribe(
      (response) => {
        this.response = response;
        this.userService.getUserDetail(null);
        this.localStorageService.clearUserData();
        this.notifierService.success(this.response.success_message);
        this.cookieService.delete("remember_me");
        this.router.navigate(['/login']);
        this.isLoggedInUser = false;
      },
      (errorResponse) => {
        if (errorResponse) {
          if (errorResponse.status == 400) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      }
    );
  }
  menuToggle() {
    this.isMenuToggle = !this.isMenuToggle;
    this.menu.emit('test');
    this.menuOpen = this.menuOpen == 1? 0: 1;
    this.commonService.menuToggled(this.menuOpen);
  }

  NotificationCount(list){
    return (list.filter(ele => ele.status == 0)).length
  }

  ngOnDestroy() {
    this.websocketService.closeListener(`new_notification_${this.userId}`);
    this.websocketService.closeListener(`notification_list_${this.userId}`);
    this.commonService.closeRefresh(this.userId);
    this.websocketService.closeListener(`notification_count_${this.userId}`);
  }

  redirect(data){
    this.studentService.studentNotificationCompleted({status: 1, notification_id : data.id}).subscribe(res => {
      this.websocketService.emit('notification_count',{user_id: this.userId});
      let type = data.type
      if(type=='new_message'){
        this.router.navigate(['/student/message-board'],{ queryParams: { message_board_room_id: data.reference_id, autoSelect:true}})
      } else if(type=='admin_new_message'){
        this.router.navigate(['/student/message-board'], { queryParams: { message_board_room_id: data.reference_id}})
      } else if(type=='job_accepted'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'JobPosted'}});
      } else if (type == 'new_application_received'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'ApplicationReceived'}});
      } else if (type == 'job_applied'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'JobPosted'}});
      } else if (type == 'session_early_start'){
        this.notifierService.error('Request is expired')
      } else if (type == 'job_offer'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'sentOffer'}});
      } 
      data.status = 1;
    });

   
  }

  getEarlySessionRequest(){
    this.websocketService.listen(`session_request_${this.userId}`).subscribe((res: any) => {
      this.earlySessionObj = res;
      $('#earlySession').modal('show');
    })
  }

  earlySessionResponse(type, msg){
    
    // if(msg == ''){
    //   msg = (type == 'accept'? 'Student accepted ' : 'Student rejected ') + 'request for early start session ';
    // }
    this.earlyReasonErr = false;
    let event_name = ('early_session_response').trim();
    this.websocketService.emit(event_name, {
      job_id: this.earlySessionObj.job_id,
      receiver_id : this.earlySessionObj.tutor_id,
      reference_id :this.earlySessionObj.reference_id,
      notification: (type == 'accept'? 'Student accepted ' : 'Student rejected ') + 'request for early start session ' + this.earlySessionObj.job_title,
      notification_message: msg,
      type: 'session_early_start',
      student_id: this.userId,
      response_type : type,
      full_name : this.userInfo.full_name,
      job_title : this.earlySessionObj.job_title
    });
    this.notifierService.success(`Successfully sent to tutor`);
   this.reason.nativeElement.value = '';
    $('#earlySession').modal('hide');
  }

  sendReason(event){
    if(event.target.value == ''){
      this.earlyReasonErr = true;
    } else {
      this.earlyReasonErr = false;
    }
  }

  showModal(){
    $('#earlySession').modal('show');
  }

  joinSessionEarly(){
    this.websocketService.listen(`session_started_${this.userId}`).subscribe((res: any) => {
      this.joinSessionObj = res;
      $('#joinSession').modal('show')
    })

  }

  joinSession(){
    this.studentService.joinSession(this.joinSessionObj.session_id).subscribe((res:any) => {
      if(res.success == true && res.data != 0){
        this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: this.joinSessionObj.reference_id});
        $('#joinSession').modal('hide')
        // this.router.navigate(['/video']);
        let newRelativeUrl = this.router.createUrlTree(['/video']);
        let baseUrl = window.location.href.replace(this.router.url, '');
    
        window.open(baseUrl + newRelativeUrl, '_blank');
      } else if(res.success == false && res.data != 0){
        this.notifierService.error(res.success_message || res.error_message)
      } else if(res.data == 0 || !res.data.videourl){
        this.notifierService.error("Tutor hasn't started session yet");
      }
    }, (err:any) => {
      this.notifierService.error(err.error.error_message||'Unable to Join session');
    })

  }

  redirectTo(){
    if(this.searchTerm){
      this.localStorageService.set('filter', this.searchTerm.id)
      this.router.navigate(['/search/searchTutor']);
    } else {
      if(this.localStorageService.get('filter')){
      this.localStorageService.remove('filter')
    }
    this.notifierService.error("You haven't selected any subject from the list below")
  }
   
    
  }

  selectEvent(item) {
    this.searchTerm = item;
  }

  searchCleared(){
   
    this.closeStaticPanel()
  }

  closeStaticPanel(): void {
    // // e.stopPropagation();
    // this.auto.close();
  }

  onChangeExperience() {
  
  }

  textChange(event){
    this.searchTerm = undefined
  }



}
