import { Component, OnInit } from '@angular/core';
import {LocalStorageService} from 'src/app/shared/_services/index'

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  isTutor
  constructor(private localStorageService : LocalStorageService) { }

  ngOnInit() {
    this.isTutor = this.localStorageService.getRole() == 'tutor' ? true: false;
  }

}
