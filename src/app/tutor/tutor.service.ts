import { Injectable } from '@angular/core';
import {environment } from '../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { LocalStorageService,WebsocketService } from '@app/shared/_services';

@Injectable({
  providedIn: 'root'
})
export class TutorService {

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

  getCountries() {
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

  sendTiming(data) {
    return this.http.post(`${this.baseUrl}/cities/`, data);
  }

  fetchSubjects() {
    return this.http.get(`${this.baseUrl}/course-category/fetch-all`);
  }
  fetchTutorSelectedSubjects() {
    return this.http.get(`${this.baseUrl}/profile/fetch-subjects`);
  }
  saveTutorSubjects(data) {
    return this.http.post(`${this.baseUrl}/profile/save-course-categories`, data);
  }
  deleteSubject(id) {
    return this.http.delete(`${this.baseUrl}/profile/delete/${id}`);
  }
  checkAvailability(dateRange = {}) {
    return this.http.post(`${this.baseUrl}/tutor/availability/check-availability`, dateRange);
  }

  saveAvailability(data) {
    return this.http.post(`${this.baseUrl}/tutor/availability/save`, data);
  }

  checkDefaultCalender() {
    return this.http.get(`${this.baseUrl}/tutor/availability/default-calender`);
  }

  addBankAccount(data) {
    return this.http.post(`${this.baseUrl}/tutor/addbankaccount`, data);
  }
  removeBankAccount(id) {
    return this.http.delete(`${this.baseUrl}/tutor/removebankaccount/${id}`);
  }
  getBankAccount() {
    return this.http.get(`${this.baseUrl}/tutor/getbankaccount`);
  }

  makePrimary(id) {
    return this.http.post(`${this.baseUrl}/tutor/make-primary`, {id});
  }

  fetchJobList(body) {
    return this.http.post(`${this.baseUrl}/jobs/tutor-manage-jobs`, body);
  }
  changeOffer(body) {
    return this.http.post(`${this.baseUrl}/jobs/change-offer-status`, body);
  }
  getOfferDetails(id) {
    return this.http.get(this.baseUrl + '/jobs/offer-detail/'+id);
  }
  getEarnings() {
    return this.http.get(this.baseUrl + '/tutor/my-transaction');
  }
  
  getScheduledEvents() {
    return this.http.get(this.baseUrl + '/tutor/availability/fetch-job');
  }

  setInstantType(data) {
    return this.http.post(this.baseUrl + '/profile/save-instant-tutoring',data);
  }

  getInstantTutoringType() {
    return this.http.get(this.baseUrl + '/profile/get-instant-tutoring');
  }
  getCountryCode(){
    return this.http.get('assets/json/country.json');
  }
  withdrawOffer(body) {
    return this.http.post(`${this.baseUrl}/jobs/cancel-application`, body);
  }
  addPaypalToken(body) {
    return this.http.post(this.baseUrl + '/tutor/save-paypal-code', body);
  }
  stripeValidCountry(body){
    return this.http.post(this.baseUrl + '/tutor/check-strip-support-country', body);
  }

  updateOffer(param) {
    return this.http.post(`${this.baseUrl}/jobs/tutor-edit-offer`, param);
  }

  savePaypalEmail(body){
    return this.http.post(this.baseUrl + "/profile/save-paypal-email",body);
  }
  deletePaypalEmail(){
    return this.http.delete(this.baseUrl + "/profile/delete-paypal-email");
  }
  getPaypalEmail() {
    return this.http.get(this.baseUrl+'/profile/get-paypal-email');
  }
  makeDefaultPaymentMethod(mode){
    return this.http.post(this.baseUrl+'/profile/make-default-payment-mode',mode)
  }
  markSessionComplete(body){
    return this.http.post(this.baseUrl+'/jobs/mark-session-completed',body)
  }
  getTransactions(filters) {
    let params = Object.assign({}, filters)
    return this.http.get(this.baseUrl+'/tutor/my-transaction',{params});
  }
  uploadBankDocuments(body){
    return this.http.post(this.baseUrl+'/verification_doc', body)
  }

  requestSessionPayment(id){
    return this.http.post(this.baseUrl + '/tutor/requestpayment',{id});
  }

  fetchDisputePeroid(){
    return this.http.get(this.baseUrl + '/tutor/getdisburseday');
  }

  exportEarnings(filters){
    let headers = new HttpHeaders
    for(let key in filters){headers.append(key, filters[key])}
    return this.http.get('/tutor/earning-export',{headers});
  }

  startSession(session_id){
    return this.http.post(this.baseUrl+'/tutor/createclass ',{session_id}).pipe(map((ele:any) => {
      let token = JSON.parse(this.localStorageservice.getJwtToken())
      ele.data.videourl = 'https://api.vitutors.com' + ele.data.videourl + '?token='+token;
      this.websocketService.emit('session_started'+session_id, session_id);
      return ele
    }))
  }

  tutorDashboard(){
    return this.http.get(this.baseUrl +'/tutor/dashboard/overall-statistics');
  }

  tutorJobPostedDashboard(year){
    return this.http.get(this.baseUrl + `/tutor/dashboard/monthly-offer?year=${year}`)
  }

  tutorNotifications(params){
    return this.http.get(this.baseUrl + '/profile/get-all-notification', {params});
  }

  appliedJobData(body){
    return this.http.post(`${this.baseUrl}/jobs/applied-detail`,body);
  }

  updateClassLevel(body){
    return this.http.post(`${this.baseUrl}/profile/save-tutor-class-level`, body)
  }

  fetchClassLevel() {
    return this.http.get(`${this.baseUrl}/profile/fetch-class-levels`);
  }

  tutorNotificationCompleted(body){
    return this.http.post(this.baseUrl + '/profile/change-notification-status', body)
  }

  updateSessionTime(body){
    return this.http.post(this.baseUrl + '/session/edit-session', body);
  }

  getStripeAccountDetail(){
    return this.http.get(`${this.baseUrl}/tutor/getconnectdetail`);
  }

  fetchAvailabilityDates(body){
    return this.http.post(this.baseUrl + '/tutor/availability/check-bookedslot-availability', body)
  }

  checkSlotAvailability(body){
    return this.http.post(this.baseUrl + '/tutor/availability/get-available-slot', body)
    
  }

  checkSelectedSlotAvailability(body){
    return this.http.post(this.baseUrl + '/tutor/availability/check-available-slot' , body)
  }

}
