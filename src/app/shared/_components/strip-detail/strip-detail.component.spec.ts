import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StripDetailComponent } from './strip-detail.component';

describe('StripDetailComponent', () => {
  let component: StripDetailComponent;
  let fixture: ComponentFixture<StripDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StripDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StripDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
