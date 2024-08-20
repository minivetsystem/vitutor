import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Cacheable, CacheBuster } from "ngx-cacheable";
import { Subject } from 'rxjs';
const cacheBuster$ = new Subject<void>();

@Injectable()
export class AsyncRequestService {
  private base_url = environment.baseUrl;
  /**
   *
   * @param http
   */
  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  /**
   * @purpose get request with query params if present in current request
   * @param url
   * @param param
   */
  // @Cacheable({
  //   maxCacheCount: 20,
  //   maxAge: 90000,
  //   cacheBusterObserver: cacheBuster$,
  // })
  getRequest(url: string, params = {}) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' })
    headers = headers.append('Access-Control-Allow-Origin','*')
    const httpOptions = {
      headers: headers,
      withCredentials: true,
      params
    };
    return this.http.get(`${this.base_url}/` + url, httpOptions);
  }

  /**
   * @purpose post raw data to server
   * @param url
   * @param request_data
   */
  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$,
  // })
  postRequest(url: string, request_data: any) {
    return this.http.post(
      `${this.base_url}/` + url,
      request_data,
      // this.httpOptions
    );
  }

  getJWTToken(){
   return JSON.parse(localStorage.getItem('token'))
  }

  postRequestWithToken(url: string, request_data: any) {
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    headers = headers.append('Authorization' , 'Bearer ' + this.getJWTToken())
    const httpOptions = {
      headers: headers,
      withCredentials: true
    };
    return this.http.post(
      `${this.base_url}/` + url,
      request_data,
      this.httpOptions
    );
  }

  /**
   * @purpose send delete request to server
   * @param url
   */
  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$,
  // })
  deleteRequest(url: string) {
    return this.http.delete(`${this.base_url}/` + url);
  }

  /**
   * @purpose to send form data along with attachment to server
   * @param url
   * @param formData
   */
  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$,
  // })
  uploadFiles(url: string, formData: any) {
    return this.http.post(`${this.base_url}/` + url, formData);
  }

  checkProfileStatus() {
    return this.http.get(`${this.base_url}/profile/check-profile-status`);
  }
}
