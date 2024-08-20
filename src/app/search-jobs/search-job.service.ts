import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment';
import {LocalStorageService} from '../shared/_services/index';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchJobService {
  baseUrl = environment.baseUrl;
  constructor(
    private http: HttpClient,
    private localStorageservice: LocalStorageService
    ) { }

  fetchTutorsJobs(params) {
    if(params.hourly_range_to >= 600){
      params.hourly_range_to = 1200
    }
    return this.http.get(`${this.baseUrl}/search-jobs`, {params});
  }

  getJobDetail(slug) {
    return this.http.get(`${this.baseUrl}/jobs/job/${slug}`);
  }

  applyJob(data) {
    return this.http.post(`${this.baseUrl}/tutor/apply-job`, data);
  }

  sendOffer(data) {
    return this.http.post(`${this.baseUrl}/jobs/send-offer`, data);
  }

  // fetchCategories() {
  //   return this.http.get(`${this.baseUrl}/course-category/categories`);
  // }


  fetchCategories() {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  autocomplete() {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  appliedJobData(body){
    return this.http.post(`${this.baseUrl}/jobs/applied-detail`,body);
  }

  startSession(session_id){
    return this.http.post(this.baseUrl+'/tutor/createclass',{session_id}).pipe(map((ele:any) => {
      let token = JSON.parse(this.localStorageservice.getJwtToken())
      ele.data.videourl = 'https://api.vitutors.com' + ele.data.videourl + '?token='+token
      return ele
    }))
  }

  tutorNotificationCompleted(body){
    return this.http.post(this.baseUrl + '/profile/change-notification-status', body)
  }
  

  
}
