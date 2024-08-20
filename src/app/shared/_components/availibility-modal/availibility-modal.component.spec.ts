import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailibilityModalComponent } from './availibility-modal.component';

describe('AvailibilityModalComponent', () => {
  let component: AvailibilityModalComponent;
  let fixture: ComponentFixture<AvailibilityModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailibilityModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailibilityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
