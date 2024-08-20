import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { CommonService } from '@app/common/services/common.service';
declare var $:any;

@Component({
  selector: 'app-sidebar1',
  templateUrl: './sidebar1.component.html',
  styleUrls: ['./sidebar1.component.scss']
})
export class Sidebar1Component implements OnInit {
  route: string = 'dashboard'
  toggle
  constructor(location: Location, private router: Router, private commonService: CommonService) {
    router.events.subscribe((val) => {
      if(val instanceof NavigationEnd){
        this.route = val.url.split('/')[2];
        if(this.route && this.route[this.route.length -1].indexOf('?') != -1){
          this.route = this.route.substr(0, this.route.indexOf('?'));
        }

        if(['dashboard','message-board', 'manage-job','callender','mytransaction','manage-resources','tutor-calendar','upcoming','offerDetails','earning'].includes(this.route)){
          $('#profile').collapse('hide');
        } else {
          $('#profile').collapse('show');
        }
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
    localStorage.setItem('filter', JSON.stringify({ search_term: '', job_type: 'one-time,recurring,instant-tutoring', price_type: 'Hourly,Fixed', 'sort-by': 'newest', category: 'All' }));
    this.router.navigate(['/searchJob']);
  }

}
