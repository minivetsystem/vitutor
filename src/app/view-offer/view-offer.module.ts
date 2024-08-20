import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewOfferComponent } from './view-offer/view-offer.component';
import { HeaderComponent } from './header/header.component';
import { MainPageComponent } from './main-page/main-page.component';
import {Routes, RouterModule} from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoinHeaderComponent } from './loin-header/loin-header.component';
import { SharedModule } from '../shared/shared.module';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

const routes: Routes = [{
  path: '', component: ViewOfferComponent, children: [
    {
      path: 'view/:id', component: MainPageComponent
    }]
}, ];


@NgModule({
  declarations: [ViewOfferComponent, HeaderComponent, MainPageComponent, FooterComponent, SidebarComponent, LoinHeaderComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxMaterialTimepickerModule
  ]
})
export class ViewOfferModule { }
