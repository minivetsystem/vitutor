import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSidebar1Component } from './student-sidebar1.component';

describe('StudentSidebar1Component', () => {
  let component: StudentSidebar1Component;
  let fixture: ComponentFixture<StudentSidebar1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentSidebar1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentSidebar1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
