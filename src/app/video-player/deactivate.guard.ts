import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import {PlayerComponent } from '../video-player/player/player.component'


@Injectable({
  providedIn: 'root'
})
export class DeactivateGuard implements CanDeactivate<PlayerComponent> {
 
  canDeactivate( component:PlayerComponent,
     next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return component.canLeave() || false;
  }
  
}

