import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonService } from '@app/common/services/common.service';
declare const $:any;

@Component({
  selector: 'app-sidebar1',
  templateUrl: './sidebar1.component.html',
  styleUrls: ['./sidebar1.component.scss']
})
export class Sidebar1Component implements OnInit {

  route: string;
  toggle;
  constructor(location: Location, private router: Router, private commonService: CommonService) {
    router.events.subscribe((val) => {
      if(location.path() != ''){
        this.route = location.path().split('/')[2];
      } else {
        this.route = 'dashboard'
      }
      if(['dashboard','message-board', 'manage-job','callender','mytransaction','manage-resources','tutor-calendar',''].includes(this.route)){
        // $('#profile').hide();
      }
    });
   }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number) => {
      this.toggle = res;
    }, err => {
      this.toggle = 0
    })
  }

  hideMenu(){
    $('#profile').collapse('hide');
  }

  searchJob() {
    $('#profile').collapse('hide');
    localStorage.setItem('filter', JSON.stringify({ search_term: '', job_type: 'one-time,recurring', price_type: 'Hourly,Fixed', 'sort-by': 'newest', category: 'All' }));
    this.router.navigate(['/searchJob']);
  }

}
