import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageResourceComponent } from './manage-resource.component';

describe('ManageResourceComponent', () => {
  let component: ManageResourceComponent;
  let fixture: ComponentFixture<ManageResourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageResourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
