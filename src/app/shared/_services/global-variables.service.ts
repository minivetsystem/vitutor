import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage/local-storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariablesService {
  constructor(private localStorageService: LocalStorageService) {}

  private CartCount: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);

  public CartCount$: Observable<any[]> = this.CartCount.asObservable();

  private cartCount = new BehaviorSubject<any[]>(null);
  currentMessage = this.cartCount.asObservable();

  private contactCount = new BehaviorSubject<any>(null);
  totalCount = this.contactCount.asObservable();

  getCartCount(updatedInfo) {
    this.CartCount.next(updatedInfo);
  }

  changeMessage(count: any) {
    this.cartCount.next(count);
  }

  noContact(value) {
    this.contactCount.next(value);
  }
}
