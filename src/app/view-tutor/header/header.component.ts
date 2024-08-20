
import { Component, OnInit, Output , EventEmitter} from '@angular/core';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { LocalStorageService, AlertService, UserService } from '@app/shared/_services';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
// import { EventEmitter } from 'events';


@Component({
  selector: 'app-header2',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
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
  constructor(
    private asyncRequestService: AsyncRequestService,
    private localStorageService: LocalStorageService,
    private notifierService: AlertService,
    private cookieService: CookieService,
    private userService: UserService,
    private router: Router
    ) {
      this.localStorageService.currentData.subscribe((result) => {
        if(result) {
          if (this.localStorageService.getUserData()) {
            this.userInfo = this.localStorageService.getUserData();
          }
        }
      })
     }

  ngOnInit() {
    if (this.localStorageService.getUserData()) {
      this.userInfo = this.localStorageService.getUserData();
    }
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
  }

}
