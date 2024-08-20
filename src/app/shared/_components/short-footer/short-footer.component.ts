import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-short-footer',
  templateUrl: './short-footer.component.html',
  styleUrls: ['./short-footer.component.scss']
})
export class ShortFooterComponent implements OnInit {
  variables = environment;
  constructor() { }

  ngOnInit() {
  }

}
