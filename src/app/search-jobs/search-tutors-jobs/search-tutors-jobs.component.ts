import { Component, OnInit, ViewChild , HostListener} from '@angular/core';
import { AlertService } from '@app/shared/_services';
import { SearchJobService } from '../search-job.service';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
declare const $: any;
import { Options } from 'ng5-slider';
import {AttachmentService} from '../../shared/_services/attachment.service'
import { CommonService } from '../../common/services/common.service';
import { WebsocketService } from '../../shared/_services';
import { LocalStorageService } from '../../shared/_services/index';


@Component({
  selector: 'app-search-tutors-jobs',
  templateUrl: './search-tutors-jobs.component.html',
  styleUrls: ['./search-tutors-jobs.component.scss']
})
export class SearchTutorsJobsComponent implements OnInit {
  @ViewChild('auto', { static: false }) auto;
  currentJobID;
  jobsTypeArray = ['one-time', 'recurring','instant-tutoring'];
  priceTypeArray = ['Hourly', 'Fixed'];
  tutorJobsList = [];
  categoriesList;
  totalRecords;
  currentPage = 0;
  lastPage = 1;
  pagesCount = [];
  searchComplete = [];
  items = [];
  pageOfItems: Array<any>;
  priceTypeSelect = 'both';
  jobTypeSelect = 'both';
  ApplyJob = { message: '', price: '' , attachment: null};
  patternPrice = /^[0-9]+(\.[0-9]{1,2})?$/;
  priceErr = false;
  keyword = 'display_name';
  initialValue = {};
  applicant;
  searchParams = { search_term: '', job_type: 'one-time,recurring,instant-tutoring', price_type: 'Hourly,Fixed', 'sort-by': 'newest', category: 'All',
    hourly_range_from: 0,hourly_range_to: 600,searchType : "Category", proposed_start_time: '',class_level:'ALL',jobType: 'both'
  };
  applySubmitted:boolean = false;
  attachmentTypeError: boolean = false;
  attachmentFile: any = null;
  attachmentsizeLimitError: boolean = false;
  attachmentRequiredError: boolean = false;
  options: Options = {
    floor: 0,
    ceil: 600
  };
  applyJobTitle='';
  studentLevelArray = [{name:'Elementary'}, {name:'Middle School'}, {name:'High School'}, {name:'College'},{name:'Adult'}];
  selectedLevel = ['Elementary','Middle School','High School','College','Adult'];
  jobsListErr: boolean;
  jobObj = {job_title: '', job_id: null, refId: null};
  userId;
  notificationList = [];
  
  constructor(private jobService: SearchJobService, private notifier: AlertService, private router: Router,
    private route: ActivatedRoute, private attachmentService: AttachmentService, private commonService: CommonService,
    private websocketService: WebsocketService, private localStorageService: LocalStorageService) {
      this.userId = this.localStorageService.getRefId();
      if(localStorage.getItem('filter')){
        let searchFilterValues = JSON.parse(localStorage.getItem('filter'))
        this.jobTypeSelect = searchFilterValues.job_type != 'one-time,recurring,instant-tutoring' ? ( searchFilterValues.job_type == 'one-time,recurring' ? 'both' : searchFilterValues.job_type) : 'both' ;
        this.priceTypeSelect = searchFilterValues.price_type != 'Hourly,Fixed' ?  searchFilterValues.price_type: 'both' ;
        // var category = JSON.parse(localStorage.getItem('filter')).category_name || 'All' ;
        
        this.searchParams = { 
          class_level: searchFilterValues.class_level || 'ALL',
          search_term: searchFilterValues.search_term || '', 
          job_type: searchFilterValues.job_type || 'one-time,recurring,instant-tutoring', 
          price_type: searchFilterValues.price_type || 'Hourly,Fixed', 
          'sort-by': searchFilterValues['sort-by'] || 'newest', 
          category: searchFilterValues.category_name || 'All',
          hourly_range_from: searchFilterValues.hourly_range_from || 0,
          hourly_range_to: searchFilterValues.hourly_range_to || 1200,
          searchType : searchFilterValues.searchType || "Category",
          proposed_start_time: searchFilterValues.proposed_start_time || '',
          jobType : searchFilterValues.job_type == 'one-time,recurring,instant-tutoring'? 'both' : searchFilterValues.job_type
        };
      }
     
    }

  ngOnInit() {
   
    // const localStorageFilter = JSON.parse(localStorage.getItem('filter'))
    // if (localStorageFilter != null) {
    //   this.initialValue = localStorageFilter.category != 'All' ? localStorageFilter.category : '';
    // } else {
    //   localStorage.setItem('filter', JSON.stringify(this.searchParams))
    // }
    this.getCategories();
    // this.getJobs();
  }

  getJobs() {
    this.searchParams.class_level = this.selectedLevel.length > 0 ? this.selectedLevel.join(): 'ALL';
    // localStorage.setItem('filter', JSON.stringify(this.searchParams))
    this.jobService.fetchTutorsJobs(this.searchParams).subscribe((res: any) => {
      this.tutorJobsList = res.result.data;
      this.totalRecords = res.result.total;
      this.lastPage = res.result.last_page;
      this.currentPage = res.result.current_page;
      this.pagesCount = [];
      if(this.tutorJobsList.length > 0){
        this.jobsListErr = false;
      }else {
        this.jobsListErr = true;
      }
      
      for (let i = 1; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }
    }, err => {
      this.jobsListErr = true;
    });
    
  }

  onChangeHourlyRate(evt) {
    this.searchParams.hourly_range_from = evt ? evt.value : this.searchParams.hourly_range_from ? this.searchParams.hourly_range_from : 0;
    this.searchParams.hourly_range_to = evt ? evt.highValue : this.searchParams.hourly_range_to ? this.searchParams.hourly_range_to : 1200;
    this.getJobs();
  }

  onChangeExperience() {
    this.getJobs();
  }

  onChangeSearchType() {
    if(this.searchParams.searchType == 'Category') {
      this.searchParams.category = 'All';
      this.searchParams.search_term = '';
      localStorage.setItem('filter', JSON.stringify(this.searchParams))
      this.getJobs();
    }else{
      this.searchParams.category = 'All';
      localStorage.setItem('filter', JSON.stringify(this.searchParams))
    }
  }

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  changeProposedDate(){
    this.getJobs();
  }


  resetAll() {
    if(localStorage.getItem('filter')){
      localStorage.removeItem('filter');
    }
    
    this.searchParams = Object.assign(this.searchParams,{ search_term: '', class_level:'ALL',job_type: 'one-time,recurring,instant-tutoring', price_type: 'Hourly,Fixed', 'sort-by': 'newest', category: 'All', hourly_range_from: 0,hourly_range_to: 1200, proposed_start_time:'', jobType: 'both'});
    this.jobsTypeArray = ['one-time', 'recurring', 'instant-tutoring'];
    this.priceTypeArray = ['Hourly', 'Fixed'];
    this.selectedLevel = ['Elementary','Middle School','High School','College','Adult'];
    this.initialValue = ""
    if(this.auto){
      this.auto.query = undefined
    }
    
    this.jobTypeSelect = "both";
    this.priceTypeSelect = "both";
    this.getJobs();
  }


  loadMore(page) {
    this.searchParams = Object.assign(this.searchParams, { page });
    this.getJobs();
  }

  getCategories() {
    this.jobService.fetchCategories().subscribe((res: any) => {
      this.categoriesList = res.allCats;
      // this.searchParams.category = this.categoriesList[0].id;
      this.getJobs();
    });
  }

  hourlyRate(event) {
    this.searchParams.price_type = event.target.value;
  }
  
  openApplyJobModal(job) {
    this.currentJobID = job.id;
    this.applyJobTitle = job.job_title;
    this.jobObj = {job_title : job.job_title, job_id: job.job_id, refId: job.refId}
    $('#apply_job').modal('show');
  }

  applyJob() {
    this.applySubmitted = true;
    if (this.patternPrice.test(this.ApplyJob.price) && !this.attachmentTypeError && !this.attachmentsizeLimitError) {
    
      const applyJob = new FormData();
      applyJob.append('attachment', this.attachmentFile);
      applyJob.append('job_id', this.currentJobID);
      applyJob.append('message', this.ApplyJob.message);
      applyJob.append('offer_price', this.ApplyJob.price);
      this.jobService.applyJob(applyJob).subscribe((res: any) => {

        if(res.success == true){
          this.notifier.success(res.success_message);
          this.commonService.sendNotification({ receiver_id: this.jobObj.refId,
            reference_id: this.jobObj.job_id, 
            notification: 'Application received for the job ' + this.jobObj.job_title,
            notification_message:  this.ApplyJob.message,
            type:  'job_applied'})
          this.ApplyJob = { message: '', price: '' , attachment: null};
          $('#apply_job').modal('hide');
          this.priceErr = false;
          // this.attachmentRequiredError = false;
          this.applySubmitted = false;
          let element = this.tutorJobsList.find(ele => ele.id == this.currentJobID );
          element.apply_status = true;
        } else {
          this.notifier.error(res.error_message);
        }
      }, err => {
        this.notifier.error(err.error.error_message);
        this.priceErr = false;
        // this.attachmentRequiredError = false;
        this.applySubmitted = false;
      });
    } 
    // else if(!this.attachmentFile && !this.patternPrice.test(this.ApplyJob.price)) {
    //   this.attachmentRequiredError = true;
    //   this.priceErr = true;
    // } 
    else if(!this.patternPrice.test(this.ApplyJob.price)){
      this.priceErr = true;
    } 
    // else if(!this.attachmentFile){
    //   this.attachmentRequiredError = true;
    // }
    // this.getJobs();
  }

  imgLoadError(event) {
    event.target.src = 'assets/img/images/user_icon.svg';
  }

  selectEvent(item) {
    if (Object.keys(item).length != 0) {
      let oldCategory = JSON.parse(localStorage.getItem('filter'))
      oldCategory['category'] = item;
      localStorage.setItem('filter', JSON.stringify(oldCategory))
      this.searchParams.category = item.category_name;
    } else if (JSON.parse(localStorage.getItem('filter'))) {
      let storageCategory = JSON.parse(localStorage.getItem('filter'))
      this.searchParams.category = storageCategory.category ? storageCategory.category : 'All';
    } else {
      this.searchParams.category = 'All';
    }
    let page = '1';
    this.searchParams = Object.assign(this.searchParams, { page });
    this.getJobs();
  }

  searchCleared() {
    this.searchParams.category = 'All';
    this.getJobs();
    this.closeStaticPanel()
  }

  clearInput() {
    this.searchParams.search_term = '';
    this.searchParams.category = 'All';
    this.getJobs();
  }

  closeStaticPanel(): void {
    // e.stopPropagation();
    this.auto.close();
  }


  toggleJobSelection(key) {
    const index = this.jobsTypeArray.indexOf(key);
    if (index >= 0) {
      this.jobsTypeArray.splice(index, 1);
    } else {
      this.jobsTypeArray.push(key);
    }
    this.getJobs();
  }

  togglePriceSelection(key) {
    const index = this.priceTypeArray.indexOf(key);
    if (index >= 0) {
      this.priceTypeArray.splice(index, 1);
    } else {
      this.priceTypeArray.push(key);
    }
    this.getJobs();
  }

  changeCategory() {
    this.searchParams.category = this.searchComplete.find(ele => {
      return ele.display_name === this.searchParams.search_term;
    }).category_name;
    this.getJobs();
  }

  priceTypeChange(event) {
    if (event == 'both') {
      this.searchParams.price_type = 'Hourly,Fixed';
    } else {
      this.searchParams.price_type = event;
    }
    this.priceTypeSelect = event;
    let oldPriceType = JSON.parse(localStorage.getItem('filter'))
    oldPriceType['price_type'] = event;
    localStorage.setItem('filter', JSON.stringify(oldPriceType))
    let page = '1';
    this.searchParams = Object.assign(this.searchParams, { page });
    this.getJobs();
  }

  jobTypeChange(event) {
    if (event == 'both') {
      this.searchParams.job_type = 'one-time,recurring,instant-tutoring';
    } else {
      this.searchParams.job_type = event;
    }
    this.jobTypeSelect = event;

    let oldJobType = JSON.parse(localStorage.getItem('filter')) || {}
    oldJobType['job_type'] = event;
    localStorage.setItem('filter', JSON.stringify(oldJobType))
    let page = '1';
    this.searchParams = Object.assign(this.searchParams, { page });
    this.getJobs();

  }

  sortTypeChange(event) {
    this.searchParams['sort-by'] = event;
    let oldPriceType = JSON.parse(localStorage.getItem('filter'))
    if(oldPriceType){
      oldPriceType['sort-by'] = event;
      localStorage.setItem('filter', JSON.stringify(oldPriceType))
    }
   
    let page = '1';
    this.searchParams = Object.assign(this.searchParams, { page });
    this.getJobs();
  }
  onSelectAttachment(evt) {
    // this.sizeLimitError = false;
    this.attachmentRequiredError = false;
    this.attachmentTypeError = false;
    this.attachmentsizeLimitError = false;
    this.attachmentFile = evt.target.files[0];
    const fileSize = parseFloat(Number(this.attachmentFile.size/1024/1024).toFixed(2));
    if(this.attachmentFile.type != 'image/png' && this.attachmentFile.type != 'image/jpeg' && this.attachmentFile.type !='application/pdf'
    && this.attachmentFile.type != 'application/msword' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    && this.attachmentFile.type != 'application/vnd.ms-excel' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && this.attachmentFile.type != 'text/plain') {
      this.attachmentFile = null;
      this.attachmentTypeError = true;
    }
    if(fileSize > 5) {
      this.attachmentFile = null;
      this.attachmentsizeLimitError = true;
    }                
  }

  onSubmitValue() {
    this.getJobs();
  }
  setLevel(event){
    this.getJobs();
  }
  removeLevel(event){
    this.getJobs();
  }

  appliedJob(id){
    this.jobService.appliedJobData({id}).subscribe((res:any)=>{
      this.applicant = res.data;
      // this.applicant.user.avg_rating = Math.round(parseFloat(this.applicant.user.avg_rating) || 0).toFixed(1)
      $('#view_applicants').modal('show');
    })
  }

  downloadAttachment(object,type) {
    
    
    let data = {
      type : type,
      mime_type : object.file_type,
      id: object.id
    }
    const Url = `attachment/${data.type}/${data.id}`;
    this.attachmentService.downloadFile(Url, object.name);
 
}
sendNotification(){
  this.websocketService.emit('notification_list',{user_id: this.userId});
  this.websocketService.listen(`notification_list_${this.userId}`).subscribe((res:any)=> {
    this.notificationList = res.data;
  });
  
}

receiveNotification(){
  this.websocketService.listen(`new_notification_${this.userId}`).subscribe((res: any) => {
    this.notificationList.unshift(res);
  });
}

navigate(url){
  $('#view_applicants').modal('hide');
  this.router.navigate([url]);
}
  


}
