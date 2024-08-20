import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../layouts/common/header/header.component';
import { FooterComponent } from '../layouts/common/footer/footer.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { CookieService } from 'ngx-cookie-service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReviewRatingViewComponent } from './_components/review-rating-view/review-rating-view.component';
// import { FullCalendarModule } from '@fullcalendar/angular'; // for FullCalendar!
import { ModalModule } from 'ngx-bootstrap';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipPipe } from '../utils/tooltip.pipe';
import { UserListPipe } from './pipeFunctions/filterListPipe';
import { TruncatePipe } from './pipeFunctions/truncatePipe';
import { OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
// import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time.module';


import {
  LocalStorageService,
  ToggleClassService,
  AlertService,
  GlobalVariablesService,
} from './_services/index';
// import { TutorDetailComponent } from './_components/tutor-detail/tutor-detail.component';
import {
  BsDropdownModule,
  BsDatepickerModule,
  TimepickerModule,
  CollapseModule,
} from 'ngx-bootstrap';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { NgSelectModule } from '@ng-select/ng-select';
// import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
// import { PopoverModule } from 'ngx-bootstrap';
// import { ReviewRatingViewComponent } from './_components/review-rating-view/review-rating-view.component';
// import { RatingModule } from 'ngx-bootstrap';
// import { ReviewWidgetComponent } from './_components/review-widget/review-widget.component';
// import { PageNotFoundComponent } from '@app/error-pages/page-not-found/page-not-found.component';
// import { cardPipe } from './_services/filters/pipe';
// import { InvalidUrlComponent } from '@app/error-pages/invalid-url/invalid-url.component';
// import { BookingCalenderComponent } from './_components/booking-calender/booking-calender.component';
// import { BookingPopoverComponent } from './_components/booking-popover/booking-popover.component';
// import { CheckoutComponent } from './_components/checkout/checkout.component';
// import { CartItemsComponent } from './_components/cart-items/cart-items.component';

// import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
// import { NgSelectModule } from "@ng-select/ng-select";
// import { SearchBoxComponent } from "./_components/search-box/search-box.component";
// import { TypeaheadModule } from "ngx-bootstrap/typeahead";
// import { NotificationsComponent } from "./_components/notifications/notifications.component";
// import { CreditCardDirectivesModule } from "angular-cc-library";
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgSelectModule } from '@ng-select/ng-select';
// import { SearchBoxComponent } from './_components/search-box/search-box.component';
// import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
// import { NotificationsComponent } from './_components/notifications/notifications.component';
// import { CreditCardDirectivesModule } from 'angular-cc-library';

// import { StudentSidebarComponent } from '@app/student/student-sidebar/student-sidebar.component';
// import {
//   PerfectScrollbarConfigInterface,
//   PERFECT_SCROLLBAR_CONFIG,
//   PerfectScrollbarModule,
// } from 'ngx-perfect-scrollbar';
// import { StudentHeaderComponent } from '@app/student/student-header/student-header.component';
// import { TutorHeaderComponent } from '@app/tutor/tutor-header/tutor-header.component';
// import { SidebarComponent } from '@app/tutor/sidebar/sidebar.component';
// import { StudentFooterComponent } from '@app/student/student-footer/student-footer.component';
// import { TutorFooterComponent } from '@app/tutor/tutor-footer/tutor-footer.component';
// import { NgxScrollToFirstInvalidModule } from '@ismaestro/ngx-scroll-to-first-invalid';
// const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
//   suppressScrollX: true,
// };
// import { NgCircleProgressModule } from 'ng-circle-progress';
// import { BookingSlotModalComponent } from './_components/booking-slot-modal/booking-slot-modal.component';
// import { One2onesessionComponent } from './_components/one2onesession/one2onesession.component';
// import { OneOneSessionDisputeComponent } from './_components/one-one-session-dispute/one-one-session-dispute.component';
// import { PaymentDetailsModelComponent } from './_components/payment-details-model/payment-details-model.component';
import { TransactionsDetailModalComponent } from './_components/transactions-detail-modal/transactions-detail-modal.component';
// import { EditorConfigurationService } from '@app/shared/_helpers/editor-configuration.service';
// import { TooltipModule } from 'ngx-bootstrap/tooltip';
// import { VideoPlayerComponent } from './_components/video-player/video-player.component';
// import { Ng2TelInputModule } from 'ng2-tel-input';
// import { ChartsModule } from 'ng2-charts';
// import { ModalModule } from 'ngx-bootstrap';
// import { AngularFontAwesomeModule } from 'angular-font-awesome';
// import { SeoService } from './_services/seo.service';
// import { AlertModule } from 'ngx-bootstrap/alert';
// import {
//   DateConverter,
//   TimeConverter,
//   DateConverterTimeAmPmFormat,
//   DateConverterTimeMMMDDYYYYFormat,
//   DateConverterTime,
// } from '@app/utils/dateconverter.pipe';

// import { NgxEditorModule } from 'ngx-editor';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ProfileCompletionNoteComponent } from './profile-completion-note/profile-completion-note.component';
// import { PublisherComponent } from './_components/publisher/publisher.component';
// import { SubscriberComponent } from './_components/subscriber/subscriber.component';
// import { StudentProfileComponent } from './_components/student-profile/student-profile.component';
// import { NotificationDetailComponent } from './_components/notification-detail/notification-detail.component';
// import { MathJaxPipe } from '@app/utils/mathjax.pipe';
// import { ScrollToTargetService } from './_helpers';
// import { AgmCoreModule } from '@agm/core';
import { ModelContentComponent } from './_components/model-content/model-content.component';
// import { DatetimePopupModule  } from 'ngx-bootstrap-datetime-popup';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Ng2TelInputModule} from 'ng2-tel-input';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ProfileCompleteComponent } from './_components/profile-complete/profile-complete.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { DashboardChartComponent } from './_components/dashboard-chart/dashboard-chart.component';
import { ShortFooterComponent } from './_components/short-footer/short-footer.component';
import { LongFooterComponent } from './_components/long-footer/long-footer.component';
import { StripDetailComponent } from './_components/strip-detail/strip-detail.component';
import { AvailibilityModalComponent } from './_components/availibility-modal/availibility-modal.component';
import { FullCalendarModule } from "@fullcalendar/angular";
// import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';


@NgModule({
  declarations: [
    // MathJaxPipe,
    HeaderComponent,
    FooterComponent,
    // StudentSidebarComponent,
    // TutorHeaderComponent,
    // SidebarComponent,
    // StudentFooterComponent,
    // TutorFooterComponent,
    // StudentHeaderComponent,
    ReviewRatingViewComponent,
    // TutorDetailComponent,
    // ReviewWidgetComponent,
    // PageNotFoundComponent,
    // InvalidUrlComponent,
    // BookingCalenderComponent,
    // BookingPopoverComponent,
    // CheckoutComponent,
    // CartItemsComponent,
    // SearchBoxComponent,
    // NotificationsComponent,
    // BookingSlotModalComponent,
    // One2onesessionComponent,
    // OneOneSessionDisputeComponent,
    // PaymentDetailsModelComponent,
    // TransactionsDetailModalComponent,
    // VideoPlayerComponent,
    TooltipPipe,
    // DateConverter,
    // TimeConverter,
    // DateConverterTimeAmPmFormat,
    // DateConverterTimeMMMDDYYYYFormat,
    // DateConverterTime,
    // ProfileCompletionNoteComponent,
    // PublisherComponent,
    // SubscriberComponent,
    // StudentProfileComponent,
    // NotificationDetailComponent,
    ModelContentComponent,
    UserListPipe,
    TruncatePipe,
    ProfileCompleteComponent,
    TransactionsDetailModalComponent,
    DashboardChartComponent,
    ShortFooterComponent,
    LongFooterComponent,
    StripDetailComponent,
    AvailibilityModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    ReactiveFormsModule,
    PasswordStrengthMeterModule,
    FormsModule,
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      customClass: 'modal-content',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn',
    }),
    // PopoverModule.forRoot(),
    NgSelectModule,
    // PerfectScrollbarModule,
    // RatingModule.forRoot(),
    // ScrollToModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgxMaterialTimepickerModule,
    BsDropdownModule.forRoot(),
    TimepickerModule.forRoot(),
    // DatetimePopupModule,
    // CollapseModule.forRoot(),
    // TypeaheadModule.forRoot(),
    // NgbModule,
    // NgCircleProgressModule.forRoot(),
    // CreditCardDirectivesModule,
    FullCalendarModule,
    // NgxScrollToFirstInvalidModule,
    // TooltipModule.forRoot(),
    Ng2TelInputModule,
    // ChartsModule,
    // NgxEditorModule,
    // AgmCoreModule,
    // AngularFontAwesomeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
    DragDropModule,
    // NoopAnimationsModule
    NgxPaginationModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ReactiveFormsModule,
    PasswordStrengthMeterModule,
    ModalModule,
    AlertModule,
    FormsModule,
    TooltipPipe,
     SweetAlert2Module,
    BsDropdownModule,
    BsDatepickerModule,
    TimepickerModule,
    DragDropModule,
    // NgxMaterialTimepickerModule,
    // DatetimePopupModule ,
    // StudentHeaderComponent,
    // TutorHeaderComponent,
    // SidebarComponent,
    // NgCircleProgressModule,
    ReviewRatingViewComponent,
    // TutorDetailComponent,
    // PerfectScrollbarModule,
    // StudentFooterComponent,
    // TutorFooterComponent,
    // ReviewWidgetComponent,
    // PageNotFoundComponent,
    // InvalidUrlComponent,
    // BookingCalenderComponent,
    // ScrollToModule,
    // NgbModule,
    // CheckoutComponent,
    // CartItemsComponent,
    // SearchBoxComponent,
    // TypeaheadModule,
    // CreditCardDirectivesModule,
    // NgxScrollToFirstInvalidModule,
    // One2onesessionComponent,
    // OneOneSessionDisputeComponent,
    Ng2TelInputModule,
     NgSelectModule,
    // ChartsModule,
    // ModalModule,
    // TooltipModule,
    // AngularFontAwesomeModule,
    // RatingModule,
    // CollapseModule,
    // NgxEditorModule,
    // MathJaxPipe,
    // DateConverter,
    // TimeConverter,
    // DateConverterTimeAmPmFormat,
    // DateConverterTimeMMMDDYYYYFormat,
    // DateConverterTime,
    // ProfileCompletionNoteComponent,
    // PublisherComponent,
    // SubscriberComponent,
    // NotificationDetailComponent,
    // AgmCoreModule,
    ModelContentComponent,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    UserListPipe,
    TruncatePipe,
    ProfileCompleteComponent,
    NgxPaginationModule,
    DashboardChartComponent,
    ShortFooterComponent,
    LongFooterComponent,
    StripDetailComponent,
    FullCalendarModule
  ],
  providers: [
    // {
    //   provide: PERFECT_SCROLLBAR_CONFIG,
    //   useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    // },
    // LocalStorageService,
    AlertService,
    ToggleClassService,
    GlobalVariablesService,
    ModalModule,
    TooltipPipe,
    // LocalStorageService,
    // ToggleClassService,
    // GlobalVariablesService,
    // ScrollToTargetService,
    // PdfDownloaderService,
    //  NgSelectModule,
    // EditorConfigurationService,
    // ChartsModule,
    // SeoService,
    // CookieService,
    CookieService,
  ],
  entryComponents: [
    // BookingPopoverComponent,
    // BookingSlotModalComponent,
    // PaymentDetailsModelComponent,
    // TransactionsDetailModalComponent,
    // VideoPlayerComponent,
    ModelContentComponent,
    StripDetailComponent,
    AvailibilityModalComponent
  ],
})
export class SharedModule {}
