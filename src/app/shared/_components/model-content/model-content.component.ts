import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap";

@Component({
  selector: "app-model-content",
  templateUrl: "./model-content.component.html",
  styleUrls: ["./model-content.component.scss"],
})
export class ModelContentComponent implements OnInit {
  title: string;
  closeBtnName: string;
  content: string = "";

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit() {}
}
