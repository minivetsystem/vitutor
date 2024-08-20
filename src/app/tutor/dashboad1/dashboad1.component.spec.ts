import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboad1Component } from './dashboad1.component';

describe('Dashboad1Component', () => {
  let component: Dashboad1Component;
  let fixture: ComponentFixture<Dashboad1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Dashboad1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Dashboad1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
