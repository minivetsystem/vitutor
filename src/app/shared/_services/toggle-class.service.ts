import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({providedIn: 'root'})

export class ToggleClassService {

  public isAdmin = new BehaviorSubject<boolean>(false);
  cast = this.isAdmin.asObservable();

  public sideBar = new BehaviorSubject<boolean>(false);
  sideBarCast = this.sideBar.asObservable();

  public isAdminHoverClass = new BehaviorSubject<boolean>(false);
  isAdminHoverClassCast = this.isAdminHoverClass.asObservable();

  public isDashboardClass = new BehaviorSubject<boolean>(false);
  isDashboardClassCast = this.isDashboardClass.asObservable();

  /*** calling observable for adding side bar clasess */
  changeAdmin() {
    this.isAdmin.next(!this.isAdmin.value);
  }

  toggleSidebar() {
    this.sideBar.next(true);
  }

  isAdminHoverClassToggle(type: boolean) {
    this.isAdminHoverClass.next(type);
  }

  isDashboardClassToggle(type: boolean) {
    this.isDashboardClass.next(type);
  }
/*************************************************** */
}
