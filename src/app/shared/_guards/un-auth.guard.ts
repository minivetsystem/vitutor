import { Injectable, Inject, PLATFORM_ID  } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UnAuthGuard implements CanActivate {

  // constructor(private router: Router, private toasterService: toasterService, public helpers: Helper) { }
  constructor(private router: Router,
  //  private toasterService: AlertService,
              @Inject(PLATFORM_ID) private platformId: object
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // if (!this.helpers.checkAuth()) {
      // check if route is admin
      const url = state.url.split('/');

      if (url.includes('admin') && url.includes('session')) {
          localStorage.clear();
          return true;
        }
      if (isPlatformBrowser(this.platformId)) {
          // code...
          if (!localStorage.getItem('user')) {
            // not logged in so return true
            return true;
          }
          if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user'));
            // // USER HAS ROLE STUDENT CAN VISIT SITE
            // if (user.role == 'student') {
            //   return true;
            // }
            this.router.navigate([user.role + '/dashboard']);
            return true;
          }
        }

    // logged in so redirect to home page with the return url
    // this.toasterService.error('Error', 'You are not authorized to access this. Please signin or register to continue.');
      this.router.navigate(['']);
      return false;
  }
}
