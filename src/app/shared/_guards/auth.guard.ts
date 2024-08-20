import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageService } from '../_services';
import { AsyncRequestService } from '@app/core/services/async-request.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    // private toastrService: AlertService,
    private localStorageService: LocalStorageService,
    private asyncService: AsyncRequestService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (isPlatformBrowser(this.platformId)) {
      if (this.localStorageService.checkUser()) {

        const current_user_role = this.localStorageService.getRole();
        // check if route is restricted by role
        if (route.data.roles && route.data.roles.indexOf(current_user_role) === -1) {
          // role not authorised so redirect to home page
          this.router.navigate(['/']);
          return false;
        }
        // authorised so return true
        return true;
      } else {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    } else {
    }
  }
}
