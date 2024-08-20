import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SearchComponent} from './search/search.component'
import {SharedModule} from '../shared/shared.module';
import { Routes, RouterModule} from '@angular/router';
import { LoginHeaderComponent } from './login-header/login-header.component';
import { HttpClientModule } from '@angular/common/http'
import { SearchTutorService } from './search-tutor.service';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { Ng5SliderModule } from 'ng5-slider';

const routes: Routes = [
  {path: '', redirectTo: 'search', pathMatch:'full'},
  {path: 'search', component: SearchComponent} 
  ]

@NgModule({
  declarations: [SearchComponent, LoginHeaderComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    Ng5SliderModule,
    AutocompleteLibModule,
  ],
  providers: [
    SearchTutorService
  ]
})
export class SearchTutorModule { }
