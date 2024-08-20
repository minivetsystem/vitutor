import { Component, Input, OnInit } from '@angular/core';
import { AsyncRequestService } from "@app/core/services/async-request.service";
import { AlertService, LocalStorageService, UserService } from "../../_services";
import {
  style,
  state,
  animate,
  transition,
  trigger,
} from "@angular/animations";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-profile-complete',
  templateUrl: './profile-complete.component.html',
  styleUrls: ['./profile-complete.component.scss'],
  animations: [
    trigger("fadeInOut", [
      transition(":enter", [
        // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 })),
      ]),
      transition(":leave", [
        // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ProfileCompleteComponent implements OnInit {
  @Input() profileStatusResponse: any;
  @Input() userRole: any;
  @Input()  apiCompleted: boolean = false;
  constructor(
    private asyncRequestService: AsyncRequestService,
    private localStorageService: LocalStorageService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit() {
    
  }





}

