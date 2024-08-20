import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '@app/shared/_services';
import { NoWhitespaceValidator } from '@app/shared/_helpers';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TypeaheadMatch } from 'ngx-bootstrap';

@Component({
  selector: "app-page-not-found",
  templateUrl: "./page-not-found.component.html",
  styleUrls: ["./page-not-found.component.scss"],
  providers: []
})
export class PageNotFoundComponent implements OnInit {
  searchForm: FormGroup;
  searchSubmitted = false;
  resetMethodCalled = false;
  asyncSelected: string;
  typeaheadLoading: boolean;
  dataSource: Observable<any>;
  noResult = false;
  searchData: any = [];

  constructor(
    private asyncRequestService: AsyncRequestService,
    private formBuilder: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.asyncSelected);
    }).pipe(mergeMap((token: string) => this.getStatesAsObservable(token)));
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      tutor: [
        null,
        [Validators.required, NoWhitespaceValidator, Validators.minLength(2)]
      ]
    });
    const url = `subject/search-subject?q=${" "}`;

    // if(localStorage.getItem('searchdata')){
    this.asyncRequestService.getRequest(url).subscribe(response => {
      localStorage.setItem("searchdata", JSON.stringify(response));
    });
    this.searchData.push(JSON.parse(localStorage.getItem("searchdata")));
  }

  getStatesAsObservable(token: string): Observable<any> {
    return this.searchData.map(results =>
      results.filter(res => res.toLowerCase().indexOf(token.toLowerCase()) > -1)
    );
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.onSubmit();
  }

  typeaheadNoResults(event: boolean): void {
    this.noResult = event;
  }

  get renderErrors() {
    return this.searchForm.controls;
  }

  /**
   * @purpose submit data to search route
   * @method : onSubmit
   * @date 2019-09-01
   */
  onSubmit() {
    this.searchSubmitted = true;

    if (!this.searchForm.valid) {
      return;
    }
    let latLong = [];
    if (this.localStorageService.get("longitude")) {
      latLong["longitude"] = this.localStorageService.get("longitude");
    }
    if (this.localStorageService.get("longitude")) {
      latLong["latitude"] = this.localStorageService.get("latitude");
    }
    var navigateTo = "/search";
    let queryParams = {
      availability: "Sun,Mon,Tue,Fri,Thu,Wed,Sat",
      lessonMode: "Online,In Person",
      "distance-range-from": "0",
      "distance-range-to": "100",
      gender: "Male,Female",
      "hourly-range-from": "0",
      "hourly-range-to": "500",
      tutor: this.searchForm.controls.tutor.value,
      "tutor-age-range-from": "0",
      "tutor-age-range-to": "100",
      longitude: latLong["longitude"],
      latitude: latLong["latitude"],
      language: ["All"],
    };
    this.router.navigate([navigateTo], { queryParams: queryParams });
  }
}
