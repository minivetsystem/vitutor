import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AsyncRequestService } from "@app/core/services/async-request.service";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private asyncRequestService: AsyncRequestService) {}
  private UserDetail: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);

  public UserDetail$: Observable<any[]> = this.UserDetail.asObservable();

  private profileBarStatus: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    null
  );

  public profileBarStatus$: Observable<
    any[]
  > = this.profileBarStatus.asObservable();

  private classChangeAdmin: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(
    null
  );

  public classChangeAdmin$: Observable<
    any[]
  > = this.classChangeAdmin.asObservable();

  private userRefId: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public userRefId$: Observable<any> = this.userRefId.asObservable();

  getUserDetail(updatedInfo) {
    this.UserDetail.next(updatedInfo);
  }

  getProfileStatus(update) {
    this.profileBarStatus.next(update);
  }

  changeClassAdmin(update) {
    this.classChangeAdmin.next(update);
  }

  fetchNotifications(notificationURL: string) {
    return this.asyncRequestService.getRequest(notificationURL);
  }

  getRefId(refId) {
    this.userRefId.next(refId);
  }
}
