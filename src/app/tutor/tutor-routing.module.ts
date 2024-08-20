import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TutorComponent } from './tutor.component';
import { AuthGuard } from '@app/shared/_guards';
import { Dashboad1Component } from './dashboad1/dashboad1.component';
import { TutorProfileComponent } from './tutor-profile/tutor-profile.component';
import { AccountSettings1Component } from './account-settings1/account-settings1.component';
import { ManageResourceComponent } from './manage-resource/manage-resource.component';
import { ResourceFolderComponent } from './resource-folder/resource-folder.component';
import { WorkAndEducationComponent } from './work-and-education/work-and-education.component';
import { ManageTimimgComponent } from './manage-timimg/manage-timimg.component';
import { ExpertiseComponent } from './expertise/expertise.component';
import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';
import { MessageBoardComponent} from './message-board/message-board.component';
import { ViewOfferComponent } from './view-offer/view-offer.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MyEarningsComponent } from './my-earnings/my-earnings.component';
import { ViewAcceptedOfferComponent } from './view-accepted-offer/view-accepted-offer.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpcomingComponent } from './upcoming/upcoming.component';

const routes: Routes = [
  {
    path: '',
    component: TutorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['tutor'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      { path: 'dashboard', component: Dashboad1Component },
      { path: 'account-setting', component : AccountSettings1Component},
      { path: 'manage-resources', component : ManageResourceComponent},
      { path: 'resource-folder/:id', component : ResourceFolderComponent},
      { path: 'tutor-profile', component : TutorProfileComponent},
      { path: 'work-education', component : WorkAndEducationComponent},
      {path : 'manage-timing', component : ManageTimimgComponent},
      {path : 'expertise', component: ExpertiseComponent},
      {path : 'manage-job', component: ManageJobsComponent},
      { path : 'message-board', component: MessageBoardComponent },
      { path : 'view-offer/:id', component: ViewOfferComponent },
      { path : 'tutor-calendar', component: CalendarComponent },
      { path: 'earning', component: MyEarningsComponent},
      { path: 'view-accepted-offer/:id', component: ViewAcceptedOfferComponent},
      { path: 'offerDetails/:id', component: OfferDetailsComponent },
      { path: 'notification', component: NotificationsComponent },
      { path: 'upcoming', component: UpcomingComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TutorRoutingModule {}
