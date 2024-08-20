import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorprofileComponent } from './tutorprofile.component';
import {RouterModule, Routes} from '@angular/router';
import {HeaderComponent} from './header/header.component';
import {ProfileComponent} from './profile/profile.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {HttpTokenInterceptorProvider} from '@app/interceptors/token.intercetor';
import {SharedModule} from '../shared/shared.module';
import { NgxSocialShareModule } from 'ngx-social-share';

const routes: Routes = [{path:'', component: TutorprofileComponent, children: [
  {path: 'tutorProfile/:slug', component: ProfileComponent}
]}]

@NgModule({
  declarations: [TutorprofileComponent,HeaderComponent, ProfileComponent, SidebarComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    NgxSocialShareModule
  ],
  entryComponents: [
    TutorprofileComponent
  ],
  providers: [
    HttpTokenInterceptorProvider
  ]
})


export class ViewTutorModule { }
