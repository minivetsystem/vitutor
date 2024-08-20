import { AfterViewInit, Component, OnInit, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { WebsocketService, LocalStorageService, AlertService, AttachmentService , GlobalVariablesService} from '@app/shared/_services/index';
import * as moment from 'moment';
import * as momen from 'moment-timezone' 
import { Socket } from 'socket.io-client';
import { ThrowStmt } from '@angular/compiler';
declare const $: any;
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StudentService } from '../student.service';
import { CommonService } from '@app/common/services/common.service';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import {AvailibilityModalComponent} from '../../shared/_components/availibility-modal/availibility-modal.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';


@Component({
  selector: 'app-message-board',
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.scss']
})
export class MessageBoardComponent implements OnInit, AfterViewInit {
  
  @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  @ViewChildren('scrollContactList') scrollContactList: QueryList<any>;

  userId;
  userInfo;
  contactList = [];
  contactListErr: boolean ;
  adminContactListErr : boolean;
  loader = false;
  ChatDetailsTutor = {rating_count:'',job_title:'',job_type:'',recurring_type:'', price_type:'',duration:'',price:'',no_of_sessions: '', job_description:'',profile_slug:'', id: '',first_name: '', tutor_profile_image:'',last_name: '', ref_id: '', job_id: '', message_board_room_id: '',receiver_role : '',country:'', hourly_rate:'',about_me:'', receiver_id:'', sender_role : '' ,tutor_name:'', job_slug:'',experience_level:'',proposed_start_time:'', rating: 0};
  messagesArray=[];
  message;
  test = '';
  messageList = {
    full_name : 'James Bond',
    job_title : 'Sceret mission',
    offer_sent : false,
    messages : [{
      message_time: 'saturday, june 6, 2020',
      chats : [{time: '11:32 AM', sender_name: 'James Bond', message: 'I am going to kill the villian, to save the planet', img_url: 'www.ths.com/image'},
    {time: '11:33 AM', sender_name: 'M', message: 'For god sake dont do something foolish', img_url: 'www.ths.com/image'}]
    }, {
      message_time: 'sunday, june 7, 2020',
      chats: [{time: '11:11 AM', sender_name: 'James Bond', message: 'Already did.', img_url: 'www.ths.com/image'
      }]
    }]
  };
  searchText: string;
  scrollContainer: any;
  uploadFile :any = null;
  sizeLimitError: boolean = false;
  fileTypeError: boolean = false;
  autoSelect: boolean = true;
  updateContactList :boolean = false;
  createOfferForm: FormGroup;
  formSubmitted:boolean = false;
  attachmentTypeError: boolean = false;
  attachmentFile: any = null;
  sentOfferDetails:any = null;
  attachmentsizeLimitError: boolean = false;
  uploadedFileObject = null;
  searchContactCount;
  aboutMenu: boolean = false;
  chatwithRoleType = 'tutor';
  loginUserDetails;
  AdmincontactList = [];
  ChatDetailsAdmin:any = {};
  cancelApplication: boolean = false;
  lastMessage = {is_application_cancel: 0};
  isRecurring = false;
  recurringTypeField = ''
  currentDate;
  daysArray = [{name:'Sunday'}, {name:'Monday'}, {name:'Tuesday'},{name:'Wednesday'},{name:'Thursday'},{name:'Friday'},{name:'Saturday'}]
  selectedDays = [];
  datesArray = [];
  selectedDates = [];
  dateRangeErr = '';
  menuToggle;
  messageBoardRoute = '';
  timezone;
  availabilityModal:BsModalRef
  // dailyCondn = this.sentOfferDetails.job_type == 'recurring' && this.sentOfferDetails.recurring_type == 'Daily';
  // weeklyCondn = this.sentOfferDetails.job_type == 'recurring' && this.sentOfferDetails.recurring_type == 'Weekly';
  // mnthlyCondn = this.sentOfferDetails.job_type == 'recurring' && this.sentOfferDetails.recurring_type == 'Monthly';
  // ontimeJobCondn = this.sentOfferDetails.job_type == 'one-time' || this.sentOfferDetails.job_type == 'instant-tutoring'

  constructor(
    private websocketService: WebsocketService,
    private localStorage: LocalStorageService,
    private notifier: AlertService,
    private Aroute: ActivatedRoute,
    private formBuilder : FormBuilder,
    private studentService: StudentService,
    private attachmentService : AttachmentService,
    private GlobalVariablesService : GlobalVariablesService,
    private router : Router,
    private commonService: CommonService,
    private modalService: BsModalService
    ) {
    // datesArray
    for(let i = 1; i <= 31; i++){
      this.datesArray.push({name : i})
    }
    
    this.createOfferForm = this.formBuilder.group(
      {
        price : [null,[Validators.required,Validators.pattern(/^[+-]?\d+(\.\d+)?$/)]],
        message : [null,[Validators.required]],
        attachment : [null],
        schedule_date: ['', []],
        start_date: ['', []],
        end_date : ['', []],
        time: ['', [Validators.required]],
        day: [''],
        date: ['']
    })

    this.GlobalVariablesService.totalCount.subscribe((response) => {
      if(response) {
        window.setTimeout(() => {
          this.searchContactCount = true;
        },1000)
      }else{
        window.setTimeout(() => {
          this.searchContactCount = false;
        },1000)
      }
    })

    this.userId = this.localStorage.getRefId();
    this.loginUserDetails = JSON.parse(this.localStorage.get('user'));

    // below are tutor listeners-------

    this.websocketService.listen(`tutors_${this.userId}_list`).subscribe((res: any) => {
      this.contactList = res.data.sort((a,b) => {
        return moment(a['created_at'],"YYYY-MM-DD HH:mm:ss").toDate() > moment(b['created_at'],"YYYY-MM-DD HH:mm:ss").toDate() ? -1 : 1
      });
      console.log("contactList",this.contactList)
      this.updateContactList = false;
      if(this.contactList.length > 0) {
        this.contactListErr = false;
        this.Aroute.queryParams.subscribe((data: any) => {
          if(data.message_board_room_id){
            this.messageBoardRoute = data.message_board_room_id
          }
        if(this.autoSelect) {
          if(this.messageBoardRoute){
            let find = this.contactList.find((x) => this.messageBoardRoute == x.message_board_room_id)
            
            if(!find){
              this.ChatDetailsTutor = Object.assign(this.ChatDetailsTutor,this.contactList[0]);
            }else {
              this.ChatDetailsTutor = find;
              let positionOfScroll = null;
            let scrolInterwal= setInterval(()=>{
              if( document.getElementById('scroll_list_'+this.messageBoardRoute)){
                if(positionOfScroll == null){
                  positionOfScroll = $('#scroll_list_'+this.messageBoardRoute).position().top;

                }
                if(positionOfScroll !=  $('#scroll_list_'+this.messageBoardRoute).position().top){
                  clearInterval(scrolInterwal);
                }
              //  debugger
                  // setTimeout((){
                    // let data = document.getElementById('scroll_list_'+this.messageBoardRoute).innerText;
                    document.getElementById('scroll_list_'+this.messageBoardRoute).scrollIntoView();
                    // $('#contact_List_container').scrollTop($('#scroll_list_'+this.messageBoardRoute).position().top)
                   
                  // })
                // document.getElementById('contact_list_container').scrollTop = (document.getElementById('scroll_list_'+this.messageBoardRoute).offsetTop-50)
                }
            },500)
            }
            
                       // document.getElementById('contact_list_container').scrollTop = (document.getElementById('scroll_list_'+this.messageBoardRoute).offsetTop-50)

            // document.getElementById('contact_list_container').scrollTop = (document.getElementById('scroll_list_'+this.messageBoardRoute).offsetTop-50)
            // if( document.getElementById('scroll_list_'+this.messageBoardRoute))  document.getElementById('scroll_list_'+this.messageBoardRoute).scrollIntoView()
            // let item = this.scrollContactList.find(x => x.nativeElement.id  == 'scroll_list_'+this.messageBoardRoute)
            // // document.getElementById('scroll_list_'+this.messageBoardRoute).scrollIntoView()
            // item.scrollIntoView()
            // if(this.itemElements.length > 0){
            //   let item = this.itemElements.find(x => x.message_board_room_id == this.messageBoardRoute)
            //   item.scrollIntoView()
            // }
          } else {
             this.ChatDetailsTutor = Object.assign(this.ChatDetailsTutor,this.contactList[0]);
          }
         
         
         
            if(this.contactList && this.contactList.length > 0) {
              this.getMessages(false);
            }
            this.autoSelect = false;
          
        }else{

          if(this.messageBoardRoute){
            let find = this.contactList.find((x) => this.messageBoardRoute == x.message_board_room_id)
            
             
            if(!find){
              this.ChatDetailsTutor = Object.assign(this.ChatDetailsTutor,this.contactList[0]);
            } else {
              this.ChatDetailsTutor = find
            }
            // document.getElementById('contact_list_container').scrollTop = (document.getElementById('scroll_list_'+this.messageBoardRoute).offsetTop-50)
            // if( document.getElementById('scroll_list_'+this.messageBoardRoute))  document.getElementById('scroll_list_'+this.messageBoardRoute).scrollIntoView()
            // let item = this.scrollContactList.find(x => x.nativeElement.id  == 'scroll_list_'+this.messageBoardRoute)
            // item.scrollIntoView()
            // if(this.itemElements.length > 0){
            //   let item = this.itemElements.find(x => x.message_board_room_id == this.messageBoardRoute)
            //   item.scrollIntoView()
            // }
            
          } else {
             this.ChatDetailsTutor = Object.assign(this.ChatDetailsTutor,this.contactList[0]);
          }
          if(this.ChatDetailsTutor.receiver_id == this.userId) {
            this.websocketService.emit('message_read',{message_board_room_id : this.ChatDetailsTutor.message_board_room_id , user_id : this.userId});
            this.getMessages(false);
          }
        }
        
      })
      } else {
        this.contactListErr = true;
      }
      
    }, err => {
      this.contactListErr = true;
    });

    this.websocketService.listen(`response_chat_${this.userId}_messages`).subscribe((res: any) => {
      this.loader = false;
      if (res.status_code != 200) {
        // this.notifier.error(res.message);
      } else {
        // this.notifier.success(res.message);
        this.uploadFile = null;
        this.uploadedFileObject = null;
        this.websocketService.emit('student_contact_list', {user_id: this.ChatDetailsTutor.ref_id});
        this.updateContactList = true;
        this.getMessages(false);
        this.message = '';
        window.setTimeout(()=> {
          if(this.contactList.length == 0){
            this.contactListErr = true
          }else {
            this.contactListErr = false;
          }
         
        }, 1500);
      }
    });

    this.websocketService.listen(`request_slice_${this.userId}_upload`).subscribe((res: any) => {
      let place = res.currentSlice * 100000, 
      slice = this.uploadFile.slice(place, place + Math.min(100000, this.uploadFile.size - place)); 
      var reader = new FileReader();
      reader.readAsArrayBuffer(slice);
      let data = {
        user_id: this.userId,
        receiver_id: this.ChatDetailsTutor.ref_id,
        job_id: this.ChatDetailsTutor.job_id,
        message: this.message,
        message_board_room_id: this.ChatDetailsTutor.message_board_room_id,
        sender_id: this.userId,
        receiver_role : this.ChatDetailsTutor.receiver_role
      };
      let arrayBuffer = reader.result;
      data['name'] = this.uploadFile.name, 
      data['type'] = this.uploadFile.type, 
      data['size'] = this.uploadFile.size, 
      arrayBuffer 
      reader.onload = (event) => {
        data['data'] = reader.result;
        this.websocketService.emit('image_upload',data);
      }
    })

    this.websocketService.listen(`end_${this.userId}_upload`).subscribe((res :any) => {
      this.loader = false;
      if (res.status_code != 200) {
        // this.notifier.error(res.message);
      } else {
        // this.notifier.success(res.message);
        this.uploadFile = null;
        this.uploadedFileObject = null;
        this.websocketService.emit('student_contact_list', {user_id: this.ChatDetailsTutor.ref_id});
        this.updateContactList = true;
        this.getMessages(false);
        this.message = '';
      }
    })

    // below are admin listeners-------

    if(this.loginUserDetails && this.loginUserDetails.message && this.loginUserDetails.message.message_board_room_id) {
    this.websocketService.listen(`admin_contact_list_${this.userId}`).subscribe((res: any) => {
      this.adminContactListErr = false;
      this.AdmincontactList = res.data.sort((a,b) => {
        return moment(a['created_at'],"YYYY-MM-DD HH:mm:ss").toDate() > moment(b['created_at'],"YYYY-MM-DD HH:mm:ss").toDate() ? -1 : 1
      });
      this.updateContactList = false;
      this.ChatDetailsAdmin = this.AdmincontactList.length > 0 ? this.AdmincontactList[0] : {};
      if(this.autoSelect) {
        this.getAdminMessage();
      }else{
        this.getAdminMessage();
      }
      this.autoSelect = false;
    }, err => {
      this.adminContactListErr = true;
    });

    this.websocketService.listen(`chat_details_${this.userId}_${this.loginUserDetails.message.message_board_room_id}`).subscribe((res: any) => {
      this.loader = false;
      const result = res.data;
 
      result.forEach(e => {
        const dateTime = e.message_sent_time == null ? null : e.message_sent_time;
        const date = dateTime ? moment(dateTime.split('T')[0]).format('dddd, MMMM DD, YYYY') : null;
        const time = dateTime ? dateTime.split('T')[1].split('.')[0] : null;
        e.message_date = date;
        e.message_time = time;
      });
      let arrayDummy = {};
      arrayDummy = result.reduce((r, a) => {
        r[a.message_date] = [...r[a.message_date] || [], a];
        return r;
        }, {});
      let finalArray = [];
      for (const ele in arrayDummy) {
        if (ele !== undefined) {
        finalArray.push({time : ele, messages: arrayDummy[ele]});
        }
      }
      finalArray = finalArray.map((x) => {
        x['messages'] = x.messages.sort((a,b) => {
          return moment(a['message_time'],"HH:mm:ss").toDate() > moment(b['message_time'],"HH:mm:ss").toDate() ? 1 : -1
        })
        return x;
      })
      this.messagesArray = finalArray.sort((a,b) => {
        return moment(a.time , "dddd, MMMM DD, YYYY").toDate() > moment(b.time , "dddd, MMMM DD, YYYY").toDate() ? 1 : -1
      });

      
      let index = this.AdmincontactList.findIndex(x => x.message_board_room_id == this.ChatDetailsAdmin.message_board_room_id);
      this.AdmincontactList[index].is_read = 1;
      if(this.updateContactList) {
        this.websocketService.emit('admin_contacts', {user_id: this.userId, user_role_id : this.loginUserDetails.role_id});
      }
      this.lastMessage = {is_application_cancel : 0}
      this.updateContactList = false;
    });

    this.websocketService.listen(`response_chat_1_${this.loginUserDetails.message.message_board_room_id}_messages`).subscribe((res: any) => {
      this.loader = false;
      if (res.status_code != 200) {
      } else {
        this.uploadFile = null;
        this.uploadedFileObject = null;
        this.websocketService.emit('student_contacts',{})
        this.updateContactList = true;
        this.getAdminMessage();
        this.message = '';
      }
    });

    this.websocketService.listen(`request_slice_${this.userId}_${this.loginUserDetails.message.message_board_room_id}_upload`).subscribe((res: any) => {
      let place = res.currentSlice * 100000, 
      slice = this.uploadFile.slice(place, place + Math.min(100000, this.uploadFile.size - place)); 
      var reader = new FileReader();
      reader.readAsArrayBuffer(slice);
      let data = {
        user_id: this.userId,
        receiver_id: 1,
        message: this.message,
        message_board_room_id: this.ChatDetailsAdmin.message_board_room_id,
        sender_id: this.userId,
        name: this.uploadFile.name,
        size: this.uploadFile.size,
        type: this.uploadFile.type
      };
      let arrayBuffer = reader.result;
      data['name'] = this.uploadFile.name, 
      data['type'] = this.uploadFile.type, 
      data['size'] = this.uploadFile.size, 
      arrayBuffer 
      reader.onload = (event) => {
        data['data'] = reader.result;
        this.websocketService.emit('admin_image_upload',data);
      }
    })

    this.websocketService.listen(`end_${this.userId}_${this.loginUserDetails.message.message_board_room_id}_upload`).subscribe((res :any) => {
      this.loader = false;
      if (res.status_code != 200) {
      } else {
        this.uploadFile = null;
        this.uploadedFileObject = null;
        this.websocketService.emit('student_contacts',{})
        this.updateContactList = true;
        this.getAdminMessage();
        this.message = '';
      }
    })

    }
  }



  ngOnInit() {
    this.userInfo = this.localStorage.getUserData();
    this.localStorage.timeZone.subscribe((res:any)=> {
      if(res){
        this.timezone = res;
      } else {
        this.timezone = this.localStorage.getTimeZone();
      }
    })
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    this.websocketService.emit('tutor_contact_list', {user_id: this.userId}); 

    setTimeout(()=> {
      this.contactListErr = true
    },1000)
   
  }

  ngAfterViewInit() {
    this.fetchMessages();
    if(this.messageBoardRoute){
      // let item = this.scrollContactList.find(x => x.nativeElement.id  == 'scroll_list_'+this.messageBoardRoute)
      // // document.getElementById('scroll_list_'+this.messageBoardRoute).scrollIntoView()
      // item.scrollIntoView()

      document.getElementById('contact_list_container').scrollTop = (document.getElementById('scroll_list_'+this.messageBoardRoute).offsetTop-50)

    }
    // $(".info_btn").click(() => {
    //   $(".abt_sec").slideToggle();
    //  });
    // this.scrollContainer = this.scrollFrame.nativeElement;
    // this.itemElements.changes.subscribe(_ => this.scrollToBottom());
  }
  
  infoBtnClick(){
    this.aboutMenu = !this.aboutMenu;
  }

  ngOnDestroy() {
    this.websocketService.closeListener(`tutors_${this.userId}_list`);
    this.websocketService.closeListener(`response_chat_${this.userId}_messages`);
    this.websocketService.closeListener(`request_slice_${this.userId}_upload`);
    this.websocketService.closeListener(`end_${this.userId}_upload`);
    this.websocketService.closeListener(`messages_${this.userId}_list`);
    if(this.loginUserDetails && this.loginUserDetails.message && this.loginUserDetails.message.message_board_room_id) {
      this.websocketService.closeListener(`admin_contact_list_${this.userId}`);
      this.websocketService.closeListener(`chat_details_${this.userId}_${this.loginUserDetails.message.message_board_room_id}`);
      this.websocketService.closeListener(`response_chat_1_${this.loginUserDetails.message.message_board_room_id}_messages`);
      this.websocketService.closeListener(`request_slice_${this.userId}_${this.loginUserDetails.message.message_board_room_id}_upload`);
      this.websocketService.closeListener(`end_${this.userId}_${this.loginUserDetails.message.message_board_room_id}_upload`);
    }
  }

  sendMessage() {
    if (this.message.length == 0) {
      return;
    }
    let data = {
      user_id: this.userId,
      receiver_id: this.ChatDetailsTutor.ref_id,
      job_id: this.ChatDetailsTutor.job_id,
      message: this.message,
      message_board_room_id: this.ChatDetailsTutor.message_board_room_id,
      sender_id: this.userId,
      receiver_role : this.ChatDetailsTutor.receiver_role
    };
    this.websocketService.emit('send_message',data);
  }

  sendMessageToAdmin() {
    this.scrollContainer = this.scrollFrame.nativeElement;
    this.itemElements.changes.subscribe(_ => this.scrollToBottom());
    if (this.message.length == 0) {
      return;
    }
    let data = {
      sender_id : this.userId, 
      receiver_id : 1, 
      message_board_room_id : this.loginUserDetails.message.message_board_room_id, 
      message : this.message
    };
    console.log("data",data)
    this.websocketService.emit('send_admin_messages',data);
  }


  getMessagesList(object,i) {
    if(this.messageBoardRoute){
      this.messageBoardRoute = null;
      // this.router.navigate([], {relativeTo: this.Aroute, queryParams: null});
    }
    

    this.contactList[i].is_read = 1;
    this.ChatDetailsTutor = object;
    this.loader = true;
    // this.updateContactList = true;
    this.uploadFile = null;
    this.uploadedFileObject = null;
    this.sizeLimitError = false;
    this.fileTypeError = false;
    this.formSubmitted = false;
    this.attachmentTypeError = false;
    this.attachmentFile = null;
    this.createOfferForm.reset();
    if(this.ChatDetailsTutor.receiver_id == this.userId) {
      this.websocketService.emit('message_read',{message_board_room_id : this.ChatDetailsTutor.message_board_room_id , user_id : this.userId});
    }
    this.getMessages(false);
  }
  
  async getMessages(signal) {
    this.websocketService.emit('get_messages', {user_id: this.userId, receiver_id: this.ChatDetailsTutor.ref_id, job_id: this.ChatDetailsTutor.job_id, message_board_room_id: this.ChatDetailsTutor.message_board_room_id,student_id : this.userId, tutor_id : this.ChatDetailsTutor.ref_id});
  }

  fetchMessages() {
    this.websocketService.listen(`messages_${this.userId}_list`).subscribe((res: any) => {
      this.loader = false;
      const result = res.data;
      this.sentOfferDetails = res.job_offer_details && res.job_offer_details.length > 0 ? res.job_offer_details[0] : null;
      result.forEach(e => {
        const dateTime = e.message_sent_time == null ? null : e.message_sent_time;
        const date = dateTime ? moment.utc(dateTime).tz(this.timezone).format('dddd, MMMM DD, YYYY') : null;
        const time = dateTime ? dateTime.split('T')[1].split('.')[0] : null;
        e.message_date = date;
        e.message_time = time;
      });
      let arrayDummy = {};
      arrayDummy = result.reduce((r, a) => {
        r[a.message_date] = [...r[a.message_date] || [], a];
        return r;
       }, {});
      let finalArray = [];
      for (const ele in arrayDummy) {
        if (ele !== undefined) {
        finalArray.push({time : ele, messages: arrayDummy[ele]});
        }
      }
      finalArray = finalArray.map((x) => {
        x['messages'] = x.messages.sort((a,b) => {
          return moment(a['message_time'],"HH:mm:ss").toDate() > moment(b['message_time'],"HH:mm:ss").toDate() ? 1 : -1
        })
        return x;
      })
      this.messagesArray = finalArray.sort((a,b) => {
        return moment(a.time , "dddd, MMMM DD, YYYY").toDate() > moment(b.time , "dddd, MMMM DD, YYYY").toDate() ? 1 : -1
      });
      console.log("massage 2", this.messagesArray)
      this.lastMessage = Object.assign(this.lastMessage, (this.messagesArray[this.messagesArray.length - 1]).messages[(this.messagesArray[this.messagesArray.length - 1]).messages.length-1])
      let index = this.contactList.findIndex(x => x.message_board_room_id == this.ChatDetailsTutor.message_board_room_id);
      this.contactList[index].is_read = 1;
      if(this.updateContactList) {
        this.websocketService.emit('tutor_contact_list', {user_id: this.userId});
      }
      this.updateContactList = false;
      this.scrollContainer = this.scrollFrame.nativeElement;
      this.itemElements.changes.subscribe(_ => this.scrollToBottom());
      this.contactListErr = false;
    });
  }

  scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0
    });
  }

  checkMessageType(object) {
    if(this.userId == object.receiver_user_id) {
      return ('receiver');
    }else if(this.userId == object.sender_user_id) {
      return ('sender');
    }else{
      return ('null');
    }
  }

  checkAdminMessageType(object) {
    if(this.userId == object.receiver_id) {
      return ('receiver');
    }else if(this.userId == object.sender_id) {
      return ('sender');
    }else{
      return ('null');
    }
  }

  

  checkMessageDate(date) {
    let comingDate = moment.utc(date,"YYYY-MM-DD HH:mm:ss").tz(this.timezone);
    let REFERENCE = moment().tz(this.timezone); // fixed just for testing, use moment();
    let TODAY = REFERENCE.clone().startOf('day');
    let YESTERDAY = REFERENCE.clone().subtract(1,'day').startOf('day');
    let A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');

    if(comingDate.isSame(TODAY, 'd')) {
      return(comingDate.format("hh:mm A"));
    }else if(comingDate.isSame(YESTERDAY, 'd')) {
      return('Yesterday');
    }else if(comingDate.isAfter(A_WEEK_OLD)) {
      return(comingDate.format("dddd"));
    }else {
      return(comingDate.format("MM/DD/YYYY"));      
    }

  }

  onselectFile(evt) {
    this.sizeLimitError = false;
    this.fileTypeError = false;
    this.uploadFile = evt.target.files[0];
    const fileSize = parseFloat(Number(this.uploadFile.size/1024/1024).toFixed(2));
    if(this.uploadFile && this.uploadFile.type != 'image/png' && this.uploadFile.type != 'image/jpeg' && this.uploadFile.type !='application/pdf'
    && this.uploadFile.type != 'application/msword' && this.uploadFile.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    && this.uploadFile.type != 'application/vnd.ms-excel' && this.uploadFile.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    && this.uploadFile.type != 'text/plain') {
      this.uploadFile = null;
      this.uploadedFileObject = null;
      this.fileTypeError = true;
      window.setTimeout(() => {
        this.fileTypeError = false;
      },2500)
    }
    if(fileSize > 5) {
      this.uploadFile = null;
      this.uploadedFileObject = null;
      this.sizeLimitError = true;
      window.setTimeout(() => {
        this.sizeLimitError = false;
      },2500)
    }              
  }

  removeUploadFile() {
    this.uploadFile = null;
    this.uploadedFileObject = null;
  }

  getInitials(name) {
    var canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = 32;
    canvas.height = 32;
    document.body.appendChild(canvas);
    var context = canvas.getContext('2d');
    context.fillStyle = "#999";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "16px Arial";
    context.fillStyle = "#ccc";
    var first, last;
    if (name && name != '') {
        first = name[0];
        last = null;
        if (last) {
            var initials = first + last;
            context.fillText(initials.toUpperCase(), 3, 23);
        } else {
            var initials = first;
            context.fillText(initials.toUpperCase(), 10, 23);
        }
        var data = canvas.toDataURL();
        document.body.removeChild(canvas);
        return data;
    } else {
        return false;
    }
  }

  showNewMessageAlert(object) {
    if(object.receiver_id == this.userId && object.is_read == 0) {
      return true;
    }else{
      return false;
    }
  }

  checkInvalidMessage() {
    var text = this.message ? this.message.split(" ") : [];
    if(text.length == 0 || text[0] == "") {
      return true;
    }else if(this.lastMessage.is_application_cancel == 1) {
      return true;
    } else {
      return false;
    }
  }

  onclickSendOffer() {
    let timeZone = this.localStorage.getTimeZone()
    this.createOfferForm.get('price').setValue(this.ChatDetailsTutor.price.replace('$',''))
  this.createOfferForm.get('price').updateValueAndValidity();
    if(this.ChatDetailsTutor.job_type == 'recurring'){
      if(this.ChatDetailsTutor.recurring_type && this.ChatDetailsTutor.recurring_type == 'Monthly'){
        this.recurringTypeField = 'Monthly'
        this.createOfferForm.get('date').setValidators([Validators.required]);
        this.createOfferForm.get('date').updateValueAndValidity()
      } else if(this.ChatDetailsTutor.recurring_type && this.ChatDetailsTutor.recurring_type == 'Weekly') {
        this.recurringTypeField = 'Weekly'
        this.createOfferForm.get('day').setValidators([Validators.required]);
        this.createOfferForm.get('day').updateValueAndValidity()
      }
      this.isRecurring = true;
      this.createOfferForm.get('start_date').setValidators([Validators.required]);
      this.createOfferForm.get('end_date').setValidators([Validators.required]);
      // this.createOfferForm.get('time').setValidators([Validators.required]);
      this.createOfferForm.get('start_date').setValue('');
      this.createOfferForm.get('end_date').setValue('');
      // this.createOfferForm.get('time').setValue('');
      this.createOfferForm.get('start_date').updateValueAndValidity();
      this.createOfferForm.get('end_date').updateValueAndValidity();
      // this.createOfferForm.get('time').updateValueAndValidity();

      this.createOfferForm.get('schedule_date').clearValidators();
      this.createOfferForm.get('schedule_date').setValue('');
      this.createOfferForm.get('schedule_date').updateValueAndValidity();
    }else if(this.ChatDetailsTutor.job_type == 'one-time') {
      this.isRecurring = false;
      this.createOfferForm.get('schedule_date').setValidators([Validators.required]);
      this.createOfferForm.get('schedule_date').setValue('');
      this.createOfferForm.get('schedule_date').updateValueAndValidity();

      this.createOfferForm.get('start_date').clearValidators();
      this.createOfferForm.get('end_date').clearValidators();
      this.createOfferForm.get('start_date').setValue('');
      this.createOfferForm.get('end_date').setValue('');
      // this.createOfferForm.get('time').setValue('');
      this.createOfferForm.get('start_date').updateValueAndValidity();
      this.createOfferForm.get('end_date').updateValueAndValidity();
      // this.createOfferForm.get('time').updateValueAndValidity();
    } else if(this.ChatDetailsTutor.job_type == 'instant-tutoring'){
      this.isRecurring = false;
      this.createOfferForm.get('schedule_date').setValidators([Validators.required]);
      this.createOfferForm.get('schedule_date').setValue(moment().tz(timeZone).toISOString());
      this.createOfferForm.get('schedule_date').updateValueAndValidity();
      this.createOfferForm.get('time').setValue(moment().tz(timeZone).add(10,'minutes').format('hh:mm A'))
      this.createOfferForm.get('start_date').clearValidators();
      this.createOfferForm.get('end_date').clearValidators();
      // this.createOfferForm.get('time').clearValidators();
      this.createOfferForm.get('start_date').setValue('');
      this.createOfferForm.get('end_date').setValue('');
      // this.createOfferForm.get('time').setValue('');
      this.createOfferForm.get('start_date').updateValueAndValidity();
      this.createOfferForm.get('end_date').updateValueAndValidity();
    }

    $('#apply_job').modal('show');
  }

  getToday() {
    this.currentDate = moment().tz(this.timezone).toISOString();
  }

  change(e) {
  }
  changeStartDate(event){
      this.createOfferForm.get('end_date').setValue('');
      this.createOfferForm.get('end_date').updateValueAndValidity();

  }

  onSelectAttachment(evt) {
    // this.sizeLimitError = false;
    this.attachmentTypeError = false;
    this.attachmentsizeLimitError = false;
    this.attachmentFile = evt.target.files[0];
    const fileSize = parseFloat(Number(this.attachmentFile.size/1024/1024).toFixed(2));
    if(this.attachmentFile.type != 'image/png' && this.attachmentFile.type != 'image/jpeg' && this.attachmentFile.type !='application/pdf'
    && this.attachmentFile.type != 'application/msword' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    && this.attachmentFile.type != 'application/vnd.ms-excel' && this.attachmentFile.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    && this.attachmentFile.type != 'text/plain') {
      this.attachmentFile = null;
      this.attachmentTypeError = true;
    }
    if(fileSize > 5) {
      this.attachmentFile = null;
      this.attachmentsizeLimitError = true;
    }                
  }

  onSubmit() {
    
    // let momentNow = moment(moment.tz(this.timezone).format('YYYY-MM-DD hh:mm A'), 'YYYY-MM-DD hh:mm A')
    // console.error(momentNow.format('YYYY-MM-DD hh:mm A'), this.timezone)
    let momentNow = moment()
    this.formSubmitted = true;
    if(this.createOfferForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError) {
      return;
    }else{
      const createFormValue = this.createOfferForm.value;
      if(this.ChatDetailsTutor.job_type == 'recurring' && (createFormValue.start_date == '' || createFormValue.end_date == '' || createFormValue.time == '' )){
        
        return ;
      } else if(this.ChatDetailsTutor.job_type == 'one-time' && (createFormValue.schedule_date == '' || createFormValue.time == '')){
        return ;
      } else if(this.ChatDetailsTutor.job_type == 'recurring' ){
        let startdate = moment(createFormValue.start_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
          this.dateRangeErr = 'Start date time is less then current date time'
          setTimeout(function() {
            this.dateRangeErr = '';
        }.bind(this), 3000);
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.ChatDetailsTutor.job_type == 'one-time'){
       
        let startdate = moment(createFormValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
          this.dateRangeErr = 'Start date time is less then current date time'
          setTimeout(function() {
            this.dateRangeErr = '';
        }.bind(this), 3000);
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.ChatDetailsTutor.job_type == 'instant-tutoring'){
       
        let startdate = moment(createFormValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
          this.dateRangeErr = 'Start date time is less then current date time'
          setTimeout(function() {
            this.dateRangeErr = '';
        }.bind(this), 3000);
          return
        } else {
          this.dateRangeErr = ''
        }
      }  else {
        this.dateRangeErr = ''
      }

      
      if(this.ChatDetailsTutor.job_type == 'recurring' && this.ChatDetailsTutor.recurring_type != 'Daily'){
        let dateDiffErr = 1;
        // let daysDiff = Math.floor((moment(createFormValue.end_date).unix() - moment(createFormValue.start_date).unix())/(1000*60*60*24));
        let diff = (moment(createFormValue.end_date).unix() - moment(createFormValue.start_date).unix())
        let daysDiff = Math.floor(diff/(60*60*24));
        for(let day=0; day <= daysDiff; day++){
          
          if(this.ChatDetailsTutor.recurring_type  == 'Weekly'){
            let currentDay=moment(createFormValue.start_date).add(day,'day').format('dddd');
            if(createFormValue.day.indexOf(currentDay) != -1){
              dateDiffErr = 0;
              
              break;
            } 
          }else if(this.ChatDetailsTutor.recurring_type  == 'Monthly'){
            let currentDay="" + moment(createFormValue.start_date).add(day,'day').format('D');
            if(createFormValue.date.indexOf(currentDay) != -1 || createFormValue.date.indexOf(+currentDay) != -1){
              dateDiffErr = 0;
              
              break;
            }
          }

        }
        if(dateDiffErr == 1){
          this.dateRangeErr = `Unable to create sessions, since provided date range doesn't have selected ${this.ChatDetailsTutor.recurring_type   == 'Weekly'? 'day': 'date'} in it.`
          return;
        } else {
          this.dateRangeErr = ''
        }
       
       
      }
     
      const formData  = new FormData();
      if(this.attachmentFile) {
        formData.append("attachment", this.attachmentFile , this.attachmentFile.name);
      }
      formData.append("tutor_id", this.ChatDetailsTutor.ref_id);
      formData.append("message", this.createOfferForm.value.message);
      formData.append("accepted_price", this.createOfferForm.value.price);
      formData.append("receiver_id", this.ChatDetailsTutor.ref_id);
      formData.append("job_id", this.ChatDetailsTutor.job_id);
      formData.append("user_id", this.userId);
      formData.append("message_board_room_id", this.ChatDetailsTutor.message_board_room_id);
      formData.append('time', moment(createFormValue.time, 'h:mm a').format('HH:mm:ss'));
      if(this.ChatDetailsTutor.job_type == 'recurring'){
        if(this.ChatDetailsTutor.recurring_type == 'Weekly'){
          formData.append('day', this.createOfferForm.value.day.join());
        }else if(this.ChatDetailsTutor.recurring_type == 'Monthly') {
          formData.append('date', this.createOfferForm.value.date.join());
        }
        formData.append('start_date', moment(createFormValue.start_date).format('YYYY-MM-DD'));
        formData.append('end_date', moment(createFormValue.end_date).format('YYYY-MM-DD'))
      } else {
        formData.append('schedule_date', moment(createFormValue.schedule_date).format('YYYY-MM-DD'))
      }
      this.studentService.sendOffer(formData).subscribe((res: any) => {
        if(res.success){
        this.notifier.success(res.message);
        $('#apply_job').modal('hide');
        this.formSubmitted = false;
        this.attachmentFile = null;
        this.createOfferForm.reset();
        this.websocketService.emit('student_contact_list', {user_id: this.ChatDetailsTutor.ref_id});
        this.websocketService.emit('send_notification', {'receiver_id': this.ChatDetailsTutor.ref_id , 
                                                          'reference_id': this.ChatDetailsTutor.message_board_room_id , 
                                                          'notification': this.userInfo.full_name + ' has sent you job request', 
                                                          'notification_message': this.userInfo.full_name + ' has sent you job request for the job ' + this.ChatDetailsTutor.job_title,
                                                           'type' : 'send_offer'})
        this.updateContactList = true;
        this.getMessages(false);
        } else {
          this.notifier.error(res.error_message || res.success_message || 'Unable to send offer');
        }
      }, err => {
        this.notifier.error(err.error.error_message);
      });
    }
  }

  offerDateFormat(date, timezone) {
    return moment.utc(date,"YYYY-MM-DD HH:mm:ss").tz(this.timezone).format("MM-DD-YYYY hh:mm A")
  }
  scheduleFormat(date,time,timezone){
    let Sdate = date.split('T')[0]
    let time1 = (""+time).indexOf('T') > -1 ? (''+time).split('T')[1] : time
    // time = time.indexOf('T') > -1 ? time.split('T')[1]: time
    return moment.utc(Sdate + ' ' + time1, 'YYYY-MM-DD HH:mm:ss').tz(this.timezone).format("MM-DD-YYYY")
  }
  offerTimeFormat(time) {
    let commingTime = moment(time,'dddd, MMMM DD, YYYY')
    // let time = message.messages[0].message_time
    if(commingTime.format('dddd, MMMM DD, YYYY') == moment().format('dddd, MMMM DD, YYYY')){
      return 'Today';
    } else if(commingTime.format('dddd, MMMM DD, YYYY') == moment().subtract(1,'day').format('dddd, MMMM DD, YYYY')) {
      return 'Yesterday';
    } else if(commingTime.isBetween(moment().subtract(7,'days'),moment())){
      return commingTime.format('dddd')
    }else {
      return time
    }
    
  }
  scheduleTimeFormat(date, time?, timezone?){
    if(date.indexOf('T') > -1){
      return moment.utc(date).tz(this.timezone).format('hh:mm a');
    } else {
      return moment.utc(date, 'HH:mm:ss').tz(this.timezone).format('hh:mm a');
    }
    
  }

  changeTimeFormat(time, timeZone ) {
    // 08:07:55
    return (moment.utc(time,"HH:mm:ss").tz(this.timezone).format("hh:mm A"))
  }
  getMessage(string: string){
    if(string){
      const div = string.includes('message_link');
      if(div){
        let EndIndex = string.lastIndexOf('<br>');
        string = string.slice(0, EndIndex);
        return string && string.length > 0 ? string.slice(0,10) : '(empty)'
      }
  
      let index = string.lastIndexOf(':')
      let EndIndex = string.lastIndexOf('</span>');
      let str = string
    if(index != -1){
      if(EndIndex < index){
        EndIndex = string.length
      }
      str = str.slice(index + 1, EndIndex);
    }
    return str && str.length > 0 ? str.slice(0,23) : '(empty)'
  }
    
    return '';
  }

  downloadAttachment(object,type) {
    if( type == 'chat-board-attachments') {
      let data = {
        type : type,
        mime_type : object.file_type,
        id: object.message_id
      }
      const Url = `attachment/${data.type}/${data.id}`;
      this.attachmentService.downloadFile(Url, object.filename);
      // this.attachmentService.downloadAttachment(data);
    }else if( type == 'job-offers-attachments') {
      let data = {
        type : type,
        mime_type : this.sentOfferDetails.file_type,
        id: this.sentOfferDetails.offer_id
      }
      const Url = `attachment/${data.type}/${data.id}`;
      this.attachmentService.downloadFile(Url, this.sentOfferDetails.image_title);
    }else if( type == 'tutor-edit-offer-attachments') {
      // return;
      let data = {
        type : type,
        mime_type : object.updated_file_type,
        id: this.sentOfferDetails.offer_id
      }
      const Url = `attachment/${data.type}/${data.id}`;
      this.attachmentService.downloadFile(Url, object.updated_file_name || 'unkown');
    }else{
      return;
    }
  }

  sendUploadFile() {
    this.scrollContainer = this.scrollFrame.nativeElement;
    this.itemElements.changes.subscribe(_ => this.scrollToBottom());
    let data = {
      user_id: this.userId,
      receiver_id: this.ChatDetailsTutor.ref_id,
      job_id: this.ChatDetailsTutor.job_id,
      message: this.message,
      message_board_room_id: this.ChatDetailsTutor.message_board_room_id,
      sender_id: this.userId,
      receiver_role : this.ChatDetailsTutor.receiver_role
    };
    this.loader = true;
    var reader = new FileReader();
    let slice = this.uploadFile.slice(0, 100000); 
    reader.readAsArrayBuffer(slice);
    let arrayBuffer = reader.result;
    data['name'] = this.uploadFile.name, 
    data['type'] = this.uploadFile.type, 
    data['size'] = this.uploadFile.size, 
    arrayBuffer 
    reader.onload = (event) => {
      data['data'] = reader.result;
      this.websocketService.emit('image_upload',data);
    }
  }
  
  sendUploadfileByAdmin() {
    this.scrollContainer = this.scrollFrame.nativeElement;
    this.itemElements.changes.subscribe(_ => this.scrollToBottom());
    let data = {
      user_id: this.userId,
      receiver_id: 1,
      message: this.message,
      message_board_room_id: this.ChatDetailsAdmin.message_board_room_id,
      sender_id: this.userId,
      name: this.uploadFile.name,
      size: this.uploadFile.size,
      type: this.uploadFile.type
    };
    this.loader = true;
    var reader = new FileReader();
    let slice = this.uploadFile.slice(0, 100000); 
    reader.readAsArrayBuffer(slice);
    let arrayBuffer = reader.result;
    data['name'] = this.uploadFile.name, 
    data['type'] = this.uploadFile.type, 
    data['size'] = this.uploadFile.size, 
    arrayBuffer 
    reader.onload = (event) => {
      data['data'] = reader.result;
      this.websocketService.emit('admin_image_upload',data);
    }
  }

  chatRoleType(type) {
    this.message = '';
    this.uploadFile = null;
    this.sizeLimitError = false;
    this.fileTypeError = false;
    this.formSubmitted = false;
    this.attachmentTypeError = false;
    this.attachmentFile = null;
    this.sentOfferDetails = null;
    this.attachmentsizeLimitError = false;
    this.uploadedFileObject = null;
    this.chatwithRoleType = type;
    this.messagesArray = [];
    this.aboutMenu = false;
    if(type == 'admin') {
      // this.autoSelect = true;
      this.websocketService.emit('admin_contacts', {user_id: this.userId, user_role_id : this.loginUserDetails.role_id});
    }else{
      this.websocketService.emit('tutor_contact_list', {user_id: this.userId}); 
      this.getMessages(false);
      this.fetchMessages()
    }
  }

  getAdminMessage() {
    this.websocketService.emit('chat_details',{user_role_id : this.loginUserDetails.role_id,chat_id: this.userId,message_board_room_id : this.ChatDetailsAdmin.message_board_room_id})
  }

  navigateViewTutor(profile_slug){
    $('#apply_job').modal('hide');
    this.router.navigate(['/search/viewTutor/'+profile_slug])
  }

  chatImageError(event){
    event.target.src = 'assets/img/avatar_user2.jpg';
  }

  setLanguages(event: any) {
    // we need to remove all from languages array
  }

  onRemoveLanguages(event) {

  }


  onClearLanguages() {
   
  }


  rejectTutorOffer(id){
    let body = {
      offer_id : id, status: 2
    }
    this.studentService.changeTutorOffer(body).subscribe((res:any) => {
      if(res.success){
        this.notifier.success(res.success_message);
        this.websocketService.emit('message_read',{message_board_room_id : this.ChatDetailsTutor.message_board_room_id , user_id : this.userId});
            this.getMessages(false);
            this.commonService.sendNotification({
              'receiver_id' : this.ChatDetailsTutor.receiver_id,
              'reference_id' : this.ChatDetailsTutor.message_board_room_id,
              'notification'  : 'Offer Rejected',
              'notification_message' : `Offer for ${this.ChatDetailsTutor.job_title} is rejected`,
              'type' : 'job_offer'
          })
            
      }else {
        this.notifier.error(res.success_message);
      }
      
    }, err => {
      this.notifier.error(err.error_message);
    })
  }

  fetchAdminChat(object){
    this.ChatDetailsAdmin = object;
    this.getAdminMessage();
    this.messagesArray = [];
    console.log("massage ", this.messagesArray)
  }

  sessionUpdate(json,msg){
    let data = JSON.parse(json);
    let prevStartDate=moment.utc(data.previous_start_time,'YYYY-MM-DD HH:mm').utc().tz(this.timezone).format('hh:mm A');
    let prevEndTime=moment.utc(data.previous_end_time,'YYYY-MM-DD HH:mm').tz(this.timezone).format('hh:mm A');
    let newStartTime=moment.utc(data.updated_start_time,'YYYY-MM-DD HH:mm').tz(this.timezone).format('hh:mm A')
    let newEndTime=moment.utc(data.updated_end_time,'YYYY-MM-DD HH:mm').tz(this.timezone).format('hh:mm A');
    // let utcDate = moment.utc(data.schedule_date + ' '+ data.previous_end_time,'dddd MM-DD-YYYY hh:mm A').format('hh:mm A')

    return (`<p><strong>${msg}</strong></p>
    <p><strong>Schedule Date:</strong>${moment(data.schedule_date,'dddd MM-DD-YYYY').tz(this.timezone).format('dddd MM-DD-YYYY')} </p>
    <p><strong>Previous start Time: </strong> ${prevStartDate}</p>
    <p><strong>Previous end Time: </strong> ${prevEndTime}</p>
    <p><strong>Updated start Time: </strong> ${newStartTime}</p>
    <p><strong>Updated end Time: </strong> ${newEndTime}</p>`
    // `<p>UTC Time: ${utcDate}</p><p>${this.timezone}</p>`
    )
  }

  stringify(chat){
    return JSON.stringify(chat)
  }

  openAvailibilityModal(){
    let body = {start_date:'', end_date: '', start_time:'', job_id:'', tutor_id:'',day:'',mDate:''}
    let momentNow = moment()
    this.formSubmitted = true;
    if(this.createOfferForm.invalid || this.attachmentTypeError || this.attachmentsizeLimitError) {
      this.createOfferForm.markAllAsTouched()
      return;
    }else{
      const createFormValue = this.createOfferForm.value;
      if(this.ChatDetailsTutor.job_type == 'recurring' && (createFormValue.start_date == '' || createFormValue.end_date == '' || createFormValue.time == '' )){
        
        return ;
      } else if(this.ChatDetailsTutor.job_type == 'one-time' && (createFormValue.schedule_date == '' || createFormValue.time == '')){
        return ;
      } else if(this.ChatDetailsTutor.job_type == 'recurring' ){
        let startdate = moment(createFormValue.start_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
          this.dateRangeErr = 'Start date time is less then current date time'
          setTimeout(function() {
            this.dateRangeErr = '';
        }.bind(this), 3000);
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.ChatDetailsTutor.job_type == 'one-time'){
       
        let startdate = moment(createFormValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
          this.dateRangeErr = 'Start date time is less then current date time'
          setTimeout(function() {
            this.dateRangeErr = '';
        }.bind(this), 3000);
          return
        } else {
          this.dateRangeErr = ''
        }
      } else if (this.ChatDetailsTutor.job_type == 'instant-tutoring'){
       
        let startdate = moment(createFormValue.schedule_date).format('MM-DD-YYYY');
        if(moment(startdate + ' ' + createFormValue.time,'MM-DD-YYYY HH:mm a').isBefore(momentNow)){
          this.dateRangeErr = 'Start date time is less then current date time'
          setTimeout(function() {
            this.dateRangeErr = '';
        }.bind(this), 3000);
          return
        } else {
          this.dateRangeErr = ''
        }
      }  else {
        this.dateRangeErr = ''
      }

      
      if(this.ChatDetailsTutor.job_type == 'recurring' && this.ChatDetailsTutor.recurring_type != 'Daily'){
        let dateDiffErr = 1;
        // let daysDiff = Math.floor((moment(createFormValue.end_date).unix() - moment(createFormValue.start_date).unix())/(1000*60*60*24));
        let diff = (moment(createFormValue.end_date).unix() - moment(createFormValue.start_date).unix())
        let daysDiff = Math.floor(diff/(60*60*24));
        for(let day=0; day <= daysDiff; day++){
          
          if(this.ChatDetailsTutor.recurring_type  == 'Weekly'){
            let currentDay=moment(createFormValue.start_date).add(day,'day').format('dddd');
            if(createFormValue.day.indexOf(currentDay) != -1){
              dateDiffErr = 0;
              
              break;
            } 
          }else if(this.ChatDetailsTutor.recurring_type  == 'Monthly'){
            let currentDay="" + moment(createFormValue.start_date).add(day,'day').format('D');
            if(createFormValue.date.indexOf(currentDay) != -1 || createFormValue.date.indexOf(+currentDay) != -1){
              dateDiffErr = 0;
              
              break;
            }
          }

        }
        if(dateDiffErr == 1){
          this.dateRangeErr = `Unable to create sessions, since provided date range doesn't have selected ${this.ChatDetailsTutor.recurring_type   == 'Weekly'? 'day': 'date'} in it.`
          return;
        } else {
          this.dateRangeErr = ''
        }
       
       
      }

      if(this.ChatDetailsTutor.job_type == 'one-time' || this.ChatDetailsTutor.job_type == 'instant-tutoring'){
        body.start_date = moment(createFormValue.schedule_date).format('YYYY-MM-DD')
        body.end_date = moment(createFormValue.schedule_date).format('YYYY-MM-DD')
      } else if (this.ChatDetailsTutor.job_type == 'recurring'){
        body.start_date = moment(createFormValue.start_date).format('YYYY-MM-DD')
        body.end_date = moment(createFormValue.end_date).format('YYYY-MM-DD')
        if (this.ChatDetailsTutor.recurring_type == 'Weekly') {
          body.day = createFormValue.day.join();
        } else if (this.ChatDetailsTutor.recurring_type == 'Monthly') {
          body.mDate = createFormValue.date.join();
        }
      }
      body.job_id = this.ChatDetailsTutor.job_id,
      body.tutor_id = this.ChatDetailsTutor.ref_id
      body.start_time = moment(createFormValue.time,'hh:mm A').format('HH:mm:ss')
    
    this.studentService.fetchAvailabilityDates(body).subscribe((res:any)=> {
      if(res.success){
        // $('#apply_job').modal('hide');
        const formData  = new FormData();
        if(this.attachmentFile) {
          formData.append("attachment", this.attachmentFile , this.attachmentFile.name);
        }
        formData.append("tutor_id", this.ChatDetailsTutor.ref_id);
        formData.append("message", this.createOfferForm.value.message);
        formData.append("accepted_price", this.createOfferForm.value.price);
        formData.append("receiver_id", this.ChatDetailsTutor.ref_id);
        formData.append("job_id", this.ChatDetailsTutor.job_id);
        formData.append("user_id", this.userId);
        formData.append("message_board_room_id", this.ChatDetailsTutor.message_board_room_id);
        formData.append('time', moment(createFormValue.time, 'h:mm a').format('HH:mm:ss'));
        if(this.ChatDetailsTutor.job_type == 'recurring'){
          if(this.ChatDetailsTutor.recurring_type == 'Weekly'){
            formData.append('day', this.createOfferForm.value.day.join());
          }else if(this.ChatDetailsTutor.recurring_type == 'Monthly') {
            formData.append('date', this.createOfferForm.value.date.join());
          }
          formData.append('start_date', moment(createFormValue.start_date).format('YYYY-MM-DD'));
          formData.append('end_date', moment(createFormValue.end_date).format('YYYY-MM-DD'))
        } else {
          formData.append('schedule_date', moment(createFormValue.schedule_date).format('YYYY-MM-DD'))
        }
        // this.studentService.sendOffer(formData).subscribe((res: any) => {
        //   if(res.success){
          // this.notifier.success(res.message);
          $('#apply_job').modal('hide');
          this.formSubmitted = false;
          this.attachmentFile = null;
          this.createOfferForm.reset();
        let availabilityArray=[]
        for(let ele in res.data){
          let element = {date: ele, ...res.data[ele], title: this.ChatDetailsTutor.job_title,id:ele}
          availabilityArray.push(element)
        }
        // let socketData = {'receiver_id': this.ChatDetailsTutor.ref_id , 
        // 'reference_id': this.ChatDetailsTutor.message_board_room_id , 
        // 'notification': this.userInfo.full_name + ' has sent you job request', 
        // 'notification_message': this.userInfo.full_name + ' has sent you job request for the job ' + this.ChatDetailsTutor.job_title,
        //  'type' : 'send_offer'}
        let initialState={availability: availabilityArray, data: res.data, tutor_id: this.ChatDetailsTutor.ref_id, formData: formData}
        this.availabilityModal = this.modalService.show(AvailibilityModalComponent,{class:'send_offer_job',initialState})
        this.availabilityModal.content.websocket.subscribe((res:any)=> {
          if(res){
            this.websocketService.emit('student_contact_list', {user_id: this.ChatDetailsTutor.ref_id});
            this.websocketService.emit('send_notification', {'receiver_id': this.ChatDetailsTutor.ref_id , 
                                                              'reference_id': this.ChatDetailsTutor.message_board_room_id , 
                                                              'notification': this.userInfo.full_name + ' has sent you job request', 
                                                              'notification_message': this.userInfo.full_name + ' has sent you job request for the job ' + this.ChatDetailsTutor.job_title,
                                                               'type' : 'send_offer'})
            this.updateContactList = true;
            this.getMessages(false);
          }
        })
      } else {
        this.notifier.error(res.error_message||'Unable to get availability')
      }
      
    })
    
  }
 

}

  tutorEditOfferAcceptCalendar(id)
  {
    this.studentService.tutorEditOfferDetail(id).subscribe((res:any) => {
      if(res.success){
        const formData  = new FormData();
        let initialState={availability: res.data.json_session, updated_offer_id:id, tutor_id: res.data.tutor_id, offerType:'tutor-offer-accept', formData: formData}
        this.availabilityModal = this.modalService.show(AvailibilityModalComponent,{class:'send_offer_job',initialState})
      }else {
        this.notifier.error(res.error_message);
      }
    }, err => {
      this.notifier.error(err.error_message);
    })
  }


}