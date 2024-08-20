
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewTutorService } from '../view-tutor.service';
import { AlertService, AttachmentService, LocalStorageService } from '@app/shared/_services/index';
import { DomSanitizer } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';
import { AsyncRequestService } from "@app/core/services/async-request.service";
import { CommonService } from '@app/common/services/common.service';

declare var $: any;

interface TutorProfile {
  success_message: string;
  data: {
    email: string;
    certificates: [];
    courses: [];
    qualification: [];
    timeSlot:[];
    skills: [];
    subjects: [];
    user_activty: [];
    user_reviews: [];
    verification_docs: [];
    total_exp:string;
    user_profile: {id: number, user_id: number
    };
  };
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  tutorSlug;
  getList : string = 'student/invite-job-list';
  sub;
  userProfile;
  userReviews;
  courses;
  slots = [];
  qualifications;
  skills;
  subjects;
  certificates;
  result;
  skillSet;
  totalExp;
  jobList;
  sendInvite = {job_id: '', message: '', tutor_id: 0 };
  showVideo: any;
  jobsList;
  invitedClicked = false;
  job = {job_id: undefined};
  constructor(
    private activateRoute: ActivatedRoute, 
    private asyncRequestService: AsyncRequestService,
    private serachService: ViewTutorService, 
    private notifier: AlertService,
    private attachmentService: AttachmentService,
    private sanitizer: DomSanitizer,
    private meta: Meta,
    private commonService:CommonService
    ) { 
      this.commonService.sendInvite.subscribe((response:any)=>{
          if(response && response != 0)
          {
            this.job = response;
          }else{
            return;
          }
        });
    }

  ngOnInit() {
    // this.getJobsList();
    this.sub = this.activateRoute.params.subscribe(params => {
      this.tutorSlug = params.slug; // (+) converts string 'id' to a number
      // this.getJobList();
      this.getTutorProfile(this.tutorSlug);
      this.meta.addTags([{name: 'og:url', content : 'app.viTutors.com'},
   {name : 'og:type', content : 'article'}, {name: 'og:title', content : this.tutorSlug},
   {name : 'og:image', content: 'https://vitutors-dev.s3-us-west-1.amazonaws.com/user_data/user_17_5f9a99f508215/profile-picture/UjuhXMt4ckixj6RUUeCjPFy9QCQbu3ILYtt29u3y.jpeg'},
    {name : 'og:description', content: 'This is a very good tutor'}]);
   });
  }

  getTutorProfile(slug) {
    this.serachService.getTutorProfile(slug).subscribe( (res: TutorProfile) => {
      this.totalExp = res.data.total_exp;
      this.userProfile = res.data.user_profile;
      this.userReviews = res.data.user_reviews;
      this.subjects = res.data.subjects;
      this.certificates = res.data.certificates;
      this.skills = res.data.skills;
      this.courses = res.data.courses;
      this.qualifications = res.data.qualification;
      this.result = res.data;
      // this.slots = res.data.timeSlot;
      this.sendInvite.tutor_id = res.data.user_profile.user_id;
      this.skillSet = res.data.skills.map((e: {designation: string}) => {
        return e.designation;
      });
      res.data && res.data.timeSlot && res.data.timeSlot.length > 0 ?  res.data.timeSlot.map((x:any) => {
        var object= {};
        object['day'] = x.day_name;
        object['slots'] = res.data.timeSlot.filter((y : any) => y.day_name == x.day_name);
        if(this.slots.findIndex(z => z.day == x.day_name) == -1) {
          this.slots.push(object);
        }
        return object;
      }) : [];
      this.showVideo = this.sanitizer.bypassSecurityTrustResourceUrl(this.userProfile.overview_video);
      this.showVideo = this.showVideo.changingThisBreaksApplicationSecurity
      this.getJobList(this.sendInvite.tutor_id);
    });
  }

  getJobList(id) {
    this.asyncRequestService.postRequest(this.getList,{id}).subscribe(
      (response: any) => {
        this.jobList = response.data;
        if(this.job.job_id) {
         this.sendInvite.job_id = this.job.job_id
        }
      }
    );
  }

  closeInvitation(){
    this.sendInvite.job_id =  '';
     this.sendInvite.message = '';
     this.invitedClicked = false;
     $('#send_invite').modal('hide');
  }

  inviationSend() {
    this.invitedClicked = true
    if(!this.sendInvite.job_id || this.sendInvite.message == ''){
      return;
    }
    
   this.serachService.sendInvite(this.sendInvite).subscribe((res: any) => {
     this.notifier.success(res.success_message);
     this.sendInvite.job_id =  '';
     this.sendInvite.message = '';
     $('#send_invite').modal('hide');
     this.invitedClicked = false;
   }, err => {
    //  this.invitedClicked = false;
     this.notifier.error( err.error.error_message);
   });
 }
 favTutor() {
   const body = { favourite_tutor : 1 };
   if (this.result.is_fav === 1) {
     body.favourite_tutor = 0;
   }
   this.serachService.favTutor(this.tutorSlug, body).subscribe((res: any) => {
     this.notifier.success(res.success_message);
     this.result.is_fav = body.favourite_tutor;
   });
 }
 onError(event) {
   event.target.src = 'https://via.placeholder.com/50';
 }

 downloadFile(id: number, fileName: string) {
  let fileUrl = "attachment/user-attachment/" + id;
  this.attachmentService.downloadFile(fileUrl, fileName);
}

shareFacebook() {
  window.open(`http://www.facebook.com/dialog/feed?app_id=670160023889527&name=Facebook%20Dialogs&description=testing&redirect_uri=http%3A%2F%2F127.0.0.1:5000`)
  // window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&title="test"&description="testing"`);
}

// getJobsList() {
//   this.serachService.fetchJobList().subscribe((res: any)=> {
//     this.jobsList = res.data;
//   });
// }
}



