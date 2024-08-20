import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  // encapsulation : ViewEncapsulation.None
})
export class FooterComponent implements OnInit {
  get_platform_details = 'get-platform-details';

  constructor(
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}
  contact_details: any;
  follow_us: any;
  phones: any;
  emails: any;
  address: any;
  ngOnInit() {}

  async ngAfterViewInit() {

  }
  tutorLink(value: any) {
    const navigateTo = '/search';
    const queryParams = {
      availability: 'Sun,Mon,Tue,Fri,Thu,Wed,Sat',
      lessonMode: 'Online,In Person',
      'distance-range-from': '0',
      'distance-range-to': '100',
      gender: 'Male,Female',
      'hourly-range-from': '0',
      'hourly-range-to': '500',
      tutor: value,
      'tutor-age-range-from': '0',
      'tutor-age-range-to': '100',
      language: ['All'],
    };
    this.router.navigate([navigateTo], { queryParams });
    this.triggerScrollTo();
  }
  triggerScrollTo() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
}
