import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonService } from '@app/common/services/common.service';
declare const $:any;

@Component({
  selector: 'app-sidebar2',
  templateUrl: './sidebar2.component.html',
  styleUrls: ['./sidebar2.component.scss']
})
export class Sidebar2Component implements OnInit {

  toggle;
route: string = 'dashboard';
  constructor(location: Location, private router: Router, private commonService: CommonService) { 
    router.events.subscribe((val) => {
      if(val instanceof NavigationEnd){
        this.route = val.url.split('/')[2];
        if(this.route.indexOf('?') != -1){
          this.route = this.route.substr(0, this.route.indexOf('?'));
        }
        if(['manage-jobs', 'create-jobs'].includes(this.route)){
          $('#profile').collapse('show');
         
        } else {
          $('#profile').collapse('hide');
        }
      }
  
    });
  }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number) => {
      this.toggle = res;
    })
  }

  navbarToggleIcon() {
  }

  navigateTo(url){
    this.commonService.sendInvite.next(null);
    this.router.navigate([url]);
  }
  hideMenu(){
    $('#profile').collapse('hide');
  }

}
