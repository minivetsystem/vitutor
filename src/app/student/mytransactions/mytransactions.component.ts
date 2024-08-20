import { Component, OnInit, ViewChild } from '@angular/core';
import { StudentService } from '../student.service';
import * as moment from "moment";
import { CommonService } from '@app/common/services/common.service';
import { AttachmentService, AlertService } from '@app/shared/_services';
@Component({
  selector: 'app-mytransactions',
  templateUrl: './mytransactions.component.html',
  styleUrls: ['./mytransactions.component.scss']
})
export class MytransactionsComponent implements OnInit {
  transactions: [] = [];
  showClearButton: boolean = false;
  typeFilter = '';
  dateFilter = '';
  menuToggle;
  noTrasancationErr;
  start_date ='';
  end_date='';
  type='';
  currentPage = 0;
  lastPage = 0;
  pagesCount;
  page = 1;
  

  constructor(
    private studentService: StudentService,
    private commonService: CommonService,
    private attachmentService: AttachmentService,
    private notifierService: AlertService
    ) {
      
     }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.getTransactions();
  }

  change(e) {
   
    if(e.startDate){
      let startDate = e.startDate.year()+'-'+(e.startDate.month()+1) + '-' + e.startDate.date() ;
      let endDate = e.endDate.year()+'-'+(e.endDate.month()+1) + '-' +e.endDate.date();
      this.start_date = e.startDate.format('YYYY-MM-DD')
      this.end_date = e.endDate.format('YYYY-MM-DD');
      this.showClearButton = true;
      this.getTransactions();
      
    } else {
      this.showClearButton = false;
    }
    
  }

  getTransactions(){
    let filters={
      type: this.type,
      startDate: this.start_date,
      endDate : this.end_date
    };
    this.studentService.getTransactions(filters).subscribe((res: any) => {
      this.transactions = res.data || [];
      if(this.transactions.length == 0){
        this.noTrasancationErr = 'error'
      } else {
        this.noTrasancationErr = ''
      }
      this.currentPage = res.data.current_page;
      this.lastPage = res.data.last_page;
      this.pagesCount = [];
      for (let i = 1 ; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }
      
    }, (err) => {
      this.transactions = []   
      this.noTrasancationErr = 'error'
    });
  }

  dateConverter3(date) {
    return moment.utc(`${date}`, "YYYY-MM-DD hh:mm a").local()
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

  clearFilter(){
    this.typeFilter = '';
    this.dateFilter = '';
    this.type = '';
    this.start_date = '';
    this.end_date = '';
    this.showClearButton = false;;
    this.getTransactions();
  }

  changeTransactionType(e){
    this.type=e.target.value
    this.getTransactions();
  }

  openDetail(){
    
  }

  downloadAttachment(id, filename) {
    // let data = {
    //   type : type,
    //   mime_type : object.file_type,
    //   id: object.id
    // }
    const Url = `pdfdownload/${id}`;
    // const Url = 'http://www.africau.edu/images/default/sample.pdf'
    // filename = 'test.pdf'
    this.attachmentService.downloadPDFFile(Url, filename);
  }
  loadMore(page) {
    this.page = page;
    this.getTransactions();
  }

  exportEarnings(){
    if(this.transactions.length == 0){
      this.notifierService.error('There is no transactions to export')
      return;
    }
    let URL = `student/export-transaction?start_date=${this.start_date || ''}&end_date=${this.end_date || ''}&type=${this.type}`
      this.attachmentService.downloadPDFFile(URL, 'transactions');
  }

}




