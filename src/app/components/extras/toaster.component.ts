import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'

/**
 * (EXTRA) Toaster Component,
 * Allows to show toasters on any page.
 * 
 * @export
 * @class Toaster
 */
@Component({
    selector: 'toaster',
    templateUrl: './html/toaster.component.html',
    styleUrls: ['./css/toaster.component.css']
})
export class Toaster {
    message : string;
    type : string;
    toasterclasses : string;

    /**
     * Creates an instance of Toaster.
     * @param {ShareService} shareService (Used to receive information from other Components & Services)
     * @memberof Toaster
     */
    constructor(private shareService:ShareService){
        this.shareService.toastmessage.subscribe(message=>{
            this.consoleWrite(message);
            if(message != null){
                this.message = message[1];
                this.toasterclasses = "show " + message[0];
                setTimeout(()=>{
                    this.toasterclasses = "";
                }, 3000);
            }
        });
    }

    
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }
}