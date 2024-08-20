import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentHeader1Component } from './student-header1.component';

describe('StudentHeader1Component', () => {
  let component: StudentHeader1Component;
  let fixture: ComponentFixture<StudentHeader1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentHeader1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentHeader1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
