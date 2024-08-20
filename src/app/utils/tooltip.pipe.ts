import { Pipe } from '@angular/core';
import _ from 'lodash';
@Pipe({
  name: 'tooltip'
})
export class TooltipPipe {
  transform(id: any): string {
    let tooltipValue = JSON.parse(localStorage.getItem('tooltipData'));
    const findRow = _.find(tooltipValue, { id, status: 1 });
    if (findRow != undefined) {
      return (tooltipValue = findRow.tooltiptag_description);
    }
  }
}
