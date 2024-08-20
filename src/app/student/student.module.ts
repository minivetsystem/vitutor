import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { SharedModule } from '@app/shared/shared.module';
import {StudentService} from './student.service';
import {HttpTokenInterceptorProvider} from '@app/interceptors/token.intercetor';
import {
  PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { StudentHeader1Component } from './student-header/student-header1.component';
import { StudentSidebar1Component } from './student-sidebar/student-sidebar1.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { ManageJobComponent } from './manage-job/manage-job.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { ManageResourceComponent } from './manage-resource/manage-resource.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ResourceFolderComponent } from './resource-folder/resource-folder.component';
import { CreateJobComponent } from './create-job/create-job.component';
import { MessageBoardComponent } from './message-board/message-board.component';
import { EditJobsComponent } from './edit-jobs/edit-jobs.component';

import { CalendarComponent } from './calendar/calendar.component';
// import { FullCalendarModule } from "@fullcalendar/angular"; // for FullCalendar!
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { MytransactionsComponent } from './mytransactions/mytransactions.component';
import {RatingModule} from "ngx-rating";
import { NotificationsComponent } from './notifications/notifications.component';
import { UpcomingComponent } from './upcoming/upcoming.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
@NgModule({
  declarations: [
    StudentComponent,
    StudentHeader1Component,
    StudentSidebar1Component,
    StudentDashboardComponent,
    ManageJobComponent,
    StudentProfileComponent,
    AccountSettingsComponent,
    ManageResourceComponent,
    ResourceFolderComponent,
    CreateJobComponent,
    MessageBoardComponent,
    EditJobsComponent,
    CalendarComponent,
    MytransactionsComponent,
    NotificationsComponent,
    UpcomingComponent
  ],
  imports: [
    StudentRoutingModule,
    NgxDocViewerModule,
    CommonModule,
    PerfectScrollbarModule,
    SharedModule,
    ImageCropperModule,
    Ng2TelInputModule,
    InfiniteScrollModule,
    NgxDaterangepickerMd.forRoot(),
    // FullCalendarModule,
    NgxMaterialTimepickerModule,
    RatingModule,
    AutocompleteLibModule,
  ],
  providers: [
    StudentService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    AsyncRequestService,
    HttpTokenInterceptorProvider
  ],
})
export class StudentModule {}
