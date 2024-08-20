import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewRatingViewComponent } from './review-rating-view.component';

fdescribe('ReviewRatingViewComponent', () => {
  let component: ReviewRatingViewComponent;
  let fixture: ComponentFixture<ReviewRatingViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewRatingViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewRatingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
