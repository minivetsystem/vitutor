import { TestBed } from '@angular/core/testing';

import { ViewOfferService } from './view-offer.service';

describe('ViewOfferService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ViewOfferService = TestBed.get(ViewOfferService);
    expect(service).toBeTruthy();
  });
});
