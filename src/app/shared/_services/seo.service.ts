import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class SeoService {
  constructor(private titleService: Title) {}

  setPageTitle(title: string) {
    this.titleService.setTitle(title);
 }

}
