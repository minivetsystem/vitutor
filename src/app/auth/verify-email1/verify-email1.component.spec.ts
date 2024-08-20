import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmail1Component } from './verify-email1.component';

describe('VerifyEmail1Component', () => {
  let component: VerifyEmail1Component;
  let fixture: ComponentFixture<VerifyEmail1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyEmail1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyEmail1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
