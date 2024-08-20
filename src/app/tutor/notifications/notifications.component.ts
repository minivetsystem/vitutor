import { Component, OnInit } from '@angular/core';
import { TutorService } from '../tutor.service';
import { CommonService} from '../../common/services/common.service'
import { Router } from '@angular/router';
import { AlertComponent } from 'ngx-bootstrap';
import { AlertService, WebsocketService, LocalStorageService } from '@app/shared/_services';



@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notificationsList = [];
  noTrasancationErr;
  menuToggle;
  lastPage;
  currentPage;
  page;
  start_date ='';
  end_date='';
  showClearButton: boolean = false;
  dateFilter;
  pagesCount=[]
  userId
  constructor(private tutorService: TutorService, private commonService: CommonService, private router: Router, private notification: AlertService, private websocketService: WebsocketService, private localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.userId = this.localStorageService.getRefId();
    this.fetchNotifications();
  }

  fetchNotifications(){
    let filters={
      start_date: this.start_date,
      end_date : this.end_date,
      page: this.page
    };
    this.tutorService.tutorNotifications(filters).subscribe((res:any)=> {
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
          this.noTrasancationErr = 'error';
          this.pagesCount = [];
          this.notificationsList = []
        }
      }  else {
        this.noTrasancationErr = 'error';
        this.pagesCount = [];
        this.notificationsList = [];
      }
     
    }, err => {
      this.noTrasancationErr = 'error';
      this.pagesCount = [];
      this.notificationsList = [];
      this.page = 1;
    })
  }
  loadMore(page){
    this.page = page;
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
    this.tutorService.tutorNotificationCompleted({status: 1, notification_id : data.id}).subscribe(res => {
      let type = data.type
      this.websocketService.emit('notification_count',{user_id: this.userId});
      if(type=='new_message'){
        this.router.navigate(['/tutor/message-board'], { queryParams: { message_board_room_id: data.reference_id}})
      } else if(type=='admin_new_message'){
        this.router.navigate(['/tutor/message-board'])
      } else if(type=='job_accepted'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'NewOffer'}});
      } else if (type == 'new_application_received'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'NewInvite'}});
      } else if (type == 'job_applied'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'Applied'}});
      } else if (type == 'session_early_start'){
        this.notification.error('Request is expired')
      } else if (type == 'job_invite'){
        this.router.navigate(['/tutor/manage-job'],{ queryParams: {tab:'NewInvite'}});
      }else if (type == 'send_offer'){
        this.router.navigate(['/tutor/message-board'])
      }else if (type == 'payment'){
        this.router.navigate(['/tutor/account-setting'])
      }
      data.status = 1;
    });
  
   
  }

}
