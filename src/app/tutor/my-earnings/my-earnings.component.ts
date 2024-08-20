import { Component, OnInit } from '@angular/core';
import { TutorService } from '../tutor.service';
import * as moment from 'moment-timezone';
import { AttachmentService, LocalStorageService } from '@app/shared/_services';
import { CommonService } from '@app/common/services/common.service';

@Component({
  selector: 'app-my-earnings',
  templateUrl: './my-earnings.component.html',
  styleUrls: ['./my-earnings.component.scss']
})
export class MyEarningsComponent implements OnInit {
  transactionList = [];
  typeFilter;
  dateFilter;
  showClearButton: boolean = false;
  selected: {startDate: moment.Moment, endDate: moment.Moment};
  startDate;
  endDate ;
  filters = {type: '', start_date: '', end_date:''}
  currentPage = 0;
  lastPage = 0;
  pagesCount;
  page = 1;
  noTrasancationErr;
  menuToggle;
  timeZone
  constructor(
    private tutorService: TutorService,
    private attachmentService: AttachmentService,
    private commonService: CommonService,
    private localStorageService: LocalStorageService
    ) { }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    
      this.timeZone = this.localStorageService.getTimeZone();
  
    this.getTransactionsListing();
    
  }

  getTransactionsListing(){
    const filters = {
      start_date : this.startDate || '',
      end_date : this.endDate || '',
      type : this.filters.type,
      page: this.page
    };
    this.tutorService.getTransactions(filters).subscribe((res:any) => {
      this.transactionList = res.data.data;
      this.currentPage = res.data.current_page;
      this.lastPage = res.data.last_page;
      this.pagesCount = [];
      for (let i = 1 ; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }
      if(this.transactionList.length == 0){
        this.noTrasancationErr = 'error'
      } else {
        this.noTrasancationErr = ''
      }
      
      // this.
    }, err => {
      this.transactionList = [];
      this.noTrasancationErr = 'error';
    })
  }

  dateConverter3(date) {
    return moment.utc(`${date}`, "YYYY-MM-DD HH:mm:ss").tz(this.timeZone)
      .format("dddd MM-DD-YYYY hh:mm A");
  }

  dateFormat(dateObj){
    let start =  moment
      .utc(`${dateObj.date} ${dateObj.start_time}`, "YYYY-MM-DD hh:mm a")
      .local()
      .format("MMM DD, hh:mm a");
      let end =  moment
      .utc(`${dateObj.date} ${dateObj.end_time}`, "YYYY-MM-DD hh:mm a")
      .local()
      .format("hh:mm a");

      return `${start} - ${end}`;
  }

 
  clearBtn() {
    this.selected = null;
    this.startDate = null;
    this.endDate = null;
    this.showClearButton = false;
    this.typeFilter = '';
    this.dateFilter = '';
    this.filters = {type: '', start_date: '', end_date:''};
    this.page = 1;
    this.getTransactionsListing();
    
  }


  changeTransactionType(e){
    let value=e.target.value
    if(value != ''){
    this.filters.type = value;
    this.getTransactionsListing();
    }
  }
  noType(event){
    event.preventDefault();
  }
  change(e) {
    if (e.startDate != null) {
      // this.startDate = e.startDate.year() + '-' + (e.startDate.month() + 1) + '-' + e.startDate.date() ;
      this.startDate=e.startDate.format('YYYY-MM-DD')
    }
    if (e.endDate != null) {
      // this.endDate = e.endDate.year() + '-' + (e.endDate.month() + 1) + '-' + e.endDate.date();
      this.endDate = e.endDate.format('YYYY-MM-DD')
    }
    if ((this.startDate != null) && (this.endDate != null)) {
      this.showClearButton = true;
    } else {
      this.showClearButton = false;
      this.selected = null;
    }
    
    this.getTransactionsListing();
  }
  loadMore(page) {
    this.page = page;
    this.getTransactionsListing();
  }

  downloadAttachment(url, filename) {
    // let data = {
    //   type : type,
    //   mime_type : object.file_type,
    //   id: object.id
    // }
    // const Url = `attachment/${data.type}/${data.id}`;
    // const Url = 'http://www.africau.edu/images/default/sample.pdf'
    // filename = 'test.pdf'
    
    // this.attachmentService.downloadPDFFile(url, filename); // download the invoice
  }
  exportEarnings(){
    
    let URL = `tutor/earning-export?start_date=${this.startDate || ''}&end_date=${this.endDate || ''}&type=${this.filters.type}`
    
      this.attachmentService.downloadPDFFile(URL, 'earnings');
  }



}
