import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { LocalStorageService,WebsocketService } from '../shared/_services/index';
import { catchError, map } from 'rxjs/operators';
import { identity } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private base_url = environment.baseUrl;


  constructor(private http: HttpClient, private localStorageService: LocalStorageService,private websocketService:WebsocketService) { }

  getRequest(url: string, params) {
    const token = this.localStorageService.getJwtToken();
    if(params.hourly_range_to >= 600){
      params.hourly_range_to = 1200
    }
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true,
      Authorization : 'Bearer ' + token,
      params
    };
    return this.http.get(`${this.base_url}/` + url, httpOptions);
  }

  getTutorProfile(slug) {
    return this.http.get(this.base_url + '/tutor/info/' + slug);
  }
  sendInvite(body) {
    return this.http.post(this.base_url + '/student/send-invite', body);
  }

  favTutor(slug, body) {
    return this.http.post(this.base_url + '/student/tutor-favourite/' + slug, body);
  }

  fetchLanguages() {
    return this.http.get(this.base_url + '/languages');
  }
  // fetchJobList() {
  //   return this.http.get(`${this.base_url}/student/job-lists`);
  // }
  fetchJobList(body) {
    return this.http.post(`${this.base_url}/student/invite-job-list`, body);
  }

  fetchCategories() {
    return this.http.get(`${this.base_url}/categories`);
  }
  getContouries() {
    return this.http.get(`${this.base_url}/countries`)
    .pipe(map((res:any) => {
      let index; 
       let usObject: any  = res.find((ele: any,i) => {
         if(ele.sortname == 'US'){
           index = i
          return ele
       }})
         let newArray = [usObject, ...res.slice(0, index), ...res.slice(index+1) ]
         return newArray
    }));
  }

  saveTutorReviews(body){
    return this.http.post(`${this.base_url}/tutor/save-review`, body);
  }

  fetchReview(slug, page){
    if(page){
      return this.http.get(this.base_url + '/tutor/ratings-reviews/'+slug,   {params : { page}}  );
    } else {
      return this.http.get(this.base_url + '/tutor/ratings-reviews/'+slug );
    }
    
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

  studentNotificationCompleted(body){
    return this.http.post(this.base_url + '/profile/change-notification-status', body)
  }
}
