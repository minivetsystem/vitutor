import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import {Routes, RouterModule} from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { Ng5SliderModule } from 'ng5-slider';
import { ViewTutorComponent } from './view-tutor/view-tutor.component';
import { Header2Component } from './header/header.component';
import { Footer2Component } from './footer/footer.component';
import { SearchTutorComponent } from './search-tutor/search-tutor.component';
import { NgxSocialShareModule } from 'ngx-social-share';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
// import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
// import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import {ShareButtonsModule} from 'ngx-sharebuttons';
import {RatingModule} from "ngx-rating";

const routes: Routes = [{
  path: '', component: SearchComponent, children: [
    // {
    //   path: '', pathMatch: 'full',  redirectTo: 'searchTutor'
    // },
    {
      path: 'viewTutor/:id', component: ViewTutorComponent
    }, {
      path: 'searchTutor', component: SearchTutorComponent
  }]
}, ];
@NgModule({
  declarations: [SearchComponent, ViewTutorComponent, Header2Component, Footer2Component, SearchTutorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    Ng5SliderModule,
    NgxSocialShareModule,
    AutocompleteLibModule,
    ShareButtonsModule.forRoot(),
    RatingModule
  ]
})
export class SearchModule { }
