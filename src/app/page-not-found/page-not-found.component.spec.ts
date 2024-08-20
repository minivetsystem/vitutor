import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotFoundComponent } from './page-not-found.component';
import { HeaderComponent } from '../../layouts/common/header/header.component'
import { FooterComponent } from '../../layouts/common/footer/footer.component'
import { SearchBoxComponent } from '../../shared/_components/search-box/search-box.component'
import { ReactiveFormsModule , FormsModule} from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing'
import { AsyncRequestService } from "@app/core/services/async-request.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocalStorageService, AlertService, UserService, ToggleClassService } from "@app/shared/_services/index";
import { CookieService } from "ngx-cookie-service";
import { NgSelectModule } from '@ng-select/ng-select';
import { TypeaheadModule } from 'ngx-bootstrap';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let notifierService : AlertService ;
  let userService: any ;
  let cookieService: any;
  let toggleClassService: any;
  let LocalStorageService: any
  let httpTestingController : HttpTestingController;
  let asyncRequestService : AsyncRequestService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageNotFoundComponent, HeaderComponent, FooterComponent, SearchBoxComponent ],
      imports:[ReactiveFormsModule, FormsModule, NgSelectModule,
              RouterTestingModule,
              // ModalModule.forRoot(),
              // PasswordStrengthMeterModule,
              HttpClientTestingModule,TypeaheadModule],
      providers:[
        { provide: UserService, useValue: userService },
        { provide: AlertService, usevalue: notifierService },
        { provide: CookieService, useValue: cookieService },
        { provide: ToggleClassService, useValue: toggleClassService },
        { provide: LocalStorageService, useValue: LocalStorageService },
        { provide: HttpTestingController, useValue: httpTestingController },
        { provide: AsyncRequestService, useValue: asyncRequestService },
        // { provide: PasswordStrengthValidator, useValue: PasswordStrengthValidator},
      ],
      schemas: [NO_ERRORS_SCHEMA , CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
