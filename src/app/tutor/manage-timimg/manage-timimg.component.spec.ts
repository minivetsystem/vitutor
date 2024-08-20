import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTimimgComponent } from './manage-timimg.component';

describe('ManageTimimgComponent', () => {
  let component: ManageTimimgComponent;
  let fixture: ComponentFixture<ManageTimimgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTimimgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTimimgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
