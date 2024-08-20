import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTutorComponent } from './view-tutor.component';

describe('ViewTutorComponent', () => {
  let component: ViewTutorComponent;
  let fixture: ComponentFixture<ViewTutorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTutorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
