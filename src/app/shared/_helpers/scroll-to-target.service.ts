import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class ScrollToTargetService {
  constructor() {}

  /**
   * Scroll to anchor
   *
   * @param {string} location Element id
   * @param {string} wait     Wait time in milliseconds
   */

  public scrollToAnchor(location: string, wait: number): void {
    const element = document.querySelector('#' + location);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }, wait);
    }
  }
}
