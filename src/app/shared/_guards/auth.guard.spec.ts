import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AsyncRequestService } from '../../core/services/async-request.service';
import { LocalStorageService, ToggleClassService } from '../../shared/_services/index';




fdescribe('AuthGuard', () => {
  let cookieService: any;
  let toggleClassService: any;
  let LocalStorageService: any;
  let httpTestingController: HttpTestingController;
  let asyncRequestService: AsyncRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ AuthGuard,

        { provide: ToggleClassService, useValue: toggleClassService },
        { provide: LocalStorageService, useValue: LocalStorageService },
        { provide: HttpTestingController, useValue: httpTestingController },
        { provide: AsyncRequestService, useValue: asyncRequestService },
      ],
      imports: [RouterTestingModule , HttpClientTestingModule ]
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
