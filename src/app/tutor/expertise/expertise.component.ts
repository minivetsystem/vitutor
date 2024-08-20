import { Component, OnInit } from '@angular/core';
import { TutorService } from '../tutor.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, LocalStorageService, UserService } from '@app/shared/_services';
import { constantVariables } from '@app/shared/_constants/constants';
import { CommonService } from '@app/common/services/common.service';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import {environment} from '../../../environments/environment'

@Component({
  selector: 'app-expertise',
  templateUrl: './expertise.component.html',
  styleUrls: ['./expertise.component.scss']
})
export class ExpertiseComponent implements OnInit {
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  subjectForm: FormGroup;
  
  allCategoriesList = [];
  selectedSubjects = [];
  courseCategories = [];
  submitState = false;
  tutorSubjects;
  menuToggle;
  result:any ={result : {profile_completed: true}}
  contactUs=environment.contactUsLink
  constructor(
    private tutorService: TutorService,
    private formBuilder: FormBuilder,
    private notifierService: AlertService,
    private commonService: CommonService,
    private async: AsyncRequestService
  ) {
    this.subjectForm = this.formBuilder.group({
      subjects: this.formBuilder.array([]),
    });
   this.profileComplete();
   }

   profileComplete(){
    this.async.getRequest(`profile/check-profile-status`).subscribe(res => {
      this.result = res;
     }, err => {
       // this.router.navigate(['/']);
       // return false;
     });
   }
   get subjectsArray(): FormArray {
    return this.subjectForm.get('subjects') as FormArray;
  }

   get category(): FormGroup {
    return this.formBuilder.group({
      category_id: '',
      sub_categories: this.formBuilder.array([]),
    });
  }

  get subcategory(): FormArray {
    return this.category.get('sub_categories') as FormArray;
  }
  get subcategories(): FormGroup {
    return this.formBuilder.group({
      selected_sub_category: [null],
      sub_category_id: [null],
    });
  }
  trackByIdentity = (index: number, item: any) => item;
  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.fetchAllCategories();
    this.fetchSubjects();
    this.expertiseInit();
    this.fetchStudentLevel();
   }

   fetchAllCategories() {
     let categories;
     this.tutorService.fetchSubjects().subscribe((response: any) => {
         categories = response.data.sort((a, b) => (a.category_name > b.category_name) ? 1 : ((b.category_name > a.category_name) ? -1 : 0));
         for (const cat of categories) {
          cat.children.sort((a, b) => {
            return (a.category_name > b.category_name) ? 1 : ((b.category_name > a.category_name) ? -1 : 0);
        });
         }


         this.courseCategories = categories;

         for (let index = 0; index < this.courseCategories.length; index++) {
           (this.subjectForm.get('subjects') as FormArray).push(this.category);
         }
         const category = (this.subjectForm.get('subjects') as FormArray).controls;

         for (let index = 0; index < category.length; index++) {
           // set first collape open
           if (index === 0) {
             this.courseCategories[index].parent_id = 1;
           }
           const element = this.courseCategories[index];

           const children = element.children;

           if (children.length) {
             for (let j = 0; j < children.length; j++) {
               (this.subjectsArray.controls[index].get('sub_categories') as FormArray).push(
                 this.subcategories
               );
             }
           }
         }
       },
       (errorResponse: any) => {
         if (errorResponse) {
           this.notifierService.error(errorResponse.error.error_message);
         }
       }
     );
   }

  onSubmit() {
    /** Prepare data for request */
    let expire = this.expertiseLevel.value;
    if(this.expertiseLevel.invalid){
      this.expertiseLevel.markAllAsTouched();
      return;
    }
    const postArray = this.subjectForm.value.subjects;
    for (let i = postArray.length - 1; i >= 0; i--) {
      const category = postArray[i];
      if (category.sub_categories.length) {
        for (let o = category.sub_categories.length - 1; o >= 0; o--) {
          const subcategory = category.sub_categories[o];
          if (!subcategory.selected_sub_category) {
            category.sub_categories.splice(o, 1);
          }
        }
      } else {
        postArray.splice(i, 1);
      }
    }
    this.tutorService.saveTutorSubjects(postArray).subscribe((result: any) => {
      if(result.success){
        this.notifierService.success(result.success_message);
        this.profileComplete();
        this.fetchSubjects();
      } else {
        this.notifierService.error(result.error_message);

      }
      
    }, err => {
      this.notifierService.error(err.error_message);
    });

    // call the api with prepare data
  }

  updateSubcategoryStatus(parentIndex: number, childIndex: number) {
    this.submitState = true;
    if (
      this.courseCategories[parentIndex].children[childIndex].tutor_has_subject
        .categories_sub_id
    ) {
      this.courseCategories[parentIndex].children[
        childIndex
      ].tutor_has_subject.categories_sub_id = this.courseCategories[
        parentIndex
      ].children[childIndex].id;
    } else {
      this.courseCategories[parentIndex].children[
        childIndex
      ].tutor_has_subject.categories_sub_id = 0;
    }
  }

  removeRecord(
    id: number,
    idOfCategegory: number,
    subjectIndex: number,
    currentIndex: number
  ) {
    if (!id) {
      this.notifierService.error("Unable to connect server please try again.");
    }

    // slice array
    if (this.tutorSubjects[subjectIndex].subcat.length === 1) {
      this.tutorSubjects[subjectIndex].subcat.splice(currentIndex, 1);
      this.tutorSubjects.splice(subjectIndex, 1);
    } else {
      this.tutorSubjects[subjectIndex].subcat.splice(currentIndex, 1);
    }
    // unset value from courseCategories : array to unchecked checkbox when user delete subject
    for (let index = 0; index < this.courseCategories.length; index++) {
      const child = this.courseCategories[index];
      if (child.children.length) {
        for (let x = 0; x < child.children.length; x++) {
          // compare both values and then unset value
          if (
            this.courseCategories[index].children[x].tutor_has_subject
              .categories_sub_id === idOfCategegory
          ) {
            this.courseCategories[index].children[
              x
            ].tutor_has_subject.categories_sub_id = 0;
          }
        }
      }
    }

    this.tutorService
      .deleteSubject(id)
      .subscribe(
        (response: any) => {
          this.notifierService.success(response.success_message);
          this.submitState = false;
        },
        (errorResponse) => {
          if (errorResponse) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      );
  }

  fetchSubjects() {
    this.tutorService.fetchTutorSelectedSubjects().subscribe(
      (response: any) => {
        this.tutorSubjects = response.data;
      },
      (errorResponse: any) => {
        if (errorResponse) {
          this.notifierService.error(errorResponse.error.error_message);
        }
      }
    );
  }

  // student level

  studentLevelArray = [{name:'Elementary'}, {name:'Middle School'}, {name:'High School'}, {name:'College'},{name:'Adult'}]
  // student_level = []

  expertiseLevel: FormGroup;

  expertiseInit(){
    this.expertiseLevel = this.formBuilder.group({
      student_level: ['', [Validators.required]]
    })
  }
  onChange(event) {    
    let value= this.expertiseLevel.value;
    if(value.student_level.length == 0){
      return;
    }
    value.student_level = value.student_level.join();
    this.tutorService.updateClassLevel(this.expertiseLevel.value).subscribe((res: any) => {
      if(res.success){
        this.notifierService.success(res.success_message);
        this.profileComplete();
      }
    }, err => {this.notifierService.error(err.error.error_message || 'Unable to update student level')});
}
onRemove(event) {
  let value= this.expertiseLevel.value;
  if(value.student_level.length == 0){
    return;
  }
  // value.student_level = value.student_level.join();
  this.tutorService.updateClassLevel(this.expertiseLevel.value).subscribe((res: any) => {
    if(res.success){
      this.notifierService.success(res.success_message);
    }
  }, err => {this.notifierService.error(err.error.error_message || 'Unable to update student level')});
  
}

// updateStudentLevel(){
//   this.expertiseLevel.markAllAsTouched();
//   if(this.expertiseLevel.invalid){
//     return
//   }
//   let value= this.expertiseLevel.value;
//   value.student_level = value.student_level.join();
//   this.tutorService.updateClassLevel(this.expertiseLevel.value).subscribe((res: any) => {
//     if(res.success){
//       this.notifierService.success(res.success_message);
//     }
//   }, err => {this.notifierService.error(err.error.error_message || 'Unable to update student level')});
// }

fetchStudentLevel(){
  this.tutorService.fetchClassLevel().subscribe((res:any)=> {
    if(res.success){
      if(res.data.length > 0){
      let studentLevel = res.data.map(ele => ele.class_level);
      this.expertiseLevel.setValue({student_level : studentLevel});
      this.expertiseLevel.updateValueAndValidity();
      }
      
    }
  }, err => {
    this.notifierService.error(err.error.error_mssage || 'Unbale to fetch Student level')
  })
}

}
