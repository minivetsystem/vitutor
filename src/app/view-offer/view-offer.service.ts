import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LocalStorageService } from '../shared/_services/index';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ViewOfferService {
  private base_url = environment.baseUrl;
  constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

  getOfferDetails(id) {
    return this.http.get(this.base_url + '/jobs/offer-detail/'+id);
  }

  changeOffer(body) {
    return this.http.post(`${this.base_url}/jobs/change-offer-status`, body);
  }

  updateOffer(param) {
    return this.http.post(`${this.base_url}/jobs/offer-update`, param);
  }

  joinSession(session_id){
    return this.http.post(this.base_url+'/student/joinclass', {session_id}).pipe(map((ele:any) => {
      if(ele.success == true && ele.data.videourl){
        let token = JSON.parse(this.localStorageService.getJwtToken())
        ele.data.videourl = 'https://api.vitutors.com' + ele.data.videourl + '?token='+token
      }
     
      return ele
    }, catchError(err =>  err)))
  }

  checkoutPayment(sessionId){
    return this.http.post(this.base_url + '/student/checkout/' +sessionId, {});
  }

  updateSessionTime(body){
    return this.http.post(this.base_url + '/session/edit-session', body);
  }

  studentNotificationCompleted(body){
    return this.http.post(this.base_url + '/profile/change-notification-status', body)
  }
  fetchAvailabilityDates(body){
    return this.http.post(this.base_url + '/tutor/availability/check-bookedslot-availability', body)
  }
  checkSlotAvailability(body){
    return this.http.post(this.base_url + '/tutor/availability/get-available-slot', body)
    
  }
  checkSelectedSlotAvailability(body){
    return this.http.post(this.base_url + '/tutor/availability/check-available-slot' , body)
  }

}
