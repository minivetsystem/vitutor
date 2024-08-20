import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-review-rating-view",
  templateUrl: "./review-rating-view.component.html",
  styleUrls: ["./review-rating-view.component.scss"]
})
export class ReviewRatingViewComponent implements OnInit {
  @Input() rating: string;
  @Input() reviewsCount: string;
  @Input() inlineView: boolean;
  @Input() reviewBar;
  @Input() smallInfo;
  display: boolean = false; 
  ratingNumb;

  constructor() {}

  ngOnInit() {
    if(this.reviewBar == 'hide'){
      this.display = false;
    } else {
      this.display = true;
    }
    this.ratingNumb = parseFloat(this.rating || '0')
  }
  /* Range sliders***/
  starRating = [1, 2, 3, 4, 5];
  halfStar = false;
  emptyStar = false;
  checkStart(total, current) {
    if(total == undefined){
      return false;
    }
    // return;
    if(total == 0){
      this.halfStar = false;
      this.emptyStar = true;
      return false;
    } 
    if(typeof total != 'string'){
      total = '' + total
    }
    let value = (total).indexOf('.') > -1 ?(total).split(".") : [total,0]
    if (value[0] >= current) {
      this.halfStar = false;
      this.emptyStar = false;
      return true;
    } 
    else {
      if (value[1] > 0 && !this.halfStar && !this.emptyStar) {
        this.halfStar = true;
        this.emptyStar = false;
        return false;
      } 
      else {
        this.halfStar = false;
        this.emptyStar = true;
        return false;
      }
    }
  }
}
