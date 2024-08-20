import { Component, OnInit } from '@angular/core';
import {environment } from '../../../../environments/environment';
import {AlertService } from '../../_services/index'

@Component({
  selector: 'app-long-footer',
  templateUrl: './long-footer.component.html',
  styleUrls: ['./long-footer.component.scss']
})
export class LongFooterComponent implements OnInit {
  variables = environment;
  isValidEmail = true;
  constructor(private notifier: AlertService) { }

  ngOnInit() {
  }

  facebook(){
    window.open("https://www.facebook.com/sharer/sharer.php?u=", "facebook", "width=200,height=600");
  }

  instagram(){
    
    window.open("https://www.instagram.com/sharer.php?u=", "Intagram", "width=600,height=600");
  }

  twitter(){
    window.open("https://twitter.com/intent/tweet?url=", "Twitter", "width=200,height=600");
  }

  youtube(){
    window.open("https://www.youtube.com", "facebook", "width=200,height=600");
  }
  likndIn(){
    window.open("http://www.linkedin.com/shareArticle?url=", "Linkedin", "width=200,height=600");
  }

  subcriptionMail(email){
    email.value='';
    this.isValidEmail = true;
    this.notifier.success('You have successFully subscribed.')

  }

  validMail(email){
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.isValidEmail = re.test(email);
  }

}
