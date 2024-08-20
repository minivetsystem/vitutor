
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonService} from '../../common/services/common.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
// @ViewChild('menuButton', {static: true}) menuButton: ElementRef;
toggle;
route: string;
  constructor(location: Location, router: Router, private commonService : CommonService) { 
    router.events.subscribe((val) => {
      if(location.path() != ''){
        this.route = location.path().split('/')[2];
      } else {
        this.route = 'dashboard'
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

  navbarToggleIcon() {
  }




}
