import { Pipe, PipeTransform } from '@angular/core';
import { GlobalVariablesService } from '../_services/global-variables.service';

@Pipe({ 
    name: 'LisitingFilter'
})

export class UserListPipe implements PipeTransform {

    constructor(
        private GlobalVariablesService : GlobalVariablesService
    ){}

    transform(allUsers:any,term:string) {
        if(term){
            if(term.length <= 2){
                this.GlobalVariablesService.noContact(false);
                return allUsers
            }
            else{
                var user =  allUsers.filter((results) =>{
                    return (
                        (results.tutor_name && results.tutor_name.toLowerCase().indexOf(term.toLowerCase()) >= 0) ||
                        // (results.last_name && results.last_name.toLowerCase().indexOf(term.toLowerCase()) >= 0) ||
                        (results.job_title && results.job_title.toLowerCase().indexOf(term.toLowerCase()) >= 0) 
                    )
                });
                if(user && user.length == 0) {
                    this.GlobalVariablesService.noContact(true);
                }else{
                    this.GlobalVariablesService.noContact(false);
                }
                return user
            }
        }
        else{
            this.GlobalVariablesService.noContact(false);
            return allUsers
        }
        
    }
}