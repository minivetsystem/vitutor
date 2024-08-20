import { Component, OnInit, ViewChild } from '@angular/core';
import { Options } from 'ng5-slider';
import { Router,   ActivatedRoute } from '@angular/router';
import { SearchServiceService } from '../search-service.service';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
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
  searchParams = { search_term: '', job_type: 'one-time,recurring,intant-tutoring', price_type: 'Hourly,Fixed', 'sort-by': 'newest', category: 'All',
    hourly_range_from: 0,hourly_range_to: 600,searchType : "Category", proposed_start_time: '',class_level:'ALL'
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
  jobsListErr ;
  jobObj = {job_title: '', job_id: null, refId: null}
  searchTerm;
  
  constructor(private jobService: SearchServiceService, private router: Router,
    private aroute: ActivatedRoute, private commonService: CommonService) {
    
     
    }

  ngOnInit() {
    this.aroute.queryParams
    .subscribe(params => {
      this.searchParams.search_term = params.search_term
      this.initialValue = params.search_term;
      this.getCategories(params.search_term);
      // this.searchTerm = params.search_term;
    }
  );
   
    
   
    // this.getJobs();
  }

  getJobs() {
    this.searchParams.class_level = this.selectedLevel.length > 0 ? this.selectedLevel.join(): 'ALL';
    // localStorage.setItem('filter', JSON.stringify(this.searchParams))
    this.jobService.tutorJobs(this.searchParams).subscribe((res: any) => {
      this.tutorJobsList = res.result.data;
      this.totalRecords = res.result.total;
      this.lastPage = res.result.last_page;
      this.currentPage = res.result.current_page;
      this.pagesCount = [];
      if(this.tutorJobsList.length > 0){
        this.jobsListErr = 'no_error';
      }else {
        this.jobsListErr = 'error';
      }

      
      for (let i = 1; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }
    }, err => {
      this.jobsListErr = 'error';
      this.tutorJobsList = []
    });
    
  }

  onChangeHourlyRate(evt) {
    this.searchParams.hourly_range_from = evt ? evt.value : this.searchParams.hourly_range_from ? this.searchParams.hourly_range_from : 0;
    this.searchParams.hourly_range_to = evt ? evt.highValue : this.searchParams.hourly_range_to ? this.searchParams.hourly_range_to : 600;
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
    localStorage.removeItem('filter');
    this.searchParams = { search_term: this.searchTerm, class_level:'ALL',job_type: 'one-time,recurring,instant-tutoring', price_type: 'Hourly,Fixed', 'sort-by': 'newest', category: 'All', hourly_range_from: 0,hourly_range_to: 600,searchType :"Category", proposed_start_time:''};
    this.jobsTypeArray = ['one-time', 'recurring', 'instant-tutoring'];
    this.priceTypeArray = ['Hourly', 'Fixed'];
    this.selectedLevel = ['Elementary','Middle School','High School','College','Adult'];
    this.initialValue = ""
    // this.auto.clear();
    this.ngOnInit();
    this.jobTypeSelect = "both";
    this.priceTypeSelect = "both";
  }


  loadMore(page) {
    this.searchParams = Object.assign(this.searchParams, { page });
    this.getJobs();
  }

  getCategories(key) {
    this.jobService.fetchCategories().subscribe((res: any) => {
      this.categoriesList = res.allCats;
      if(key){
        let name = key.toLowerCase()
      let newArray = this.categoriesList.find( (el) => {
        return el.category_name.toLowerCase() == name;
      });
      this.searchParams.search_term = newArray? newArray.category_name: ''
      this.searchParams.category = newArray? newArray.category_name: '';
      this.searchTerm = newArray? newArray.category_name: ''
    }
      // this.searchParams.tutor = newArray? newArray.category_name: ''
      // this.searchParams.category = this.categoriesList[0].id;
      this.getJobs();
    });
  }

  hourlyRate(event) {
    this.searchParams.price_type = event.target.value;
  }
  
  

  

  imgLoadError(event) {
    event.target.src = 'assets/img/images/user_icon.svg';
  }

  selectEvent(item) {
    if (Object.keys(item).length != 0) {
   
      this.searchParams.category = item.category_name;
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
    oldPriceType['sort-by'] = event;
    localStorage.setItem('filter', JSON.stringify(oldPriceType))
    let page = '1';
    this.searchParams = Object.assign(this.searchParams, { page });
    this.getJobs();
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

  openApplyJobModal(job){
    this.router.navigate(['/login']);
  }

  

}
