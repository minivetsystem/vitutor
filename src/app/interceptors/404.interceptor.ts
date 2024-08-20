import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { LocalStorageService, UserService } from '@app/shared/_services/index';
import { CookieService } from 'ngx-cookie-service';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment-timezone';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly notifier: NotifierService;
  constructor(
    notifierService: NotifierService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private cookieService: CookieService,
    private userServic: UserService
  ) {
    this.notifier = notifierService;
  }

  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) {return null; }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }
  isTokenExpired(token?: string): boolean {
    if (!token) { token = this.localStorageService.getJwtToken(); }
    if (!token){ return true; }

    const date = this.getTokenExpirationDate(token);
    if (date === undefined) { return false; }
    return !(date.valueOf() > new Date().valueOf());
  }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.localStorageService.getJwtToken();
    const remember_me = this.cookieService.get("remember_me");
    // set timezone in the header of the api
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(this.localStorageService.getTimeZone()){
      timezone = this.localStorageService.getTimeZone();
    }
        request = request.clone({
          headers: request.headers.set('Timezone', timezone),
        });
    
     
  
    // prepare token to send with request
    if (token && !this.isTokenExpired()) {
      let tokens = JSON.parse(token);
      request = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + tokens),
      });
    }
    //check remember
    if (remember_me) {
      request = request.clone({
        headers: request.headers.set('remember', remember_me),
      });
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 409) {
            this.router.navigate(["/page-not-found"]);
            this.notifier.notify(
              'error',
              'You are not authorized to access this page.'
            );
            return;
          }
          if (error.status === 417) {
            this.router.navigate(["/page-not-found"]);
            return;
          }
          if (error.status === 429) {
            this.notifier.notify("error", "Too Many Requests");
            return;
          }
          /** Server Validation Errors **/
          if (error.status == 422) {
            const errors = error.error.errors;
            for (var k in errors) {
              if(k){
              const err = errors[k];
              for (let index = 0; index < err.length; index++) {
                const element = err[index];
                if (element.length) { this.notifier.notify("error", element); }
              }
            }
            }
          }

          if (error.status === 401) {
            this.userServic.getUserDetail(null);
            this.localStorageService.clearUserData();
            this.cookieService.delete("remember_me");
            // this.router.navigate(['/login']);
            
            // this.localStorageService.clearUserData();
            this.router.navigate(["/login"],{
              queryParams: { returnUrl: this.router.url }
            });
            this.notifier.hideAll();
            this.notifier.notify("error", error.error.message);
          }
        }
        return throwError(error);
      })
    );
  }
}

export const HttpErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: HttpErrorInterceptor,
  multi: true,
};
