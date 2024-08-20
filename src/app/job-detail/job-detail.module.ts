import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailComponent } from './detail.component';
import { Header2Component } from './header1/header1.component';
import { Sidebar1Component } from './sidebar1/sidebar1.component';
import { Sidebar2Component } from './sidebar2/sidebar2.component';
import { ViewComponent } from './view/view.component';
import { RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';

const routes: Routes = [{path: '', component: DetailComponent, children: [
  {path: 'job/:slug', component: ViewComponent}
]}]



@NgModule({
  declarations: [DetailComponent, Header2Component, Sidebar1Component, ViewComponent, Sidebar2Component],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class JobDetailModule { }
