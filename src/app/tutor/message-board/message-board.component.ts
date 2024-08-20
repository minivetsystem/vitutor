import { AfterViewInit, Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common/services/common.service';
import { WebsocketService, LocalStorageService, AlertService, AttachmentService,GlobalVariablesService} from '@app/shared/_services/index';
import * as moment from 'moment-timezone';
// import * as tz from 'moment-timezone';
import { Socket } from 'socket.io-client';
import { TutorService } from '../tutor.service';

@Component({
  selector: 'app-message-board',
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.scss']
})
export class MessageBoardComponent implements OnInit, AfterViewInit {

  @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  userId;
  contactList = [];
  contactListErr: boolean;
  adminContactListErr : boolean;
  loader = false;
  ChatDetails = {rating_count:'',id : '',first_name: '', last_name: '',tutor_profile_image: '',  job_title: '', ref_id: '', job_id: '', message_board_room_id: '',receiver_role : '',sender_role : '',receiver_id:'', job_slug: '', tutor_name: '', experience_level: '', country: '', rating: 0};
  ChatDetailsTutor = {rating_count:'',about_me: '',hourly_rate: '', country:'' , job_title:'' }
  messagesArray = [];
  message;
  scrollContainer: any;
  searchText:string;
  uploadFile :any = null;
  sizeLimitError: boolean = false;
  fileTypeError: boolean = false;
  autoSelect: boolean = true;
  updateContactList :boolean = true;
  sentOfferDetails: any = null;
  uploadedFileObject = null;
  searchContactCount;
  aboutMenu: boolean = false;

  loginUserDetails;
  AdmincontactList = [];
  ChatDetailsAdmin:any = {};
  chatwithRoleType = 'student';
  lastMessage = {is_application_cancel: 0}
  menuToggle;
  timezone;
  constructor(
    private websocketService: WebsocketService,
    private localStorage: LocalStorageService,
    private notifier: AlertService,
    private Aroute: ActivatedRoute,
    private attachmentService : AttachmentService,
    private GlobalVariablesService : GlobalVariablesService,
    private commonService: CommonService
  ) {

    this.GlobalVariablesService.totalCount.subscribe((response) => {
      if(response) {
        window.setTimeout(() => {
          this.searchContactCount = response;
        },1000)
      }else{
        window.setTimeout(() => {
          this.searchContactCount = false;
        },1000)
      }
    });

    this.userId = this.localStorage.getRefId();
    this.loginUserDetails = JSON.parse(this.localStorage.get('user'));

    this.websocketService.listen(`students_${this.userId}_list`).subscribe((res: any) => {
      this.contactList = res.data.sort((a,b) => {
        return moment(a['created_at'],"YYYY-MM-DD HH:mm:ss").toDate() > moment(b['created_at'],"YYYY-MM-DD HH:mm:ss").toDate() ? -1 : 1
      });
      this.updateContactList = false;
      if(this.contactList.length > 0) {
        this.contactListErr = false;
        if(this.autoSelect) {
          this.ChatDetails = this.contactList[0];
          this.Aroute.queryParams.subscribe((data: any) => {
            if (data.ref_id && data.job_id) {
              this.ChatDetails = this.contactList.find(ele => {
                return ele.ref_id == data.ref_id && ele.job_id == data.job_id
              })
             
            }
            if(data.message_board_room_id){
              let find = this.contactList.find(ele => 
                ele.message_board_room_id == data.message_board_room_id)
                if(find){
                  this.ChatDetails = find
                }else {
                  this.ChatDetails = this.contactList[0]
                }
              
            }
            if(this.contactList && this.contactList.length > 0) {
              this.getMessages(false);
            }
          });
        }else{
          this.contactList.map((x) => {
            if(this.ChatDetails.message_board_room_id == x.message_board_room_id) {
              this.ChatDetails = x
            }
          })
          if(this.ChatDetails.receiver_id == this.userId) {
            this.websocketService.emit('message_read',{message_board_room_id : this.ChatDetails.message_board_room_id , user_id : this.userId});
            this.getMessages(false);
          }
        }
        this.autoSelect = false;
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
        this.websocketService.emit('tutor_contact_list', {user_id: this.ChatDetails.ref_id});
        this.updateContactList = true;
        this.getMessages(false);
        this.message = '';
      }
    });

    this.websocketService.listen(`request_slice_${this.userId}_upload`).subscribe((res: any) => {
      let place = res.currentSlice * 100000, 
      slice = this.uploadFile.slice(place, place + Math.min(100000, this.uploadFile.size - place)); 
      var reader = new FileReader();
      reader.readAsArrayBuffer(slice);
      let data = {
        user_id: this.userId,
        receiver_id: this.ChatDetails.ref_id,
        job_id: this.ChatDetails.job_id,
        message: this.message,
        message_board_room_id: this.ChatDetails.message_board_room_id,
        sender_id: this.userId,
        receiver_role : this.ChatDetails.receiver_role
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
    });

    this.websocketService.listen(`end_${this.userId}_upload`).subscribe((res :any) => {
      this.loader = false;
      if (res.status_code != 200) {
        // this.notifier.error(res.message);
      } else {
        // this.notifier.success(res.message);
        this.uploadFile = null;
        this.uploadedFileObject = null;
        this.websocketService.emit('tutor_contact_list', {user_id: this.ChatDetails.ref_id});
        this.updateContactList = true;
        this.getMessages(false);
        this.message = '';
      }
    });

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
          this.websocketService.emit('tutor_contacts',{})
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
          this.websocketService.emit('tutor_contacts',{})
          this.updateContactList = true;
          this.getAdminMessage();
          this.message = '';
        }
      })
    }
    

  }
  getMessage(string: string){
    if(string){
      const div = string.includes('message_link');
      if(div){
        let EndIndex = string.lastIndexOf('<br>');
        string = string.slice(0, EndIndex);
        return string && string.length > 0 ? string.slice(0,23) : '(empty)'
        // console.log(string)
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

  ngOnInit() {
    this.websocketService.emit('student_contact_list', {user_id: this.userId});
    this.localStorage.timeZone.subscribe((res:any) => {
      if(res){
        this.timezone = res
      } else {
        this.timezone = this.localStorage.getTimeZone();
      }
    })
    window.setTimeout(()=> {
      if(this.contactList.length == 0){
        this.contactListErr = true
      }else {
        this.contactListErr = false
      }
      
    },1000)
  }

  ngAfterViewInit() {
    this.fetchMessages();
    this.commonService.menuToggle.subscribe((res:number)=> {
      this.menuToggle = res;
    }, err => {
      this.menuToggle = 0;
    })
    // this.scrollContainer = this.scrollFrame.nativeElement;
    // this.itemElements.changes.subscribe(_ => this.scrollToBottom());
  }

  infoBtnClick(){
    this.aboutMenu = !this.aboutMenu;
  }

  ngOnDestroy() {
    this.websocketService.closeListener(`students_${this.userId}_list`);
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
      receiver_id: this.ChatDetails.ref_id,
      job_id: this.ChatDetails.job_id,
      message: this.message,
      message_board_room_id: this.ChatDetails.message_board_room_id,
      sender_id: this.userId,
      receiver_role : this.ChatDetails.receiver_role
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
    this.websocketService.emit('send_admin_messages',data);
  }

  getMessagesList(object,i) {
    this.contactList[i].is_read = 1;
    this.ChatDetails = object;
    this.loader = true;
    // this.updateContactList = true;
    this.uploadFile = null;
    this.uploadedFileObject = null;
    this.sizeLimitError = false;
    this.fileTypeError = false;
    if(this.ChatDetails.receiver_id == this.userId) {
      this.websocketService.emit('message_read',{message_board_room_id : this.ChatDetails.message_board_room_id , user_id : this.userId});
    }
    this.getMessages(false);
  }
  
  async getMessages(signal) {
    this.websocketService.emit('get_messages', {user_id: this.userId, receiver_id: this.ChatDetails.ref_id, job_id: this.ChatDetails.job_id, message_board_room_id: this.ChatDetails.message_board_room_id,tutor_id : this.userId, student_id : this.ChatDetails.ref_id});
  }

  fetchMessages() {
    this.websocketService.listen(`messages_${this.userId}_list`).subscribe((res: any) => {
      this.loader = false;
      const result = res.data;
      
      this.sentOfferDetails = res.job_offer_details && res.job_offer_details.length > 0 ? res.job_offer_details[0] : null;
      if(!this.sentOfferDetails){
        this.sentOfferDetails = [{}];
      }
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
      this.messagesArray = finalArray;
      this.lastMessage = Object.assign(this.lastMessage, (this.messagesArray[this.messagesArray.length - 1]).messages[(this.messagesArray[this.messagesArray.length - 1]).messages.length-1])
      if(this.updateContactList) { 
        this.websocketService.emit('student_contact_list', {user_id: this.userId});
      }
      let index = this.contactList.findIndex(x => x.message_board_room_id == this.ChatDetails.message_board_room_id);
      this.contactList[index].is_read = 1;
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

  changeTimeFormat(time) {
    // 08:07:55
    return (moment.utc(time,"HH:mm:ss").tz(this.timezone).format("hh:mm A"))
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
  stringify(chat){
    return JSON.stringify(chat)
  }

  onselectFile(evt) {
    this.sizeLimitError = false;
    this.fileTypeError = false;
    this.uploadFile = evt.target.files[0];
    const fileSize = parseFloat(Number(this.uploadFile.size/1024/1024).toFixed(2));
    if(this.uploadFile && this.uploadFile.type != 'image/png' && this.uploadFile.type != 'image/jpeg' && this.uploadFile.type !='application/pdf'
    && this.uploadFile.type != 'application/msword' && this.uploadFile.type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    && this.uploadFile.type != 'application/vnd.ms-excel' && this.uploadFile.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
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
    if((text.length == 0 || text[0] == "")) {
      return true;
    }else if(this.lastMessage.is_application_cancel == 1) {
      return true;
    } else {
      return false;
    }
  }
  

  offerDateFormat(date, timezone) {
    return moment.utc(date,"YYYY-MM-DD HH:mm:ss").tz(this.timezone).format("MM-DD-YYYY hh:mm A")
  }
  scheduleFormat(date,time, timezone){
    let sDate = date.split('T')[0]
    time = time.indexOf('T') > -1 ? time.split('T')[1] : time
    return moment.utc(sDate + ' ' + time,"YYYY-MM-DD HH:mm:ss").tz(this.timezone).format("MM-DD-YYYY")
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
  scheduleTimeFormat(time, timezone?){
    if(time.indexOf('T')>-1){
      return moment.utc(time).tz(this.timezone).format('hh:mm A');
    } else {
      return moment.utc(time,'HH:mm:ss').tz(this.timezone).format('hh:mm A');
    }
    
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
      this.attachmentService.downloadFile(Url, this.sentOfferDetails.attachment_name);
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
      receiver_id: this.ChatDetails.ref_id,
      job_id: this.ChatDetails.job_id,
      message: this.message,
      message_board_room_id: this.ChatDetails.message_board_room_id,
      sender_id: this.userId,
      receiver_role : this.ChatDetails.receiver_role
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

  chatRoleType(type) {
    this.message = '';
    this.uploadFile = null;
    this.sizeLimitError = false;
    this.fileTypeError = false;
    this.sentOfferDetails = null;
    this.chatwithRoleType = type;
    this.messagesArray = [];
    this.autoSelect = true;
    if(type == 'admin') {
      // this.autoSelect = true;
      this.websocketService.emit('admin_contacts', {user_id: this.userId, user_role_id : this.loginUserDetails.role_id});
    }else{
      this.websocketService.emit('student_contact_list', {user_id: this.userId}); 
      this.autoSelect = false;
      this.getMessages(false)
      this.fetchMessages();
    }
  }

  getAdminMessage() {
    this.websocketService.emit('chat_details',{user_role_id : this.loginUserDetails.role_id,chat_id: this.userId,message_board_room_id : this.ChatDetailsAdmin.message_board_room_id})
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
  chatImageError(event){
    event.target.src = 'assets/img/avatar_user2.jpg';
  }

  sessionUpdate(json,msg){
    let data = JSON.parse(json);
    let prevStartDate=moment.utc(data.previous_start_time,'YYYY-MM-DD HH:mm').utc().tz(this.timezone).format('hh:mm A');
    let prevEndTime=moment.utc(data.previous_end_time,'YYYY-MM-DD HH:mm').tz(this.timezone).format('hh:mm A');
    let newStartTime=moment.utc(data.updated_start_time,'YYYY-MM-DD HH:mm').tz(this.timezone).format('hh:mm A')
    let newEndTime=moment.utc(data.updated_end_time,'YYYY-MM-DD HH:mm').tz(this.timezone).format('hh:mm A');
    return (`<p><strong>${msg}</strong></p>
    <p><strong>Schedule Date:</strong>${moment(data.schedule_date,'MM-DD-YYYY').tz(this.timezone).format('dddd MM-DD-YYYY')} </p>
    <p><strong>Previous start Time: </strong> ${prevStartDate}</p>
    <p><strong>Previous end Time: </strong> ${prevEndTime}</p>
    <p><strong>Updated start Time: </strong> ${newStartTime}</p>
    <p><strong>Updated end Time: </strong> ${newEndTime}</p>`
    )
  }

 
  
}
