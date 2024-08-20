import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {TutorService} from '../tutor.service';
import { AlertService } from '@app/shared/_services';
declare const $: any;

@Component({
  selector: 'app-view-offer',
  templateUrl: './view-offer.component.html',
  styleUrls: ['./view-offer.component.scss']
})
export class ViewOfferComponent implements OnInit {
  offerId;
  OfferDetails={accepted_price: '', image_url: '', id: '', status: '', job_detail: {
    job_title: '', price: '', duration: 1, schedule_date: '', created_at: '' , price_type: '', id: '', status: '',job_recurring : null, job_category: '', sub_category_id: '', job_description:'', job_type: ''}, student: {
      full_name: '', image_url: ''
    }, price: 1};

    acceptOfferObj = {job_title: '', price: '', id: '', accepted_price: ''};
    acceptSubmitted= false;
    acceptReason = ''
    rejectOfferObj = {id: null, job_title: ''};
    declineReason = '';
    declineSubmitted = false;
    offerPrice;
    
  constructor(private location: Location, private activeRoute: ActivatedRoute, private tutorService: TutorService, private notifier: AlertService ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(res => {
      this.offerId = res.id;
      this.getOffer();
      }, error => {
    });
  }

  goBack() {
    this.location.back();
  } 

  getOffer() {
    if(this.offerId) {
      this.tutorService.getOfferDetails(this.offerId).subscribe((res: any)=> {
        this.OfferDetails = Object.assign( this.OfferDetails,res.data, {price : res.data.accepted_price.substring(1, res.data.accepted_price.length)});
        this.offerPrice = res.data.accepted_price;
        // this.OfferDetails = res.data;
        // this.OfferDetails.price = this.OfferDetails.accepted_price.substring(1, this.OfferDetails.accepted_price.length)

      });
    }
  }

  acceptOffer() {
    this.acceptOfferObj = Object.assign(this.acceptOfferObj,this.OfferDetails.job_detail);
    $('#acceptOfferModal').modal('show');
  }

  rejectOffer() {
    this.rejectOfferObj = Object.assign(this.rejectOfferObj,this.OfferDetails.job_detail);;
    $('#rejectOfferModal').modal('show');
  }


  acceptOfferSubmit() {
    this.acceptSubmitted = true;
    if(this.acceptOfferObj.id == null)  {
      return;
    }
    
    const body = {
      offer_id: this.OfferDetails.id,
      status: 1,
      comment: this.acceptReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        // this.acceptOfferObj = {id: null};
        this.acceptReason = '';
        this.acceptSubmitted = false;
        $('#acceptOfferModal').modal('hide');
        if(res.success){
          this.OfferDetails.status='Accepted';
        }
       
    }, err => {
      this.notifier.error(err.error.error_message);
    })

  }
  rejectOfferSubmit() {
    this.declineSubmitted = true;
    if(this.rejectOfferObj.id == null)  {
      return;
    }
    if(this.declineReason == ''){
      return;
    }
    const body = {
      offer_id: this.OfferDetails.id,
      status: 2,
      comment: this.declineReason
    }

    this.tutorService.changeOffer(body).subscribe((res: any) => {
        this.notifier.success(res.success_message);
        this.rejectOfferObj = {id: null, job_title:''};
        this.declineReason = '';
        this.declineSubmitted = false;
        $('#rejectOfferModal').modal('hide');
        if(res.success) {
          this.OfferDetails.status='Declined';
        }
       
    }, err => {
      this.notifier.error(err.error.error_message);
    })
  }

  closeAcceptModal() {
    this.acceptReason = '';
    this.acceptSubmitted = false;
    $('#acceptOfferModal').modal('hide');
  }
  closeRejectModal() {
    this.declineReason = '';
    this.declineSubmitted = false;
    $('#rejectOfferModal').modal('hide');
  }

}
