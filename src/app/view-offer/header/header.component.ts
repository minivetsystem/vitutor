

import { Component, OnInit, Output , EventEmitter, OnDestroy} from '@angular/core';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { LocalStorageService, AlertService, UserService } from '@app/shared/_services';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit,OnDestroy {
  variables = environment
  logout_url = 'logout';
  response: any;
  isLoggedInUser = false;
  userInfo = {photo : 'https://via.placeholder.com/50', full_name: 'Alicia Dale'};
  menuOpen = 0;
  userId
  constructor(
    private asyncRequestService: AsyncRequestService,
    private localStorageService: LocalStorageService,
    private notifierService: AlertService,
    private cookieService: CookieService,
    private userService: UserService,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit() {
     if (this.localStorageService.getUserData()) {
      this.userInfo = this.localStorageService.getUserData();
      
    }
    this.userId = this.localStorageService.getRefId();
    if(this.userId){
      this.commonService.listenRefresh(this.userId).subscribe((res:any)=> {
        window.location.reload();
      })
    }
  }

  onLogout() {
    this.asyncRequestService.getRequest(this.logout_url).subscribe(
      (response) => {
        this.response = response;
        this.userService.getUserDetail(null);
        this.localStorageService.clearUserData();
        this.notifierService.success(this.response.success_message);
        this.cookieService.delete('remember_me');
        this.router.navigate(['/login']);
        this.isLoggedInUser = false;
      },
      (errorResponse) => {
        if (errorResponse) {
          if (errorResponse.status === 400) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      }
    );
  }

  menuToggle() {
   
    this.menuOpen = this.menuOpen == 1? 0: 1;
    this.commonService.menuToggled(this.menuOpen);
    
  }

  ngOnDestroy(){
    this.commonService.closeRefresh(this.userId)
  }

}

