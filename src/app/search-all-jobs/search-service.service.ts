import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class SearchServiceService {
  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }


  tutorJobs(params){
    if(params.hourly_range_to >= 600){
      params.hourly_range_to = 1200
    }
    return this.http.get((this.baseUrl.replace('/api/v1','')) + '/search-job', {params})
  }

  fetchCategories() {
    return this.http.get(`${this.baseUrl}/categories`);
  }
}
