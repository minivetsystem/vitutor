import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { LocalStorageService } from '../shared/_services/index';

@Injectable({
  providedIn: 'root'
})
export class ViewTutorService {
  private base_url = environment.baseUrl;
  constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

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
  fetchJobList(body) {
    return this.http.post(`${this.base_url}/student/invite-job-list`, body);
  }
}
