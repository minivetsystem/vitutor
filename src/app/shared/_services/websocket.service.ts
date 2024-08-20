import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  socket: any;
  readonly url: string = environment.socketUrl;
  constructor() {
    this.socket = io(this.url);
  }

  listen(eventName: string) {
    
    return Observable.create((subscriber) => {

      this.socket.on(eventName, (data:any) => {
 
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  closeListener(eventName) {
    this.socket.removeAllListeners(eventName);
  }
}
