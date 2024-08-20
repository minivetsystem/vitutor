import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from './player/player.component';
import { VideoService } from './video.service';
import {Routes, RouterModule} from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import {Header2Component} from './header/header.component'
import { HttpClientModule } from '@angular/common/http';
import {DeactivateGuard} from '../video-player/deactivate.guard';
import { HttpTokenInterceptorProvider } from '@app/interceptors/token.intercetor';

const routes: Routes = [
  {path: '', component: PlayerComponent, canDeactivate: [DeactivateGuard]}
]

@NgModule({
  declarations: [PlayerComponent, Header2Component],
  imports: [
    CommonModule,
    RouterModule.forChild(routes), 
    SharedModule,
    HttpClientModule
  ],
  providers: [VideoService, HttpTokenInterceptorProvider]
})


export class VideoPlayerModule { }
