import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $:any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Vitutors';
  isAdmin: any;
  isAdminHoverClassCast: boolean;

  isDashboardClass = false;
  outerClass = false;
  slider_image_url = 'slider_image';

  canNotificationVisible = false;

  constructor(
    private titleService: Title,
    private router: Router,
    private loaderService: NgxSpinnerService
  ) {
    this.router.events.subscribe((event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loaderService.show();
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loaderService.hide();
          break;
        }
        default: {
          break;
        }
      }
    });

  }

  notificationURL = 'notification/listing';
  notificationResult: any;

  ngOnInit() {
    $('[data-toggle="tooltip"]').tooltip();

  }


  ngAfterViewInit() {

  }

  onActivate(event: any) {

  }



}
