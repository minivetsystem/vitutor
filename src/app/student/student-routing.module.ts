import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentComponent } from './student.component';
import { AuthGuard } from '@app/shared/_guards';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { ManageJobComponent } from './manage-job/manage-job.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { ManageResourceComponent } from './manage-resource/manage-resource.component';
import { ResourceFolderComponent } from './resource-folder/resource-folder.component';
import { CreateJobComponent } from './create-job/create-job.component';
import { MessageBoardComponent } from './message-board/message-board.component';
import { EditJobsComponent } from './edit-jobs/edit-jobs.component';

import { CalendarComponent } from './calendar/calendar.component';
import { MytransactionsComponent } from './mytransactions/mytransactions.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpcomingComponent } from './upcoming/upcoming.component';

// import { SearchTutorComponent } from './search-tutor/search-tutor.component';

const routes: Routes = [
  {
    path: '',
    component: StudentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['student'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'manage-jobs', component : ManageJobComponent},
      { path: 'create-jobs', component : CreateJobComponent},
      { path: 'edit-job/:slug', component : EditJobsComponent},
      { path: 'student-profile', component : StudentProfileComponent},
      { path: 'account-setting', component : AccountSettingsComponent},
      { path: 'manage-resources', component : ManageResourceComponent},
      { path: 'resource-folder/:id', component : ResourceFolderComponent},
      { path: 'message-board', component : MessageBoardComponent},
      { path: 'student-calendar', component: CalendarComponent },
      { path: 'transactions', component : MytransactionsComponent},
      { path: 'notification', component : NotificationsComponent},
      { path: 'upcoming', component : UpcomingComponent}
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
