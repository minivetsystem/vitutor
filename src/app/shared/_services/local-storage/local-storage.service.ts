import { Injectable } from '@angular/core';
import _ from 'lodash';
import * as moment from 'moment-timezone'
import { BehaviorSubject } from 'rxjs';
import {AsyncRequestService } from '../../../core/services/async-request.service';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  public timeZone = new BehaviorSubject<any>(null);
  constructor(private async: AsyncRequestService) {
    let timezone = this.getTimeZone()
    this.timeZone.next(timezone);
    moment.tz.setDefault(timezone)
  }

  private updateHeader = new BehaviorSubject('');
  currentData = this.updateHeader.asObservable();
  currentTimeZone;

  saveData(data) {
    this.updateHeader.next(data);
  }
  
  /**
   * To set local storage value
   * @param key - a key to which value will be stored.
   * @param value - a value to stored
   */

  set(key: any, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * To get localstorage value
   * @param key - key to be retrived.
   */
  get(key: any): any {
    return localStorage.getItem(key);
  }

  /**
   * To remove a particaular key from localstorage
   * @param key - key to remove
   */
  remove(key: string) {
    return localStorage.removeItem(key);
  }

  /**
   * To remove all localstorage values
   */
  removeAll() {
    localStorage.clear();
  }

  /**
   * Get jwt token
   */

  getJwtToken() {
    return localStorage.getItem('token');
  }

  /**
   * Get Current role of the user
   */

  getRole() {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).role;
    }

    return null;
  }

  /**
   * Get Reference Id for sockets
   */
  getRefId() {
    return localStorage.getItem('ref_id');
  }

  /**
   * Check user
   */
  checkUser() {
    const user = localStorage.getItem('user');
    if (user) {
      // this.async.getRequest(`profile/get-basic-information`).subscribe(res => {
      //   return true;
      // }, err => {
      //   return false;
      // });
      return true;
    }
    return false;
    
  }

  clearUserData() {
    let removableData = ['user','token', 'debug', 'ref_id','loginUser', 'emailToVerify','uid','time-zone','filter','verification_id','timezone']
    for(const ele of removableData){
      if(this.get(ele)){
        this.remove(ele);
      }
      this.timeZone.next(null)
      
    }
    // this.removeAll();
    // this.remove('user');
    // this.remove('token');
    // this.remove('cart_items');
    // this.remove('profile_status_bar_close');
    // this.remove('notification');
    // this.remove('notificationClose');
  }

  /**
   * @purpose to remove slots which has no selected subject id
   * @method removeItemsNotHasSubject
   * @memberof TutorDetailComponent
   */
  removeItemsNotHasSubject() {
    const slots = this.get('cart_items');
    if (slots) {
      const cart_slots = JSON.parse(JSON.parse(slots));
      const validSlots = _.filter(cart_slots.slots, function(o: any) {
        return o.idOfSub;
      });
      cart_slots.slots = validSlots;
      this.set('cart_items', JSON.stringify(cart_slots));
    }
  }

  getUserData() {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }

    return null;
  }

  fetchStudentClassLevel() {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).class_level;
    }
    return null;

  }

 

  setTimeZone(timezone){
    this.timeZone.next(timezone)
    localStorage.setItem('time-zone', JSON.stringify(timezone));
    
    moment.tz.setDefault(timezone)
    
  }

  getTimeZone(){
     if (localStorage.getItem('time-zone')){
      this.currentTimeZone = JSON.parse(localStorage.getItem('time-zone'))
      return this.currentTimeZone
    }
  
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  
}
