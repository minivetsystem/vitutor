import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAcceptedOfferComponent } from './view-accepted-offer.component';

describe('ViewAcceptedOfferComponent', () => {
  let component: ViewAcceptedOfferComponent;
  let fixture: ComponentFixture<ViewAcceptedOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAcceptedOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAcceptedOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
