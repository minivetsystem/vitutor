import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../_services';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate  {
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (isPlatformBrowser(this.platformId)) {

      if (this.localStorageService.checkUser()) {
        const current_user = this.localStorageService.getRole();
        // check if route is restricted by role
        if (route.data.roles && route.data.roles.indexOf(current_user) === -1) {
          // role not authorised so redirect to home page
          this.router.navigate(['/page-not-found']);
          return false;
        }
        // authorised so return true
        return true;
      } else {
        return false;
      }
    }
  }
}
