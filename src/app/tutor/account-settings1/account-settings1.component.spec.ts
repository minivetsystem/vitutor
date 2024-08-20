import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettings1Component } from './account-settings1.component';

describe('AccountSettings1Component', () => {
  let component: AccountSettings1Component;
  let fixture: ComponentFixture<AccountSettings1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSettings1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSettings1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
