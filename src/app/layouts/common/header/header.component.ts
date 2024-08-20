import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [],
})
export class HeaderComponent implements OnInit {
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
      this.userDetails = localStorage.getItem('user');

  }
  get renderErrors() {
    return this.searchForm.controls;
  }
  @Input() userDetails: any = null;
  @Input() cartDetails: any = null;
  logout_url = 'logout';
  response: any;
  toggle: boolean;
  searchSubmitted = false;

  dashboardUrl = '';
  user_profile_url = '';
  user_settings_url = '';
  profileUrl = '';
  showSearchBox = false;

  searchForm: FormGroup;
  cartVisible = false;
  isLoggedInUser = false;

  // notificationResultArray: any;
  // dataHasBeenLoaded: boolean = false;
  // notificationURL = "notification/listing/";
  // fetchNotifications() {
  //   this.notificationURL = this.notificationURL + this.userDetails.role;
  //   this.userService.fetchNotifications(this.notificationURL).subscribe(
  //     (response: any) => {
  //       this.notificationResultArray = response;
  //       if (
  //         this.notificationResultArray.result.last_page ==
  //         this.notificationResultArray.result.current_page
  //       ) {
  //         this.dataHasBeenLoaded = true;
  //       } else {
  //         this.dataHasBeenLoaded = false;
  //       }
  //     },
  //     (errorResponse: any) => {}
  //   );
  // }

  // /**
  //  * @purpose to load more result and append to current array lazy loading feature
  //  * @method loadMoreResults
  //  * @param {number} pageNumber
  //  * @memberof SearchComponent
  //  */
  // loadMoreResults(pageNumber: number) {
  //   pageNumber += 1;
  //   this.notificationURL = this.notificationURL + "?page=" + pageNumber;

  //   this.userService
  //     .fetchNotifications(this.notificationURL)
  //     .subscribe((res: any) => {
  //       this.notificationResultArray.result.current_page =
  //         res.result.current_page;
  //       // checking if record has no more records then hide load more button
  //       if (
  //         this.notificationResultArray.result.current_page ==
  //         this.notificationResultArray.result.last_page
  //       ) {
  //         this.dataHasBeenLoaded = true;
  //       }
  //       for (let index = 0; index < res.result.data.length; index++) {
  //         const element = res.result.data[index];
  //         this.notificationResultArray.result.data.push(element);
  //       }
  //     });
  // }

  modalRef: BsModalRef;

  ngOnInit() {
    // to render cart items count
    this.setUserDetails();
    const current_url = this.router.url;

    if (current_url == '/') {
      this.showSearchBox = false;
    } else if (current_url.search('search') > -1) {
      this.showSearchBox = false;
    } else {
      this.showSearchBox = true;
    }

    this.createSearchForm();
  }

  // ngAfterViewInit(): void {
  //   this.fetchNotifications();
  // }
  setUserDetails() {


  }
  createSearchForm() {

  }

  /**
   * @purpose submit logout request to backend
   * @method : onLogout
   * @date 2019-08-01
   */
  onLogout() {

  }

  /**
   * @purpose remove active class from toggle menu
   * @method : toggleMenu
   * @date 2019-08-08
   */
  toggleMenu() {
    const element = document.getElementById('navbarToggler');
    element.className = element.className.replace(/\bshow\b/g, '');
  }

  /**
   * @purpose submit data to search route
   * @method : onSubmit
   * @date 2019-09-01
   */
  onSubmit() {
    this.searchSubmitted = true;

    if (!this.searchForm.valid) {
      return;
    }
    const navigateTo = '/search';
    const queryParams = {
      availability: 'Sun,Mon,Tue,Fri,Thu,Wed,Sat',
      lessonMode: 'Online,In Person',
      'distance-range-from': '0',
      'learner-level': 0,
      'distance-range-to': '100',
      gender: 'Male,Female',
      'hourly-range-from': '0',
      'hourly-range-to': '500',
      tutor: this.searchForm.controls.tutor.value,
      'tutor-age-range-from': '0',
      'tutor-age-range-to': '100',
      language: ['All'],
    };
    this.router.navigate([navigateTo], { queryParams });
  }

  setFlagForClearDoubtClick() {

  }
  registerAsModel(template: TemplateRef<any>) {
    // this.modalRef = this.modalService.show(
    //   template,
    //   Object.assign({}, { class: "gray modal-lg modal_register" })
    // );
  }
}
