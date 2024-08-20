import { Component, OnInit } from '@angular/core';
import { BsModalRef } from "ngx-bootstrap";

@Component({
  selector: 'app-transactions-detail-modal',
  templateUrl: './transactions-detail-modal.component.html',
  styleUrls: ['./transactions-detail-modal.component.scss']
})
export class TransactionsDetailModalComponent implements OnInit {

  bookingData;
  profileData;

  constructor(
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  
  }

}
