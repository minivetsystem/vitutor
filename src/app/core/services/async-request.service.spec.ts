import { TestBed } from '@angular/core/testing';

import { AsyncRequestService } from './async-request.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';


xdescribe('AsyncRequestService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule , RouterTestingModule ]
  }));

  it('should be created', () => {
    const service: AsyncRequestService = TestBed.get(AsyncRequestService);
    expect(service).toBeTruthy();
  });
});
