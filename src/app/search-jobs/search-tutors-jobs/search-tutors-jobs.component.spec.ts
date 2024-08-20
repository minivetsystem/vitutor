import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTutorsJobsComponent } from './search-tutors-jobs.component';

describe('SearchTutorsJobsComponent', () => {
  let component: SearchTutorsJobsComponent;
  let fixture: ComponentFixture<SearchTutorsJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTutorsJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTutorsJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
