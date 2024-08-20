import { TestBed } from '@angular/core/testing';

import { JobdetailService } from './jobdetail.service';

describe('JobdetailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JobdetailService = TestBed.get(JobdetailService);
    expect(service).toBeTruthy();
  });
});
