import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {SemanticService} from '../../services/semanticui.service'

/**
 * (EXTRA) Loader Component
 * 
 * 
 * @export
 * @class Loader
 */
@Component({
    selector: 'loader',
    templateUrl: './html/loader.component.html',
    styleUrls: ['./css/loader.component.css']
})
export class Loader {
    message : string;
    showLoader : boolean;
    zindex : number;
    
    /**
     * Creates an instance of Loader.
     * @param {ShareService} shareService (used for receiving information from other Components & Services)
     * @param {SemanticService} semanticService (used for controlling SemanticUI CSS Framework through jQuery)
     * @memberof Loader
     */
    constructor(private shareService:ShareService, private semanticService:SemanticService){
        this.showLoader = false;
        this.shareService.loaderMessage.subscribe(message=>{    
            this.consoleWrite(message);
            if(message != null){
               
                if(message != "HIDELOADER"){
                     //showloader with message
                     this.openLoader(message);
                } else {
                     this.closeLoader();
                }
            } else {
               this.openLoader("Loading");
            }
        });
    }

    /**
     * Closes loader.
     * 
     * @memberof Loader
     */
    closeLoader(){
        this.showLoader = false;
        this.semanticService.hideObject('.element');
        this.zindex = -100;
    }

    /**
     * Opens a loader.
     * 
     * @param {string} message (If set, it will show a message during loading.)
     * @memberof Loader
     */
    openLoader(message: string){
        this.message =  message;
        this.showLoader = true;
        this.zindex = 100;
        this.semanticService.showObject('.element');
    }
    
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }
}