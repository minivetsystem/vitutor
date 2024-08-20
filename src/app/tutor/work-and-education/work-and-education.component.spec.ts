import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkAndEducationComponent } from './work-and-education.component';

describe('WorkAndEducationComponent', () => {
  let component: WorkAndEducationComponent;
  let fixture: ComponentFixture<WorkAndEducationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkAndEducationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkAndEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
