import { Component, OnInit , ViewChild} from '@angular/core';
import { SearchService } from '../search.service';
import { Options } from 'ng5-slider';
import {environment} from '../../../environments/environment';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { Router } from '@angular/router';
import { AlertService, LocalStorageService, UserService } from '@app/shared/_services';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common/services/common.service';
declare var $: any;

@Component({
  selector: 'app-search-tutor',
  templateUrl: './search-tutor.component.html',
  styleUrls: ['./search-tutor.component.scss']
})
export class SearchTutorComponent implements OnInit {
  @ViewChild('auto' ,  {static: false}) auto;
  searchFilters = {
    tutor: '', search_term: '', hourly_range_from: 0,
    hourly_range_to: 600, availability: '', gender: '', 'sort-by': 'Price' , 'order-by': 'asc' , languages:'',
    experince_level : 'ALL', rating: '', location: '', instant_tutoring: 'BOTH', class_level: 'ALL',sorting:'PriceLH'
  };
  availability = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  gender = ['Male', 'Female'];
  options: Options = {
    floor: 0,
    ceil: 600
  };
  imgBaseUrl = environment.imageURL;
  tutorsList = [];
  logout_url = 'logout';
  response: any;
  imageSrc = 'assets/img/user.png';
  isLoggedInUser = false;
  totalCount = 0;
  searchText = '';
  currentPage = 0;
  lastPage = 1;
  queryParams = {};
  pagesCount = [];
  languageList;
  selectedLanguagesArr = [];
  categoriesList;
  searchType = 'expertise';
  keyword = 'display_name'
  jobs;
  initialValue : any;
  LocationList = [];
  studentLevelArray = [{name:'Elementary'}, {name:'Middle School'}, {name:'High School'}, {name:'College'},{name:'Adult'}];
  selectedLevel = [];
  errorList: boolean ;
  localStorageSearchTerm;

 
  constructor(private serachService: SearchService,
              private asyncRequestService: AsyncRequestService,
              private localStorageService: LocalStorageService,
              private notifierService: AlertService,
              private cookieService: CookieService,
              private userService: UserService,
              private router: Router,
              private commonService:CommonService
              ) {

                this.commonService.sendInvite.subscribe((response:any)=>{                  
                    if(response && response != 0)
                    {
                      
                      this.jobs = response;
                      this.initialValue = response.sub_category_id
                      this.searchFilters.search_term = response.sub_category_id;
                    }else{
                      return;
                    }
                  });

                  if(this.localStorageService.get('filter')){
                    this.localStorageSearchTerm = this.localStorageService.get('filter');
                  }

               }

  ngOnInit() {
    // this.selectedLanguagesArr.push('All')
    this.getCategories();
    // this.getSearch(null);
    // this.getLanguages();
    this.getCountriesList();
    
  }

  sortBYChange(event){
    let value = event.target.value
    if(value == 'PriceLH'){
      this.searchFilters['sort-by'] = 'Price';
      this.searchFilters['order-by'] = 'asc';
    } else if (value == 'PriceHL') {
      this.searchFilters['sort-by'] = 'Price';
      this.searchFilters['order-by'] = 'desc';
    } else if (value == 'Rating'){
      this.searchFilters['sort-by'] = 'Rating';
      this.searchFilters['order-by'] = 'desc';
    } else {
      this.searchFilters['sort-by'] = '';
      this.searchFilters['order-by'] = 'asc';
    }

    this.getSearch(null);
  }

  onSubmitValue() {
    this.getSearch(null);
  }

  clearInput() {
    this.searchFilters.search_term = '';
    this.getSearch(null);
  }


  onChangeSearchType() {
    if(this.searchType == 'expertise')
      this.searchFilters.tutor = ''
    else 
      this.searchFilters.search_term = ''
    
    this.getSearch(null);
  }


  getSearch(evt) {
    this.searchFilters.hourly_range_from = evt ? evt.value : this.searchFilters.hourly_range_from ? this.searchFilters.hourly_range_from : 0;
    this.searchFilters.hourly_range_to = evt ? evt.highValue : this.searchFilters.hourly_range_to ? this.searchFilters.hourly_range_to : 1200;
    this.searchText = this.searchFilters.search_term;
    this.searchFilters.availability = this.availability.join();
    this.searchFilters.gender = this.gender.join();
    this.searchFilters.class_level = this.selectedLevel.length > 0 ? this.selectedLevel.join(): 'ALL';
  
    if(this.jobs && this.jobs.job_type_data == 'instant-tutoring'){
      this.searchFilters.instant_tutoring = '1';
    }

    if(this.selectedLanguagesArr.length == 0){
      // this.selectedLanguagesArr.push('All')
      this.searchFilters.languages = 'All';
    }else{
      this.searchFilters.languages = this.selectedLanguagesArr.toString();
    }


    this.serachService.getRequest('search', this.searchFilters).subscribe((res: any) => {
      if(res.result.data.length > 0){
      this.queryParams = Object.assign({}, this.searchFilters);
      this.tutorsList = res.result.data;
      this.totalCount = res.result.total;
      this.lastPage = res.result.last_page;
      this.currentPage = res.result.current_page;
      this.pagesCount = [];
      this.errorList = false;
      for (let i = 1 ; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }
    } else {
      this.totalCount = 0
      this.errorList = true
    }
   
    
    }, err => {this.errorList = true}, () => {
       
    });
  }

  loadMore(page) {
    this.queryParams = Object.assign(this.queryParams, {page});
    this.serachService.getRequest('search', this.queryParams).subscribe((res: any) => {
      this.tutorsList = res.result.data;
      this.totalCount = res.result.total;
      this.lastPage = res.result.last_page;
      this.currentPage = res.result.current_page;
      this.pagesCount = [];
      for (let i = 1 ; i <= this.lastPage; i++) {
        this.pagesCount.push(i);
      }

    }, err => {}, () => {
    });
    let top = document.getElementById('search_sec_id');
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }
  toggleSelection(key) {
    // debugger;
    let index = this.availability.indexOf(key);
    if (index >= 0) {
      this.availability.splice(index, 1);
    } else {
      this.availability.push(key);
    }
    this.getSearch(null);
  }
  toggleGenderSelection(key) {
    const index = this.gender.indexOf(key);
    if (index >= 0) {
      this.gender.splice(index, 1);
    } else {
      this.gender.push(key);
    }
    this.getSearch(null);
  }
  onImgError(event) {
    event.target.src = 'assets/img/no_image_found.jpg';
  }
  onVideoError(event) {
    event.target.src = 'assets/img/images/video.svg';
  }

  resetAll() {
    this.availability = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.gender = ['Male', 'Female'];
    this.selectedLevel = [];
    this.searchFilters = {tutor: '', search_term: '', hourly_range_from: 0, class_level: 'ALL',
    hourly_range_to: 1200, availability: '', gender: '', 'sort-by': 'Price' , 'order-by' : 'asc' , languages:'',experince_level : 'ALL', rating: '', location: '', instant_tutoring: 'BOTH', sorting:'PriceLH'
  }
  // this.searchFilters.tutor = '';
  // this.searchFilters.search_term= '';
  // this.searchText = '';
  // this.keyword = '';
  this.initialValue = '';
  this.auto.clear();
  this.searchCleared();
  // this.getSearch(null);
}

  // getLanguages() {
  //   this.serachService.fetchLanguages().subscribe((res: any) => {
  //     this.languageList = res.data;
  //   });
  // }

  // defaultLanguage = "All";
  // isDefaultValueSelected = false;
  // setLanguages(event: any) {
  //   // we need to remove all from languages array
  //   let setLanguagesValues = [];
  //   let checkDefaultValue = event.findIndex(
  //     (value: any) => value.toLowerCase() == this.defaultLanguage.toLowerCase()
  //   );
  //   if (checkDefaultValue > -1 && !this.isDefaultValueSelected) {
  //     setLanguagesValues.push(this.defaultLanguage);
  //     this.selectedLanguagesArr = this.selectedLanguagesArr.filter(
  //       (val) => val.toLowerCase() == this.defaultLanguage.toLowerCase()
  //     );
  //     this.isDefaultValueSelected = true;
  //   } else {
  //     this.selectedLanguagesArr = this.selectedLanguagesArr.filter(
  //       (val) => val.toLowerCase() !== this.defaultLanguage.toLowerCase()
  //     );
  //     this.isDefaultValueSelected = false;
  //     setLanguagesValues.push(this.selectedLanguagesArr);
  //   }


  //   this.getSearch(null);
  // }

 

  // onRemoveLanguages(event) {

  //   if (this.selectedLanguagesArr.length == 0) {
  //     let setLanguagesValues = [];
  //     setLanguagesValues.push(this.defaultLanguage);
  //     this.selectedLanguagesArr = setLanguagesValues;
  //     this.getSearch(null);
  //   }
  // }


  // onClearLanguages() {
  //   let setLanguagesValues = [];
  //   this.isDefaultValueSelected = true;
  //   setLanguagesValues.push(this.defaultLanguage);
  //   this.selectedLanguagesArr = setLanguagesValues;
  //   this.getSearch(null);
  // }
  
  setLevel(event){
    this.getCategories();
  }
  removeLevel(event){
    this.getCategories();
  }
  
  getCategories() {
    this.serachService.fetchCategories().subscribe((res: any) => {
      this.categoriesList = res.allCats;
      // this.searchParams.category = this.categoriesList[0].id;
      if(this.jobs){
        let name = this.jobs.sub_category_id
      var newArray = this.categoriesList.filter(function (el) {
        return el.category_name == name;
      });

      this.initialValue = name;
      this.searchFilters.search_term = this.jobs.sub_category_id
      this.searchFilters.tutor = this.jobs.sub_category_id
      } else if (this.localStorageSearchTerm){
        let element = this.categoriesList.find(x => x.id == this.localStorageSearchTerm);
        if(element){
          this.initialValue = element.id;
          this.auto.query = element.display_name
          this.searchFilters.search_term = element.category_name
          this.searchFilters.tutor = element.category_name
        }
      }
      this.getSearch(null);
    });
  }

  selectEvent(item) {
    if(item.category_name){
      // this.searchFilters.tutor = item.category_name;
      this.searchFilters.search_term= item.category_name;
    }
    this.getSearch(null);
  }

  searchCleared(){
    this.searchFilters.tutor = '';
    this.searchFilters.search_term= '';
    this.getSearch(null);
    this.closeStaticPanel();
    if(this.localStorageSearchTerm){
      this.localStorageSearchTerm = null;
      this.localStorageService.remove('filter');
    }
  }

  closeStaticPanel(): void {
    // e.stopPropagation();
    this.auto.close();
  }

  onChangeExperience() {
    this.getSearch(null);
  }

  // getCategories() {
  //   this.serachService.fetchCategories().subscribe((res: any) => {
  //     this.categoriesList = res.data;
  //     this.searchFilters.tutor = this.categoriesList[0].category_name;
  //     this.getSearch(null);
  //   });
  // }

  getCountriesList(){
    this.serachService.getContouries().subscribe((res:any) => {
      this.LocationList = res;
    });
  }


}



