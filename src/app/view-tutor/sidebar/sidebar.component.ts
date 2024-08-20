import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() toggle;
route: string;
  constructor(location: Location, router: Router) { 
    router.events.subscribe((val) => {
      if(location.path() != ''){
        this.route = location.path().split('/')[2];
      } else {
        this.route = 'dashboard'
      }
    });
  }

  ngOnInit() {
  }

}

