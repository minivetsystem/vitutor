import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "limitTo"
})

export class TruncatePipe implements PipeTransform {
  transform(value: string, args: string): string {
    let limit = args ? parseInt(args, 10) : 10;
    let trail = "...";
    if(value){
      return value.length > limit ? value.substring(0, limit) + trail : value;
    }else{
      return value;
    }
  }
}