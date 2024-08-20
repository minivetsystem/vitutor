import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { LocalStorageService, AlertService, UserService } from '@app/shared/_services';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/common/services/common.service';
import { WebsocketService } from '../../shared/_services';
import { TutorService } from '../tutor.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
declare const $:any;

@Component({
  selector: 'app-header1',
  templateUrl: './header1.component.html',
  styleUrls: ['./header1.component.scss']
})
export class Header1Component implements OnInit, OnDestroy {
  logout_url = "logout";
  response: any;
  toggle: boolean;
  searchSubmitted = false;
  dashboardUrl: string = "";
  user_profile_url: string = "";
  user_settings_url: string = "";
  profileUrl: string = "";
  showSearchBox = false;
  userInfo:any;
  searchForm: FormGroup;
  cartVisible = false;
  isLoggedInUser = false;
  toggleNav = false;
  menuOpen = 0;
  notificationList = []
  userId;
  earlySessionRequestObj;
  headerTimeZone
  searchParams = { search_term: '', job_type: 'one-time,recurring,instant-tutoring', price_type: 'Hourly,Fixed', 'sort-by': 'newest', category: 'All',
    hourly_range_from: 0,hourly_range_to: 600,searchType : "Keyword", proposed_start_time: '',class_level:'ALL'
  };
  totalNotificationCount = 0;
  constructor(
    private asyncRequestService: AsyncRequestService,
    private localStorageService: LocalStorageService,
    private notifierService: AlertService,
    private cookieService: CookieService,
    private userService: UserService,
    private router: Router,
    private commonService: CommonService,
    private websocketService: WebsocketService,
    private tutorService: TutorService
    ) {
      this.localStorageService.currentData.subscribe((result) => {
        if(result) {
          if (this.localStorageService.getUserData()) {
            this.userInfo = this.localStorageService.getUserData();
          }
        }
      })
      this.userId = this.localStorageService.getRefId();
     }

  ngOnInit() {
    if (this.localStorageService.getUserData()) {
      this.userInfo = this.localStorageService.getUserData();
    }
    this.receiveNotification();
    this.sendNotification();
    this.receiveEarlySession();
    this.notificationCount();
    this.emitNotificationCount();
    this.localStorageService.timeZone.subscribe((res:any) => {
      this.headerTimeZone = res
    })

    this.commonService.listenRefresh(this.userId).subscribe((res:any)=> {
        window.location.reload();
    })
   
  }

  onLogout() {
    this.asyncRequestService.getRequest(this.logout_url).subscribe(
      (response) => {
        this.response = response;
        this.userService.getUserDetail(null);
        this.localStorageService.clearUserData();
        this.notifierService.success(this.response.success_message);
        this.cookieService.delete("remember_me");
        this.router.navigate(["/login"]);
        this.isLoggedInUser = false;
      },
      (errorResponse) => {
        if (errorResponse) {
          if (errorResponse.status == 400)
            this.notifierService.error(errorResponse.error.error_message);
        }
      }
    );
  }
  menuToggle() {
   
    this.menuOpen = this.menuOpen == 1? 0: 1;
    this.commonService.menuToggled(this.menuOpen);
    
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

  receiveEarlySession(){
    this.websocketService.listen(`session_response_${this.userId}`).subscribe((res: any) => {
      this.earlySessionRequestObj = res;
      if(this.earlySessionRequestObj.response_type == 'accept'){
        $('#startSession').modal('show');
      } else {
        this.notifierService.error(`Student has reject your request for starting ${this.earlySessionRequestObj.job_title} early `)
      }
    })
  }

 
  startSession(){
    if(!this.earlySessionRequestObj.reference_id){
      this.notifierService.error('Session cannot be start due to some technical issue');
      return;
    }
    this.tutorService.startSession(this.earlySessionRequestObj.reference_id).subscribe((res: any) => {
      if(res.success){
        this.commonService.setSessionToken({videoUrl:res.data.videourl, session_id: this.earlySessionRequestObj.reference_id});
        this.websocketService.emit(`start_session`, {
          full_name: this.userInfo.full_name,
          session_id: this.earlySessionRequestObj.reference_id,
          tutor_id: this.userId,
          job_id: this.earlySessionRequestObj.job_id,
          job_title: this.earlySessionRequestObj.job_title,
          student_id: this.earlySessionRequestObj.student_id
        });
        $('#startSession').modal('hide');
        // this.router.navigate(['/video'])
        let newRelativeUrl = this.router.createUrlTree(['/video']);
        let baseUrl = window.location.href.replace(this.router.url, '');
    
        window.open(baseUrl + newRelativeUrl, '_blank');
      } else {
        this.notifierService.error(res.success_message || res.error_message)
      }
    }, err => {
      this.notifierService.error(err.error.error_message)
    })
  }

  redirectTo(){
    if(this.searchParams.search_term.trim() == ''){
      this.notifierService.error('Field cannot be empty');
      return;
    } 
    this.localStorageService.set('filter', (this.searchParams));
    this.router.navigate(['/searchJob/search-jobs']);
  }

  ngOnDestroy() {
    this.websocketService.closeListener(`new_notification_${this.userId}`);
    this.websocketService.closeListener(`notification_list_${this.userId}`);
    this.commonService.closeRefresh(this.userId);
    this.websocketService.closeListener(`notification_count_${this.userId}`);
  }

  redirect(data){
    this.tutorService.tutorNotificationCompleted({status: 1, notification_id : data.id}).subscribe(res => {
      this.websocketService.emit('notification_count',{user_id: this.userId});
      let type = data.type
      if(type=='new_message'){
        this.router.navigate(['/tutor/message-board'], { queryParams: { message_board_room_id: data.reference_id}})
      } else if(type=='admin_new_message'){
        this.router.navigate(['/tutor/message-board'])
      } else if(type=='job_accepted'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'NewOffer'}});
      } else if (type == 'new_application_received'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'NewInvite'}});
      } else if (type == 'job_applied'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'Applied'}});
      } else if (type == 'session_early_start'){
        this.notifierService.error('Request is expired')
      } else if (type == 'job_invite'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'NewInvite'}});
      } else if (type == 'send_offer'){
        this.router.navigate(['/tutor/message-board'])
      }else if (type == 'payment'){
        this.router.navigate(['/tutor/account-setting'])
      }
      
      data.status = 1;
    });

   
  }

  NotificationCount(list){
    return (list.filter(ele => ele.status == 0)).length
  }

  notificationCount(){
    this.websocketService.listen(`notification_count_${this.userId}`).subscribe((res: any) => {
      this.totalNotificationCount = res.data;
    });
  }

  emitNotificationCount(){
    this.websocketService.emit('notification_count',{user_id: this.userId});
  }

  

}


// https://vitutors-dev.s3-us-west-1.amazonaws.com/user_data/user_175_5f8fcd100aac3/profile-picture/hSiri6WK4LpSHmtK0cUUXbHOE8lLHL8TBZKJUlWV.jpeg
// https://vitutors-dev.s3-us-west-1.amazonaws.com/user_data/user_175_5f8fcd100aac3/profile-pictureh/Siri6WK4LpSHmtK0cUUXbHOE8lLHL8TBZKJUlWV.jpeg
// https://vitutors-dev.s3-us-west-1.amazonaws.com/public/profile-picture/hSiri6WK4LpSHmtK0cUUXbHOE8lLHL8TBZKJUlWV.jpeg