import { Injectable } from '@angular/core';
import {environment } from '../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { LocalStorageService,WebsocketService } from '@app/shared/_services';
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient, private localStorageservice: LocalStorageService,private websocketService:WebsocketService) { }

  getStudentProfile() {
    return this.http.get(this.baseUrl + '/profile/get-basic-information');
  }

  updateProfile(body) {
    return this.http.post(this.baseUrl + '/profile/update', body);
  }

  uploadImage(formdata) {
    return this.http.post(this.baseUrl + '/profile/update-profile-image', formdata);
  }

  addCardDetails(data) {
    return this.http.post(this.baseUrl + '/student/card/save', data);
  }

  fetchAllCard() {
    return this.http.get(this.baseUrl + '/student/card/fetch-all');
  }

  updatePassword(data) {
    return this.http.post(this.baseUrl + '/profile/change-password', data);
  }

  deleteCard(id) {
    return this.http.delete(this.baseUrl + '/student/card/delete/' + id);
  }

  editCard(body){
    return this.http.post(this.baseUrl +'/student/card/edit-card', body)
  }
  madeCardDefault(id) {
    return  this.http.post(`${this.baseUrl}/student/card/make-primary/${id}`, {id, is_primary: 1});
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
  getStates(country_id) {
    return this.http.get(`${this.baseUrl}/states/${country_id}`);
  }
  getCities(stateID) {
    return this.http.get(`${this.baseUrl}/cities/${stateID}`);
  }

  createJob(data) {
    return this.http.post(this.baseUrl + '/jobs/create', data);
  }
  fetchSubjects() {
    return this.http.get(this.baseUrl + '/course-category/categories');
  }

  fetchSubSubjects(id) {
    return this.http.get(`${this.baseUrl}/course-category/sub-categories/${id}`);
  }

  manageJobs(body) {
    return this.http.post(this.baseUrl + '/jobs/student-manage-jobs', body);
  }

  deleteJob(id) {
    return this.http.delete(this.baseUrl + `/jobs/job-delete/${id}`);
  }

  getJobDetail(slug) {
    return this.http.get(`${this.baseUrl}/jobs/job/${slug}`);
  }

  updateJob(body) {
    return this.http.post(`${this.baseUrl}/jobs/update`, body);
  }

  sendOffer(param) {
    return this.http.post(`${this.baseUrl}/jobs/send-offer`, param)
  }
  changeOffer(body) {
    return this.http.post(`${this.baseUrl}/jobs/change-offer-status`, body);
  }
  applicationReceived(body) {
    return this.http.post(`${this.baseUrl}/jobs/application-received-list`, body);
  }
  invitationReceived(body) {
    return this.http.post(`${this.baseUrl}/jobs/invitation-received-list`, body);
  }

  getScheduledEvents() {
    return this.http.get(this.baseUrl + '/student/fetch-calendar');
  }

  addPaypalToken(body) {
    return this.http.post(this.baseUrl + '/tutor/save-paypal-code', body);
  }
  removeAttachment(id){
    return this.http.get(this.baseUrl + "/jobs/remove-attachment/" +id);
  }
  changeTutorOffer(data){
    return this.http.post(this.baseUrl + "/jobs/change-tutor-offer-status",data);
  }

  tutorEditOfferDetail(id){
    return this.http.get(this.baseUrl + "/jobs/tutor-edit-offer-detail/"+id);
  }

  downloadAttachment(id){
    const headers = new HttpHeaders();
    return this.http.get(this.baseUrl + "/attachment/job-attachments/" +id,  {
      headers,
      responseType: 'blob' as 'json'
    });
  }

  

  getTransactions(queryparams){
    let params = Object.assign({}, queryparams);
    return this.http.get(this.baseUrl + '/student/transactions', {params});
  }


  savePaypalEmail(body){
    return this.http.post(this.baseUrl + "/profile/save-paypal-email",body);
  }
  checkoutPayment(sessionId){
    return this.http.post(this.baseUrl + '/student/checkout/' +sessionId, {});
  }

  joinSession(session_id){
    return this.http.post(this.baseUrl+'/student/joinclass', {session_id}).pipe(map((ele:any) => {
      if(ele.success == true && ele.data.videourl){
        let token = JSON.parse(this.localStorageservice.getJwtToken())
        ele.data.videourl = 'https://api.vitutors.com' + ele.data.videourl + '?token='+token
      }
     
      return ele
    }, catchError(err =>  err)))
  }

  cancelSession(data){
    return this.http.post(this.baseUrl + '/student/session-cancel',data);
  }

  ratngAndReview(data){
    return this.http.post(this.baseUrl+'/session/save-review', data)
  }

  raiseDispute(body : FormData){
    return this.http.post(this.baseUrl + '/student/raise-dispute', body);
  }

  studentDashboard(){
    return this.http.get(this.baseUrl +'/student/dashboard/overall-statistics');
  }
  
  studentJobPsotedDashboard(year){
    return this.http.get(this.baseUrl +`/student/dashboard/monthly-spending?year=${year}`);
  }

  studentNotifications(params){
    return this.http.get(this.baseUrl + '/profile/get-all-notification',{params});
  }

  studentNotificationCompleted(body){
    return this.http.post(this.baseUrl + '/profile/change-notification-status', body)
  }

  saveTimeZone(data){
    return this.http.post(this.baseUrl + '/student/update-availability', data);
  }
  
  fetchCategories() {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  fetchAvailabilityDates(body){
    return this.http.post(this.baseUrl + '/tutor/availability/check-bookedslot-availability', body)
  }

}
