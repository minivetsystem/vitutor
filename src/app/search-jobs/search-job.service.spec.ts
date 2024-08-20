import { TestBed } from '@angular/core/testing';

import { SearchJobService } from './search-job.service';

describe('SearchJobService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearchJobService = TestBed.get(SearchJobService);
    expect(service).toBeTruthy();
  });
});
