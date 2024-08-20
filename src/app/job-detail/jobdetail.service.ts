import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment';
import { LocalStorageService } from '../shared/_services/index';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobdetailService {
  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
    ) { }

  getJobDetail(slug) {
    return this.http.get(`${this.baseUrl}/jobs/job/${slug}`);
  }

  applyJob(data) {
    return this.http.post(`${this.baseUrl}/tutor/apply-job`, data);
  }
  sendOffer(data) {
    return this.http.post(`${this.baseUrl}/jobs/send-offer`, data);
  }

  appliedJobData(body){
    return this.http.post(`${this.baseUrl}/jobs/applied-detail`,body);
  }

  startSession(session_id){
    return this.http.post(this.baseUrl+'/tutor/createclass ',{session_id}).pipe(map((ele:any) => {
      let token = JSON.parse(this.localStorageService.getJwtToken())
      ele.data.videourl = 'https://api.vitutors.com' + ele.data.videourl + '?token='+token
      return ele
    }))
  }
  
  tutorNotificationCompleted(body){
    return this.http.post(this.baseUrl + '/profile/change-notification-status', body)
  }
  
}
