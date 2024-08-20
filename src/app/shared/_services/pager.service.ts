import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagerService {
  constructor() {}
  getPager(totalItems: number, currentPage: number = 1, pageSize: number = 10) {
    // calculate total pages

    const totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= 7) {
      // less than 7 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 7 total pages so calculate start and end pages
      if (totalPages >= 7 && currentPage <= 3) {
        startPage = 1;
        endPage = 7;
      } else if (currentPage >= 4 && currentPage <= totalPages - 3) {
        startPage = currentPage - 3;
        endPage = currentPage + 3;
      } else {
        startPage = totalPages - 6;
        endPage = totalPages;
      }
    }

    // calculate start and end item indexes
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    const pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
      i => startPage + i
    );
    const hidePages = Array.from(Array(endPage + 1 - startPage).keys()).map(i => {
      let hide = 0;
      if (startPage >= 8) {
        hide = 1;
      }
      return hide;
    });


    // return object with all pager properties required by the view
    return {
      totalItems,
      currentPage,
      pageSize,
      totalPages,
      startPage,
      endPage,
      startIndex,
      endIndex,
      pages
    };
  }
}
