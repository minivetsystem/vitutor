import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { LoginHeaderComponent } from './login-header/login-header.component';
import {RouterModule, Routes} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {SharedModule} from '../shared/shared.module';
import { Ng5SliderModule } from 'ng5-slider';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { SearchServiceService } from './search-service.service';

const routes: Routes = [ {path: 'search', component: SearchComponent}, { path : '', redirectTo : 'search', pathMatch: 'full'} ]


@NgModule({
  declarations: [SearchComponent, LoginHeaderComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    SharedModule,
    Ng5SliderModule,
    AutocompleteLibModule
  ], 
  providers: [SearchServiceService]
})
export class SearchAllJobsModule { }
