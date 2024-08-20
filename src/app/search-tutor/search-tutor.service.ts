import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchTutorService {
  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  tutorSearch(params){
    return this.http.get((this.baseUrl.replace('/api/v1','')) + '/search-tutor', {params})
  }

  getContouries() {
    return this.http.get(`${this.baseUrl}/countries`)
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

  

  fetchLanguages() {
    return this.http.get(this.baseUrl + '/languages');
  }

  fetchCategories() {
    return this.http.get(`${this.baseUrl}/categories`);
  }
}
