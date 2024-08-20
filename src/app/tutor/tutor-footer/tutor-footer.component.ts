import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tutor-footer',
  templateUrl: './tutor-footer.component.html',
  styleUrls: ['./tutor-footer.component.scss']
})
export class TutorFooterComponent implements OnInit {
  variables = environment;
  constructor() { }

  ngOnInit() {
  }

}
