import { HttpClient } from '@angular/common/http';
import { Component, OnInit , TemplateRef, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AsyncRequestService } from "@app/core/services/async-request.service";
import { AlertService, LocalStorageService } from "@app/shared/_services/index";
import { constantVariables } from '@app/shared/_constants/constants';

import {
  NoWhitespaceValidator,
} from "@app/shared/_helpers/index";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import {
  CdkDrag,
  CdkDragStart,
  CdkDropList, CdkDropListContainer, CdkDropListGroup,
  moveItemInArray,
  CdkDragDrop,
  CdkDragEnter,
  CdkDragMove
} from "@angular/cdk/drag-drop";
import { CommonService } from '@app/common/services/common.service';
import { Router } from '@angular/router';
declare const $:any;



@Component({
  selector: 'app-manage-resource',
  templateUrl: './manage-resource.component.html',
  styleUrls: ['./manage-resource.component.scss']
})
export class ManageResourceComponent implements OnInit, AfterViewInit {
  selected: {startDate: moment.Moment, endDate: moment.Moment};
  swalErrorOption = constantVariables.swalErrorOption;
  swalSuccessOption = constantVariables.swalSuccessOption;
  swalInfoOption = constantVariables.swalInfoOption;
  swalWarningOption = constantVariables.swalWarningOption;
  addResourceFolderForm: FormGroup;
  submitted: boolean = false;
  response: any;
  getResource : string = 'resources/list-folders';
  createFolderUrl : string = 'resources/create-folder';
  getFolderDetail : string = 'resources/get-folder/';
  updateFolder : string = 'resources/update-folder';
  deleteFolderUrl : string = 'resources/delete-folder/';
  modalRef: BsModalRef;  
  recordNotFound: boolean =  false;
  folderLists: any = [];
  throttle = 50;
  scrollDistance = 1;
  scrollUpDistance = 2;
  newFolderList: any;
  example: string;
  nextUrl: any;
  action : string;
  folderId : BigInteger;
  allottedSpace : string;
  usedSpace : string;
  startDate:string = null;
  endDate: string = null;
  showClearButton: boolean = false;
  untouchedData = [];
  dragDestIndex;
  draggedEl;
  draggedElIndex;
  rearranging = false;
  rearrangingDuration = 350;
  draggableElArr = $('.draggable');
  menuToggle;
  constructor(
    private asyncRequestService: AsyncRequestService,
    private http: HttpClient,
    private notifierService: AlertService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private localStorage : LocalStorageService,
    private commonService: CommonService,
    private router : Router
  ) {}

  ngOnInit() {
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.fetchResources(null, null);

    this.addResourceFolderForm = this.formBuilder.group(
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
        let rearrangedEls = this.rearrangeItems(this.folderLists, this.draggedElIndex, this.dragDestIndex);
        // arrangeItems(rearrangedEls, 4, $('.content'));
        this.folderLists = rearrangedEls
        setTimeout(() => { this.rearranging = false }, this.rearrangingDuration);
      }
    });
    
    $('.draggable').on('drop', (e) =>  {
      e.preventDefault();
      this.rearranging = false;
    });
  }

  rearrangeItems(arr, movedItemIndex, destinationIndex) {
    let movedEl = arr.splice(movedItemIndex,1)[0];
    arr.splice(destinationIndex, 0, movedEl);
    return arr;
  };
  change(e) {
 
    if(e.startDate != null){
      this.startDate = e.startDate.year()+'-'+(e.startDate.month()+1) + '-' + e.startDate.date() ;
    }
    if(e.endDate != null){
      this.endDate = e.endDate.year()+'-'+(e.endDate.month()+1) + '-' +e.endDate.date();
    }
    this.fetchResources(this.startDate,this.endDate  );
  }
  get renderErrors() {
    return this.addResourceFolderForm.controls;
  }

  fetchResources(startDate='', endDate=''){
    this.startDate = startDate;
    this.endDate = endDate;
    this.asyncRequestService.postRequest(this.getResource , {start_date: startDate , end_date: endDate }).subscribe(
      (response: any) => {
        this.allottedSpace = response.allotted_space;
        this.usedSpace = response.used_space;

        if(response.data.data){
          this.folderLists = response.data.data;
          this.nextUrl = response.data.next_page_url;
        }else{
          this.recordNotFound = true;
        }
      }
    ); 
    if((startDate == null) && (endDate == null)){
      this.showClearButton = false;
       this.selected = null ;
      }else{
          this.showClearButton = true;
      } 
  }
  onScrollDown(){
    if(this.nextUrl){   
      let nextPage = (this.nextUrl).split('?')['1'];  
      this.asyncRequestService.postRequest(this.getResource + '?' +nextPage , {start_date: this.startDate , end_date: this.endDate }).subscribe(
        (response: any) => {
          this.newFolderList = response.data.data;
          this.nextUrl = response.data.next_page_url;
          this.folderLists = this.folderLists.concat(this.newFolderList);
        }
      );
    }
  }

  onSubmit(form_type){
    this.submitted = true;

    if (this.addResourceFolderForm.invalid) {
      this.addResourceFolderForm.markAllAsTouched();
      return;
    }

    if(form_type == 'Add'){
      var url = this.createFolderUrl;
      var value = this.addResourceFolderForm.value;
    }else if((form_type == 'Update') && (this.folderId != null)){
      var url = this.updateFolder;
      var value = Object.assign({},this.addResourceFolderForm.value,{'folder_id': this.folderId});
    }

      this.asyncRequestService
      .postRequest(url, value)
      .subscribe(
        (response) => {
          this.response = response;
          this.notifierService.success(this.response.success_message);
          // resetting form
          this.submitted = false;
          this.addResourceFolderForm.reset();
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

  openCreateFolderModal(template: TemplateRef<any>) {  
    this.action = 'Add';
    this.modalRef = this.modalService.show(  
      template,  
      Object.assign({}, { class: 'gray modal-lg' })  
    );  
  }  

  openUpdateFolderModal(template: TemplateRef<any> , folder_id){
    this.asyncRequestService.getRequest(this.getFolderDetail + folder_id).subscribe(
      (response: any) => {
        this.action = 'Update';
        if(response.data){
          this.addResourceFolderForm.setValue({
            folder_name: response.data.folder_name,          
          });
          this.folderId = folder_id;
          this.modalRef = this.modalService.show(  
            template,  
            Object.assign({}, { class: 'gray modal-lg' })  
          );  
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
          this.notifierService.error('Something went wrong. Please try again later');
        }
      }
    );   
  }


  items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  option = "25rem";

  drop(event: CdkDragDrop<any>) {
    this.untouchedData = this.items;
    var moreArray = [];
    var previousLoc = event.previousContainer.data.index;
    var newLoc = event.container.data.index;
    // this.items[event.previousContainer.data.index]=event.container.data.item
    // this.items[event.container.data.index]=event.previousContainer.data.item
    if (newLoc < previousLoc) {
      for (var i = newLoc; i < this.untouchedData.length; i++) {
        if (i >= this.untouchedData.length+1) { break; }
        if (i == newLoc) {
          moreArray[i] = this.untouchedData[previousLoc];
        } else {
          moreArray[i] = this.untouchedData[i-1];
        }
      }
      for (var i = newLoc; i < moreArray.length; i++) {
        if (i >= moreArray.length+1) { break; }
        this.items[i] = moreArray[i];
      }
    }
    let order=1, folderOrderList=[];
    for(let ele of this.folderLists){
      const body={id: ele.id, order}
      folderOrderList.push(body);
      order++;
    }
    this.asyncRequestService.postRequest('resources/update-folder-sort', folderOrderList).subscribe((res:any)=> {
    }, err => {
      this.fetchResources(null, null);
    });
  }

  entered(event: CdkDragEnter) {
    moveItemInArray(this.folderLists, event.item.data, event.container.data);
    
  }

  evenPredicate(item: CdkDrag<number>) {
    return item.data % 2 === 0;
  }

  cdkDragMoved = (event: CdkDragMove<any>) => {

    // let sidebarWidth = document.getElementById('sidebar').clientWidth;
    // let headerHight = document.getElementById('header').clientHeight;
    // let legendHight = document.getElementById('legend').clientHeight;
    // let topHeader = document.getElementById('top-header').clientHeight;
    // let roadMapheadhight = document.getElementById('road_map_head').clientHeight;
    
    
    // let totalTopMargin = headerHight + legendHight + topHeader + roadMapheadhight + 37; // 37 is margin and padding b/w different divs
    
    // this.dropPositionLeft = event.pointerPosition.x + Number(this.scrollPositionTopLeft);
    // this.dropPositionTop = event.pointerPosition.y - totalTopMargin;
    
    // let positionX = event.pointerPosition.x + Number(this.scrollPositionTopLeft) - (sidebarWidth + 30);
    // let positionY = event.pointerPosition.y + Number(this.scrollPositionTop) - totalTopMargin;
    
    
    // this.currentElement.style.left = event.pointerPosition.x + "px";
    // this.currentElement.style.top = event.pointerPosition.y + "px";
    let elemBelow = document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);
    let droppableRow: any;
    if (elemBelow) {
    droppableRow = elemBelow.closest('cdk_folder');
      if (!droppableRow) { // dropeed in between the projects
        droppableRow = elemBelow.closest('.drag-tag');
      }
    }

    if (droppableRow) {
      droppableRow.classList.add("row-active");
      droppableRow.id = "rowActive";
    }
    
    let allRows = document.getElementsByClassName('row-active');
    // remove active calss
    for (let x = 0; x < allRows.length; x++) {
    allRows[x].removeAttribute("id");
    if (allRows[x].classList.contains('new-row')) {
    allRows[x].className = "new-row";
    } else {
    allRows[x].className = "cdk_folder";
    }
    }
    

    
    
    
    // let guideRulerLeft = document.getElementById('guideRulerLeft')
    // let roadMapMainHeight = document.getElementById('road_map_main').offsetHeight;
    
    // guideRulerLeft.style.height = roadMapMainHeight + 25 + 'px'; // 25 is magrin or padding b/w different divs
    // guideRulerLeft.style.display = "block";
    
    
    // let isNewDrop = event.source.element.nativeElement.getAttribute('isNewDrop');
    // this.projectPostionLeft = event.pointerPosition.x + Number(this.scrollPositionTopLeft) - Number(this.elmCurrentPostion) + 30;
    // if (isNewDrop) {
    // guideRulerLeft.style.left = Number(this.projectPostionLeft) - 137 + 'px';
    // } else {
    
    // guideRulerLeft.style.left = Number(this.projectPostionLeft) - Number(this.scrollPositionTopLeft) + 'px';
    
    // }
    
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
}
