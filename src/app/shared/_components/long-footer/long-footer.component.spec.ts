import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongFooterComponent } from './long-footer.component';

describe('LongFooterComponent', () => {
  let component: LongFooterComponent;
  let fixture: ComponentFixture<LongFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
