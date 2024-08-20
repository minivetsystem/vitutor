import { Component, OnInit } from '@angular/core';
import { AsyncRequestService } from '@app/core/services/async-request.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {
// change = false;
  result;
  constructor(private async: AsyncRequestService) {
    // this.async.getRequest(`profile/check-profile-status`).subscribe(res => {
    //   this.result = res;
    //  }, err => {
    //    // this.router.navigate(['/']);
    //    // return false;
    //  });
   }

  ngOnInit() {
  }

  

}
