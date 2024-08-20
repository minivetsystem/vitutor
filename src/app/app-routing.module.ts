import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnAuthGuard, AuthGuard } from './shared/_guards';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [UnAuthGuard],
    loadChildren: () =>
      import('./auth/auth.module').then((mod) => mod.AuthModule),
  },
  {
    path: 'tutor',
    loadChildren: () =>
      import('./tutor/tutor.module').then((mod) => mod.TutorModule),
  },
  {
    path: 'student',
    loadChildren: () =>
      import('./student/student.module').then((mod) => mod.StudentModule)
  },
  {path: 'search',
  loadChildren: () =>
      import('./search/search.module').then((mod) => mod.SearchModule)
  },
  {path: 'searchJob',
  loadChildren: () =>
      import('./search-jobs/search-jobs.module').then((mod) => mod.SearchJobsModule)
  },
  {path: 'viewOffer',
  loadChildren: () =>
      import('./view-offer/view-offer.module').then((mod) => mod.ViewOfferModule)
  },
  {path: 'viewTutor',
  loadChildren: () =>
      import('./view-tutor/view-tutor.module').then((mod) => mod.ViewTutorModule)
  },
  {path: 'jobDetail',
  loadChildren: () =>
      import('./job-detail/job-detail.module').then((mod) => mod.JobDetailModule)
  },
  {path: 'video',
  loadChildren: () =>
      import('./video-player/video-player.module').then((mod) => mod.VideoPlayerModule)
  },
  {
    path: 'searchTutor',
    loadChildren: () => 
      import('./search-tutor/search-tutor.module').then((mod)=> mod.SearchTutorModule)
  },
  {
    path: 'searchAllJobs',
    loadChildren: () => 
      import('./search-all-jobs/search-all-jobs.module').then((mod)=> mod.SearchAllJobsModule)
  },
  {
    path: 'page-not-found',
    component: PageNotFoundComponent,
        // canActivate: [UnAuthGuard],
  },
  {
    path: '**', redirectTo: ''
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top' 
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
