import { TestBed } from '@angular/core/testing';

import { ViewTutorService } from './view-tutor.service';

describe('ViewTutorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ViewTutorService = TestBed.get(ViewTutorService);
    expect(service).toBeTruthy();
  });
});
