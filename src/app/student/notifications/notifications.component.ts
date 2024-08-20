import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { StudentService } from '../student.service';
import { Router } from '@angular/router'
import { AlertService, WebsocketService, LocalStorageService } from '@app/shared/_services';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  menuToggle;
  notificationsList = [];
  noTrasancationErr;
  lastPage;
  currentPage;
  page = 1;
  start_date ='';
  end_date='';
  showClearButton: boolean = false;
  dateFilter;
  pagesCount = [];
  userId
  constructor(private commonService: CommonService, private studentService: StudentService, private router: Router, private notificationService: AlertService, private websocketService: WebsocketService, private localStorageService: LocalStorageService) { 
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.userId = this.localStorageService.getRefId();
  }

  ngOnInit() {
    this.fetchNotifications();
  }

  fetchNotifications(){
    let filters={
      start_date: this.start_date,
      end_date : this.end_date,
      page: this.page
    };
    this.studentService.studentNotifications(filters).subscribe((res:any)=> {
      if(res.success == true){
        if(res.reviews.data.length > 0){
          this.notificationsList = res.reviews.data;
          this.currentPage = res.reviews.current_page;
          this.lastPage = res.reviews.last_page;
          this.noTrasancationErr = '';
          this.pagesCount = [];
          for(let i = 1; i< this.lastPage;i++){
            this.pagesCount.push(i);
          }
        } else {
          this.notificationsList = [];
          this.pagesCount = []
          this.noTrasancationErr = 'error'
        }
      }  else {
        this.notificationsList = [];
        this.pagesCount = []
        this.noTrasancationErr = 'error'
      }
     
    }, err => {
      this.notificationsList = [];
      this.pagesCount = []
      this.noTrasancationErr = 'error',
      this.page=1;
    })
  }
  loadMore(page){
    this.page= page;
    this.fetchNotifications();
  }

  change(e) {
    
     if(e.startDate){
       let startDate = e.startDate.year()+'-'+(e.startDate.month()+1) + '-' + e.startDate.date() ;
       let endDate = e.endDate.year()+'-'+(e.endDate.month()+1) + '-' +e.endDate.date();
       this.start_date = startDate
       this.end_date = endDate;
       this.showClearButton = true;
       this.fetchNotifications();
       
     } else {
       this.showClearButton = false;
     }
     
   }

   clearFilter(){
    this.start_date = '';
    this.end_date = '';
    this.showClearButton = false;
    this.dateFilter = null;

    this.fetchNotifications();
  }


  redirect(data){
    this.studentService.studentNotificationCompleted({status: 1, notification_id : data.id}).subscribe(res => {
      let type = data.type
      this.websocketService.emit('notification_count',{user_id: this.userId});
      if(type=='new_message'){
        this.router.navigate(['/student/message-board'],{ queryParams: { message_board_room_id: data.reference_id, autoSelect:true}})
      } else if(type=='admin_new_message'){
        this.router.navigate(['/student/message-board'], { queryParams: { message_board_room_id: data.reference_id}})
      } else if(type=='job_accepted'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'JobPosted'}});
      } else if (type == 'new_application_received'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'ApplicationReceived'}});
      } else if (type == 'job_applied'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'JobPosted'}});
      } else if (type == 'session_early_start'){
        this.notificationService.error('Request is expired')
      } else if (type == 'job_offer'){
        this.router.navigate(['/student/manage-jobs'],{ queryParams: {tab:'sentOffer'}});
      } 
      data.status = 1;
    });

   
  }


}
