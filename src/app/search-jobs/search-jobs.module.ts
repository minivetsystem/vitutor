import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SearchTutorsJobsComponent } from './search-tutors-jobs/search-tutors-jobs.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { SearchComponent } from './search/search.component';
import {Routes, RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { Ng5SliderModule } from 'ng5-slider';

const routes: Routes = [{
  path: '', component: SearchComponent, children: [
    {path : '', pathMatch: 'full', redirectTo: 'search-jobs'},
    {path: 'search-jobs', component: SearchTutorsJobsComponent},
    {path: 'job-details/:slug', component: JobDetailsComponent}
  ]
}];

@NgModule({
  declarations: [HeaderComponent, FooterComponent, SearchTutorsJobsComponent, JobDetailsComponent, SearchComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AutocompleteLibModule,
    Ng5SliderModule
  ]
})
export class SearchJobsModule { }
