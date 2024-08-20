import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { AlertService, LocalStorageService, UserService, WebsocketService } from '@app/shared/_services';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-header3',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class Header2Component implements OnInit, OnDestroy {
variables = environment
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
  userRole;
  userId;
  notificationList=[];
  headerTimeZone;

  constructor(private asyncRequestService: AsyncRequestService,
              private localStorageService: LocalStorageService,
              private userService: UserService,
              private router: Router,
              private notifierService: AlertService,
              private cookieService: CookieService,
              private websocketService: WebsocketService
             ) {
               this.userRole = this.localStorageService.getRole();
              this.localStorageService.currentData.subscribe((result) => {
                if(result) {
                  if (this.localStorageService.getUserData()) {
                    this.userInfo = this.localStorageService.getUserData();
                  }
                }
              });
              }

  ngOnInit() { if (this.localStorageService.getUserData()) {
    this.userInfo = this.localStorageService.getUserData();
    this.userId = this.localStorageService.getRefId();
  }

  this.sendNotification();
  this.receiveNotification();
  this.emitNotificationCount();
  this.notificationCount();
  this.localStorageService.timeZone.subscribe((res:any) => {
    this.headerTimeZone = res
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
        if (errorResponse.status == 400) {
          this.notifierService.error(errorResponse.error.error_message);
        }
      }
    }
  );
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

ngOnDestroy() {
  this.websocketService.closeListener(`new_notification_${this.userId}`);
  this.websocketService.closeListener(`notification_list_${this.userId}`);
  this.websocketService.closeListener(`notification_count_${this.userId}`);
}

totalNotificationCount = 0;

notificationCount(){
  this.websocketService.listen(`notification_count_${this.userId}`).subscribe((res: any) => {
    this.totalNotificationCount = res.data;
  });
}

emitNotificationCount(){
  this.websocketService.emit('notification_count',{user_id: this.userId});
}
}
