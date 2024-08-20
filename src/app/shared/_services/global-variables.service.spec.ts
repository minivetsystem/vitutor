import { TestBed } from '@angular/core/testing';

import { GlobalVariablesService } from './global-variables.service';

fdescribe('GlobalVariablesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalVariablesService = TestBed.get(GlobalVariablesService);
    expect(service).toBeTruthy();
  });
});
