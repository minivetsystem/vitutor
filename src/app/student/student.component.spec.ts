import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentComponent } from './student.component';
import { StudentHeaderComponent } from '../student/student-header/student-header.component';
import { StudentFooterComponent } from '../student/student-footer/student-footer.component';
import { StudentSidebarComponent } from '../student/student-sidebar/student-sidebar.component';
import { SearchBoxComponent } from '../shared/_components/search-box/search-box.component'
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ModalModule } from 'ngx-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadModule, TypeaheadDirective, TypeaheadConfig } from 'ngx-bootstrap/typeahead';
import { AsyncRequestService } from "@app/core/services/async-request.service";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocalStorageService, AlertService, UserService, ToggleClassService } from "@app/shared/_services/index";
import { CookieService } from "ngx-cookie-service";


fdescribe('StudentComponent', () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let notifierService : AlertService ;
  let userService: any ;
  let cookieService: any;
  let toggleClassService: any;
  let LocalStorageService: any
  let httpTestingController : HttpTestingController;
  let asyncRequestService : AsyncRequestService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      
      declarations: [ StudentComponent , StudentFooterComponent , StudentHeaderComponent , 
        StudentSidebarComponent , SearchBoxComponent ],
      
      imports: [ ReactiveFormsModule , RouterTestingModule , PerfectScrollbarModule, TypeaheadModule,
        ModalModule.forRoot() , NgbModule ],
      
      providers:[
        { provide: UserService, useValue: userService },
        { provide: AlertService, usevalue: notifierService },
        { provide: CookieService, useValue: cookieService },
        { provide: ToggleClassService, useValue: toggleClassService },
        { provide: LocalStorageService, useValue: LocalStorageService },
        { provide: HttpTestingController, useValue: httpTestingController },
        { provide: AsyncRequestService, useValue: asyncRequestService },
        { provide: TypeaheadConfig, useValue: TypeaheadConfig}
        ],
      
      schemas: [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
