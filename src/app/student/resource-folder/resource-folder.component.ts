import { AfterViewInit, Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncRequestService } from '@app/core/services/async-request.service';
import { NoWhitespaceValidator } from '@app/shared/_helpers';
import { AlertService , AttachmentService, LocalStorageService} from '@app/shared/_services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Location } from '@angular/common';
import { constantVariables } from '@app/shared/_constants/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../common/services/common.service';
declare const $: any;


@Component({
  selector: 'app-resource-folder',
  templateUrl: './resource-folder.component.html',
  styleUrls: ['./resource-folder.component.scss']
})
export class ResourceFolderComponent implements OnInit,AfterViewInit {
  selected: {startDate: moment.Moment, endDate: moment.Moment};
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  id: string  = this.route.snapshot.paramMap.get("id");
  folderLists: any;
  fileLists: any;
  getFolderDetailUrl : string = 'resources/get-folder/';
  createChildFolderUrl : string = 'resources/create-folder';
  createChildFileUrl : string = 'resources/resource-upload-file';
  deleteFileUrl : string = 'resources/resource-delete-file/';
  deleteFolderUrl : string = 'resources/delete-folder/';
  folderListUrl : string = 'resources/list-folders/';
  fileListUrl : string = 'resources/list-files/';
  updateFolderUrl : string = 'resources/update-folder';
  downloadFile : string = 'resources/download-file/';
  recordNotFound: boolean =  true;
  modalRef: BsModalRef;  
  addChildFolderForm: FormGroup;
  addChildFileForm: FormGroup;
  submitted: boolean = false;
  response: any;
  fileFormaterror: boolean = false;
  fileToUpload;
  throttle = 50;
  scrollDistance = 1;
  scrollUpDistance = 2;
  action : string;
  folderId : BigInteger;
  startDate:string;
  endDate: string;
  folderLength :any;
  folderName : any;
  showClearButton: boolean = false;
  dragDestIndex;
  draggedEl;
  draggedElIndex;
  rearranging = false;
  rearrangingDuration = 350;
  draggableElArr = $('.draggable');
  menuToggle;

  constructor(
    private route: ActivatedRoute,
    private asyncRequestService: AsyncRequestService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private notifierService: AlertService,
    private location: Location,
    private attachment: AttachmentService,
    private http: HttpClient,
    private loaderService: NgxSpinnerService,
    private router: Router,
    private localService :LocalStorageService,
    private commonService:CommonService



  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

   }

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.list(null, null);

    
    /**
     * Add File and other field Validation Validation
     * Date 24-09-2020
     */
    this.addChildFileForm = this.formBuilder.group(
      {
        title: [
          null,
          [
            Validators.required,
            NoWhitespaceValidator,
            Validators.maxLength(50),
          ],
        ],
        folder_file: [
          null,
          [
            Validators.required,
          ],
        ],
        description: [
          null,
          [
            
            Validators.maxLength(250),
          ],
        ],        
      },  
    );

    

     /**
     * Add Folder Validation
     * Date 24-09-2020
     */
    this.addChildFolderForm = this.formBuilder.group(
      {
        folder_name: [
          null,
          [
            Validators.required,
            NoWhitespaceValidator,
            Validators.maxLength(50),
          ],
        ],      
      }, 
    );   
  }

  ngAfterViewInit(){


// Update the CSS for each item to be in its correct location based on the order in the array passed
// @param itemEls: the DOM elements, in order, from top left, row by row
// @param columnsCount: the number of columns
// @containerEl: the DOM element of the container for the arranged elements.
// function arrangeItems(itemEls, columnsCount, containerEl, elHeight) {
//   var $containerEl = $(containerEl);
//   columnsCount = ('' + ($containerEl.width()/90)).split('.')[0];
//   // Set height of elements
//   var elWidth = 90;
//   elHeight = elHeight || elWidth;

//   for (var i=0; i<itemEls.length; i++) {
//     var $item = $(itemEls[i]);
//     $item.data('index', i);
//     var pos = {
//       x: (i%columnsCount),
//       y: Math.floor(i/columnsCount)
//     };

//     $item.css({
//       top: pos.y * elHeight + 'px',
//       left: pos.x * elWidth + 'px',
//       width: '80px',
//       height: 'calc(' + elHeight + 'px - 10px)',
//       boxSizing: 'border-box'
//     });
//   }
// }

// Rearrange the items in an array, returning a the modified array.
// @param movedItemIndex: the index of the element being moved to a
//   new position in the array
// @param destinationIndex: the new index being given to the moved element


// arrangeItems(draggableElArr, 4, $('.content'));

$('.draggable').on('dragstart', (e) => {
  this.draggedEl = $(this);
  var sortedArr = [];
  for (var i=0; i< this.folderLists.length; i++) {
    var elIndex = $(this.folderLists[i]).data('index');
     [elIndex] = this.folderLists[i];
  }
  this.folderLists = sortedArr;
  this.draggedElIndex = $(this).data('index');
  $(this).css({opacity: 0, transition: 'all 100ms ease'});
});

$('.draggable').on('dragend', (e) => {
  e.preventDefault();
  $(this).css({opacity: 1, transition: 'all 700ms ease'});
});

$('.draggable').on('dragover', (e) => {
  e.preventDefault();
  if (this.rearranging) {
    return;
  }
  this.dragDestIndex = $(this).data('index');
  this.draggedElIndex = this.draggedEl.data('index');
  if (this.draggedElIndex !== this.dragDestIndex) {
    this.rearranging = true;
    var rearrangedEls = this.rearrangeItems(this.folderLists, this.draggedElIndex, this.dragDestIndex);
    // arrangeItems(rearrangedEls, 4, $('.content'));
    setTimeout(() => { this.rearranging = false }, this.rearrangingDuration);
  }
});

$('.draggable').on('drop', (e) =>  {
  e.preventDefault();
  this.rearranging = false;
});
  }


  change(e) {
    if(e.startDate){
      this.startDate = e.startDate.year()+'-'+(e.startDate.month()+1) + '-' + e.startDate.date() ;
      this.endDate = e.endDate.year()+'-'+(e.endDate.month()+1) + '-' +e.endDate.date();
      this.list(this.startDate,this.endDate);
    }
    
  }

  rearrangeItems(arr, movedItemIndex, destinationIndex) {
    var movedEl = arr.splice(movedItemIndex,1)[0];
    arr.splice(destinationIndex, 0, movedEl);
    return arr;
  };
 


  /**
   * 
   * Get Folder detial
   * api URL: this.getResource
   * Date 24-09-2020
   */

  list(startDate='', endDate=''){
    this.asyncRequestService.postRequest(this.folderListUrl+ this.id , {'folder_id' : this.id , start_date: startDate , end_date: endDate}).subscribe(
      (response: any) => {
        if(response.folder_name){
          this.folderName = response.folder_name[0];
        }
        this.folderLists = response.data.data;
        if(this.folderLists.length > 0){
          this.recordNotFound = false;
        }
        if((response.data.next_page_url == null) && (this.folderLists.length < 10)){  
          this.asyncRequestService.postRequest(this.fileListUrl+ this.id , {'folder_id' : this.id , start_date: startDate , end_date: endDate}).subscribe(
            (response: any) => {
              this.fileLists = response.data.data; 
              if(response.data.data.length > 0){
                this.recordNotFound = false;     

              }    
            },
            (errorResponse) => {
              if (errorResponse) {
                this.notifierService.error(errorResponse.error.error_message);
                setTimeout(() => {
                  this.goBack();
                }, 1000);
      
              }
            }
          );
        }     
        if((startDate != null) && (endDate != null)){
          this.showClearButton = true;
        }else{
          this.showClearButton = false;
          this.selected = null 
        }   
      },
      (errorResponse) => {
        if (errorResponse) {
          this.notifierService.error(errorResponse.error.error_message);
          setTimeout(() => {
            this.goBack();
          }, 1000);
        }
      }
      
    );      
  }

  goBack() {
    this.location.back();
  } 

  deleteFile(file_id){
    this.asyncRequestService.deleteRequest(this.deleteFileUrl + file_id).subscribe(
      (response: any) => {
        if(response.success){
          this.notifierService.success(response.success_message);
          this.ngOnInit();
        }
        
      },
      (errorResponse) => {
        if (errorResponse) {
          this.notifierService.error(errorResponse.error.error_message);
        }
      }
      
    );   
  }

  deleteFolder(folder_id){
    this.asyncRequestService.deleteRequest(this.deleteFolderUrl + folder_id).subscribe(
      (response: any) => {
        if(response.success){
          this.notifierService.success('Folder Successfully Deleted');
          this.ngOnInit();
        }
      },
      (errorResponse) => {
        if (errorResponse) {
          this.notifierService.error(errorResponse.error.error_message);
        }
      }
    );   
  }

  Downloadfile(id, name) {
    const Url = this.downloadFile + id + '/' +this.id ;
    this.attachment.downloadFile(Url, name);
  }

//pending function view file
  viewFile(fileUrl){
    window.open(fileUrl, '_blank');

  }



  /**
   * Open Folder Modal
   * Date 23-09-2020
   */
  openCreateFolderModal(template: TemplateRef<any>) {  
    this.action = 'Add';
    this.modalRef = this.modalService.show(  
      template,  
      Object.assign({}, { class: 'gray modal-lg' })  
    );  
  } 

  openUpdateFolderModal(template: TemplateRef<any> , folder_id){
    this.asyncRequestService.getRequest(this.getFolderDetailUrl + folder_id).subscribe(
      (response: any) => {
          this.action = 'Update';
        if(response.data){
          this.addChildFolderForm.setValue({
              folder_name: response.data.folder_name,          
          });
          this.folderId = folder_id;
  
          this.modalRef = this.modalService.show(  
            template,  
            Object.assign({}, { class: 'gray modal-lg' })  
          );  
        }        
      },
      (errorResponse) => {
        if (errorResponse) {
          this.notifierService.error(errorResponse.error.error_message);
        }
      }
    );  
  }

  
  /**
   * Open File Modal
   * Date 23-09-2020
   */
  openCreateFileModal(templateFile: TemplateRef<any>) {  
    this.modalRef = this.modalService.show(  
      templateFile,  
      Object.assign({}, { class: 'gray modal-lg' })  
    );  
  }  


  onScrollDown(){

  }

  /**
   * Handle Folder Form Errors
   * Date 23-09-2020
   */
  get renderErrors() {
    return this.addChildFolderForm.controls;
  }

  /**
   * Handle File Form Errors
   * Date 24-09-2020
   */

  get renderFileErrors() {
    return this.addChildFileForm.controls;
  }

  /**
   * Submit Child Folder form
   * Api this.createChildFolderUrl
   * parent key used for folder id
   * Append Form value and folder id in parent param
   * Date 23-09-2020
   */
  onFolderSubmit(form_type){
    this.submitted = true;

    if (this.addChildFolderForm.invalid) {
      this.addChildFolderForm.markAllAsTouched();
      return;
    }

    if(form_type == 'Add'){
      var url = this.createChildFolderUrl;
      var value = Object.assign({},this.addChildFolderForm.value,{'parent': this.id});
    }else if((form_type == 'Update') && (this.id != null)){
      var url = this.updateFolderUrl;
      var value = Object.assign({},this.addChildFolderForm.value,{'folder_id': this.folderId});
    }

    this.asyncRequestService
      .postRequest(url, value)
      .subscribe(
        (response) => {
          this.response = response;
          this.notifierService.success(this.response.success_message);
          // resetting form
          this.submitted = false;
          this.addChildFolderForm.reset();
          this.modalRef.hide();
          setTimeout(() => {
            this.ngOnInit();
          }, 1000);
          
        
        },
        (errorResponse) => {
          if (errorResponse) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      );
  }

   /**
   * Check Upload file type 
   * Save file details in fileUpload variable
   * Date 24-09-2020
   */
  imageUpload(files: FileList) {
    if(files.length == 0){
      // this.addChildFileForm.controls['folder_file'].reset();
      this.fileToUpload = undefined
      return;
    }
    const File_type = files.item(0).type;
    if (
      File_type == "image/jpeg" ||
      File_type == "image/png" ||
      File_type == "application/pdf"||
      File_type == "application/doc" ||
      File_type == "application/docx"||
      File_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"||
      File_type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"||
      File_type == 'application/msword'
    ) {
      if (files.length) {
        this.fileFormaterror = false;
        this.fileToUpload = files.item(0);
      }
    } else {
      this.fileFormaterror = true;
      

    }
  }

   /**
   * Submit Child Folder form
   * Api this.createChildFileUrl
   * Use formData 
   * Date 24-09-2020
   */
  onFileSubmit(){
    this.submitted = true;

    if (this.addChildFileForm.invalid) {
      this.addChildFileForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append(
      "folder_file",      
      this.fileToUpload,
      this.fileToUpload.name
    );
    formData.append(
      "title",
      this.addChildFileForm.value.title
    );
    formData.append(
      "description",
      this.addChildFileForm.value.description
    );
    formData.append(
      "folder_id",
      this.id
    );
    var options = { content: formData };   
    this.asyncRequestService
      .uploadFiles(this.createChildFileUrl, formData)
      .subscribe(
        (response) => {
          this.response = response;
          this.notifierService.success(this.response.success_message);
          // resetting form
          this.submitted = false;
          this.fileToUpload = null;
          this.addChildFileForm.reset();
          this.modalRef.hide();
          setTimeout(() => {
            this.ngOnInit();
          }, 1000);
          
        
        },
        (errorResponse) => {
          if (errorResponse) {
            this.notifierService.error(errorResponse.error.error_message);
          }
        }
      );
  }

  doubleClick(item){
    this.router.navigate(['/student/resource-folder/' , item.id])
  }

  justClicked = false;
doubleClicked = false;

myFunction(item) {
  if (this.justClicked === true) {
    this.doubleClicked = true;
    this.doubleClick(item);
  } else {
    this.justClicked = true;
    setTimeout(() => {
      this.justClicked = false;
      if (this.doubleClicked === false) {
        // this.singleClick();
      }
      this.doubleClicked = false;
    }, 500);
  }
}


closeModal(){
  this.addChildFileForm.reset();
  this.addChildFolderForm.reset();
  this.modalRef.hide();
}



}
