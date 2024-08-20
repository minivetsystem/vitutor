import { TestBed } from '@angular/core/testing';

import { SearchTutorService } from './search-tutor.service';

describe('SearchTutorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearchTutorService = TestBed.get(SearchTutorService);
    expect(service).toBeTruthy();
  });
});
