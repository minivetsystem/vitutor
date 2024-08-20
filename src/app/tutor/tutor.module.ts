import { NgModule, CUSTOM_ELEMENTS_SCHEMA ,NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TutorRoutingModule } from './tutor-routing.module';
import { TutorComponent } from './tutor.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { SharedModule } from '../shared/shared.module';
import { PaginationModule, ProgressbarModule } from 'ngx-bootstrap';
/*--- Route Guards ---*/
import { AuthGuard } from '@app/shared/_guards';
/*--- Route Guards ---*/
import { ImageCropperModule } from 'ngx-image-cropper';
import { DatePipe } from '@angular/common';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TooltipModule } from 'ngx-bootstrap';
import { Dashboad1Component } from './dashboad1/dashboad1.component';
import { Sidebar1Component } from './sidebar1/sidebar1.component';
import { Header1Component } from './header1/header1.component';
import { TutorFooterComponent } from './tutor-footer/tutor-footer.component';
import { TutorProfileComponent } from './tutor-profile/tutor-profile.component';
import { AccountSettings1Component } from './account-settings1/account-settings1.component';
import { ManageResourceComponent } from './manage-resource/manage-resource.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ResourceFolderComponent } from './resource-folder/resource-folder.component';
import { WorkAndEducationComponent } from './work-and-education/work-and-education.component';
import { ManageTimimgComponent } from './manage-timimg/manage-timimg.component';
import { ExpertiseComponent } from './expertise/expertise.component';
import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';
import { MessageBoardComponent} from './message-board/message-board.component';
import { ViewOfferComponent } from './view-offer/view-offer.component';
import { CalendarComponent } from './calendar/calendar.component';
// import { FullCalendarModule } from "@fullcalendar/angular"; // for FullCalendar!
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { MyEarningsComponent } from './my-earnings/my-earnings.component';
import { ViewAcceptedOfferComponent } from './view-accepted-offer/view-accepted-offer.component';
// import { CountryPickerModule } from 'ngx-country-picker';
import {HttpTokenInterceptorProvider} from '@app/interceptors/token.intercetor';
// import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { IntlInputPhoneModule } from 'intl-input-phone';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { NotificationsComponent } from './notifications/notifications.component';
import {RatingModule} from "ngx-rating";
import { UpcomingComponent } from './upcoming/upcoming.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  declarations: [
    TutorComponent,
    Dashboad1Component,
    Sidebar1Component,
    Header1Component,
    TutorProfileComponent,
    AccountSettings1Component,
    ManageResourceComponent,
    ResourceFolderComponent,
    WorkAndEducationComponent,
    ManageTimimgComponent,
    ExpertiseComponent,
    TutorFooterComponent,
    ManageJobsComponent,
    MessageBoardComponent,
    ViewOfferComponent,
    CalendarComponent,
    MyEarningsComponent,
    ViewAcceptedOfferComponent,
    OfferDetailsComponent,
    NotificationsComponent,
    UpcomingComponent
  ],
  imports: [
    TooltipModule.forRoot(),
    ProgressbarModule.forRoot(),
    CommonModule,
    TutorRoutingModule,
    PerfectScrollbarModule,
    SharedModule,
    ImageCropperModule,
    InfiniteScrollModule,
    NgxDaterangepickerMd.forRoot(),
    PaginationModule.forRoot(),
    Ng2TelInputModule,
    DragDropModule,
    NgxDocViewerModule,
    // FullCalendarModule,
    NgxMaterialTimepickerModule,
    IntlInputPhoneModule,
    RatingModule
    // NgxIntlTelInputModule
  ],
  exports: [
    DragDropModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    AsyncRequestService,
    DatePipe,
    HttpTokenInterceptorProvider
  ],
  // schemas : [
  //   NO_ERRORS_SCHEMA,
  //   CUSTOM_ELEMENTS_SCHEMA
  // ]
})
export class TutorModule {}
