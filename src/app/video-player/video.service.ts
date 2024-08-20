import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  baseUrl = environment.baseUrl
  constructor(private http: HttpClient) { }

  loadedUrl = [
    "https://www.groupworld.net/js/aes-enc.min.js",
    "https://www.groupworld.net/js/aes-dec.min.js",
    "https://www.groupworld.net/js/aes-test.min.js",
    "https://www.groupworld.net/js/sha1.min.js",
    "https://www.groupworld.net/js/newbase64.min.js",
    "https://www.groupworld.net/js/dialog.min.js",
    "https://www.groupworld.net/js/tunnel.min.js",
    "https://www.groupworld.net/js/gsm610.min.js",
    "https://www.groupworld.net/js/deskshare.min.js",
    "https://www.groupworld.net/js/polls.min.js",
    "https://www.groupworld.net/js/jscolor/jscolor.min.js",
    "https://www.groupworld.net/js/new_conference.min.js",
    "https://www.groupworld.net/js/new_whiteboard.min.js",
    "https://www.groupworld.net/js/new_videostrip.min.js",
    "https://www.groupworld.net/js/chat.min.js",
    "https://www.groupworld.net/js/jspdf.min.js",
    "https://www.groupworld.net/js/jspdf.plugin.addimage.min.js",
    "https://www.groupworld.net/js/FileSaver.min.js"];

    loadDynamicScript(): Promise<any> {
      return new Promise((resolve, reject) => {
        this.loadedUrl.forEach(ele => {
          const scriptElement = window.document.createElement('script');
          scriptElement.src = ele;
    
          scriptElement.onload = () => {
            resolve('Resolved');
          };
    
          scriptElement.onerror = () => {
            reject();
          };
    
          window.document.body.appendChild(scriptElement);
        });
        }
        );
       


}



tutorSessionComplete(body){
  return this.http.post(this.baseUrl+'/jobs/mark-session-completed',body)
}
  
leaveSession(body){
  return this.http.post(this.baseUrl + '/student/leave-session', body)
}

fetchSessionRecord(body){
  return this.http.post(this.baseUrl + '/session/fetch-session-record', body)
}

updateEndTime(body){
   return this.http.post(this.baseUrl+ '/session/update-session-end-time', body);
}
}
