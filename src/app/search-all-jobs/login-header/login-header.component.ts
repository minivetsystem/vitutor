import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';
@Component({
  selector: 'app-login-header',
  templateUrl: './login-header.component.html',
  styleUrls: ['./login-header.component.scss']
})
export class LoginHeaderComponent implements OnInit {
  variables = environment;
  constructor() { }

  ngOnInit() {
  }

}
