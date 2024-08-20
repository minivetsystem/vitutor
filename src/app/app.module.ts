import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UnAuthGuard } from './shared/_guards';
import { AsyncRequestService } from "../app/core/services/async-request.service";
import { CommonService } from "../app/common/services/common.service";
import { HttpClient } from "@angular/common/http";
import {
  ApplicationHttpClient,
  applicationHttpClientCreator,
} from "./utils/http.client";
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpErrorInterceptorProvider } from '@app/interceptors/404.interceptor';
import { HttpLoaderInterceptorProvider } from '@app/interceptors/loader-service-interceptor';
import { SharedModule } from '@app/shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
// import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import {
  GoogleLoginProvider,
  FacebookLoginProvider
} from 'angularx-social-login';
const notifierConfig: NotifierOptions = {
  position: {
    horizontal: {
      position: 'right',
    },
    vertical: {
      position: 'top',
    },
  },
};

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxSpinnerModule,
    SharedModule,
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: "right",
        },
        vertical: {
          position: "top",
        },
      },
    }),
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    SocialLoginModule,
    NgSelectModule,
    // NgxMaterialTimepickerModule
  ],
  providers: [
    UnAuthGuard,
    AsyncRequestService,
    CommonService,
    NgxSpinnerService,
    {
      provide: ApplicationHttpClient,
      useFactory: applicationHttpClientCreator,
      
      deps: [HttpClient],
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '655770116128-3iros8hojt62p5t7jljsh4eh0je0b4f8.apps.googleusercontent.com'
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(
              '777760666132712'
            ),
          }
          
        ],
      } as SocialAuthServiceConfig,
    },
    HttpErrorInterceptorProvider,
    HttpLoaderInterceptorProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
