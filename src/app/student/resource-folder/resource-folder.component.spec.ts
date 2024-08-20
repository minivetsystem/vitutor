import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceFolderComponent } from './resource-folder.component';

describe('ResourceFolderComponent', () => {
  let component: ResourceFolderComponent;
  let fixture: ComponentFixture<ResourceFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
