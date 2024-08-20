import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpBackend
} from '@angular/common/http';
import { ApplicationHttpClient } from '../../utils/http.client';
import { NgxSpinnerService } from 'ngx-spinner';
import {LocalStorageService} from './local-storage/local-storage.service'


@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private base_url = environment.baseUrl;

  constructor(
    private http: HttpClient,
    handler: HttpBackend,
    private loaderService: NgxSpinnerService,
    private localStorageService: LocalStorageService
  ) {
    this.http = new HttpClient(handler);
  }

  downloadFile(url, filename: string = null) {
    this.loaderService.show();
    const headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Credentials', 'true');
    this.http
      .get(`${this.base_url}/` + url, {
        headers,
        responseType: 'blob' as 'json'
      })
      .subscribe(
        (response: any) => {

          const dataType = response.type;
          const binaryData = [];
          binaryData.push(response);
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(
            new Blob(binaryData, { type: dataType })
          );
          if (filename) { downloadLink.setAttribute('download', filename); }
          document.body.appendChild(downloadLink);
          downloadLink.click();
          this.loaderService.hide();
        },
        error => {
          this.loaderService.hide();
        }
      );
  }

  downloadPDFFile(url, filename: string = null) {
    this.loaderService.show();
    
    let token = JSON.parse(this.localStorageService.getJwtToken())
    // const params = new HttpParams().set('token', token)
     let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    headers = headers.append('Accept', 'application/pdf');
    headers = headers.append('Access-Control-Allow-Credentials', 'true')
    // headers.append('Access-Control-Allow-Credentials', 'true');
    // headers.set('Authorization', `Bearer ${token}`)
    this.http
      .get(`${this.base_url}/` + url, {
        // .get( url, {
        headers,
        responseType: 'blob' ,
        // params
      })
      .subscribe(
        (response: any) => {

          const dataType = response.type;
          const binaryData = [];
          binaryData.push(response);
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(
            new Blob(binaryData, { type: dataType })
          );
          if (filename) { downloadLink.setAttribute('download', filename); }
          document.body.appendChild(downloadLink);
          downloadLink.click();
          this.loaderService.hide();
        },
        error => {
          this.loaderService.hide();
          
        }
      );
  }


}
