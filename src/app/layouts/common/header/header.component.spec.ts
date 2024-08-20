import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ReactiveFormsModule , FormsModule} from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

fdescribe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let userService: any ;
  let cookieService: any;
  let toggleClassService: any;
  let LocalStorageService: any;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent,  ],
      imports: [RouterTestingModule , HttpClientTestingModule , ReactiveFormsModule , FormsModule,
        TypeaheadModule ],
      providers : [

        // { provide: CookieService, useValue: cookieService },

        { provide: LocalStorageService, useValue: LocalStorageService },
        { provide: HttpTestingController, useValue: httpTestingController },
      ],
      schemas : [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
