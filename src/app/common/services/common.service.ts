import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {LocalStorageService, WebsocketService} from '../../shared/_services/index';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  sendInvite: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  public menuToggle : BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public userData: BehaviorSubject<any> = new BehaviorSubject<any>(null)
  constructor(private websocketService:WebsocketService, private localStorageService: LocalStorageService) {
    this.userData.next(localStorageService.getUserData());
    sessionStorage.getItem('sessionToken') ? this.sessionToken.next(JSON.parse(sessionStorage.getItem('sessionToken'))) : null;
   }

   private accountDetail: BehaviorSubject<any> = new BehaviorSubject<any>(null)

  menuToggled(value: number){
    this.menuToggle.next(value);
  }

  public sessionToken: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  setSessionToken(token){
    if(token) {
      sessionStorage.setItem('sessionToken', JSON.stringify(token))
    }else {
      sessionStorage.removeItem('sessionToken')
    }
    this.sessionToken.next(token)
  }
  timerStart(timerStart){
    let currentTime = moment().format('hh:mm a');
    let expected = moment(timerStart).format('hh:mm a');
    let min = moment(timerStart).diff(moment(),'minutes');
    let sec = moment(timerStart).diff(moment(),'seconds');
    let remainingSec = sec-(min*60);
    if(min <= 0 && sec <= 0 || min > 15){
      return false
    }else{
      return  'Time left: ' + min + "m " + remainingSec + "s "
    }
    
  }



  sendNotification(body: {'receiver_id' , 'reference_id' , 'notification'  , 'notification_message', 'type' }){
    this.websocketService.emit('send_notification', body);
  }

  sendRefresh(user_id){
    this.websocketService.emit(`refresh_page`, {user:user_id, message:'type_refresh'});
  }

  listenRefresh(student_id){
   return this.websocketService.listen(`refresh_user_${student_id}`)
  }

  closeRefresh(user_id){
    this.websocketService.closeListener(`refresh_user_${user_id}`)
  }

  getAccountDetail(){
    return this.accountDetail.asObservable()
  }

  setAccountDetail(data){
    this.accountDetail.next(data);
  }
}
