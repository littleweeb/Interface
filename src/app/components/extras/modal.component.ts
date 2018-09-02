import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {SemanticService} from '../../services/semanticui.service'

/**
 * (EXTRA) Modal Component,
 * Allows to show modal's on any given view.
 * 
 * @export
 * @class Modal
 */
@Component({
    selector: 'modal',
    templateUrl: './html/modal.component.html',
    styleUrls: ['./css/modal.component.css']
})
export class Modal {
    messageTitle : string;
    messageBody : string;
    messageIcon : string;
    actions : string;

    /**
     * Creates an instance of Modal.
     * @param {ShareService} shareService (used for receiving information from other Components & Services) 
     * @param {SemanticService} semanticService (used to control SemanticUI CSS Framework through jquery)
     * @memberof Modal
     */
    constructor(private shareService:ShareService, private semanticService:SemanticService){
        this.semanticService.hideModal('.ui.basic.modal.message');
        this.shareService.modalMessage.subscribe(message=>{            
                    
            this.consoleWrite(message);
            if(message != null){
               
                if(message[0] != "HIDE"){
                     //showloader with message
                     this.messageTitle = message[0];
                     this.messageBody= message[1];
                     this.messageIcon = message[2];
                     this.actions = message[3];
                     this.semanticService.showModal('.ui.basic.modal.message');
                } else {
                     this.semanticService.hideModal('.ui.basic.modal.message');
                }
            } 
        });
    }

    
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }
}