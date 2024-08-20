import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoinHeaderComponent } from './loin-header.component';

describe('LoinHeaderComponent', () => {
  let component: LoinHeaderComponent;
  let fixture: ComponentFixture<LoinHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoinHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoinHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
