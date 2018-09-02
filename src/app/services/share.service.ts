import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';
import {Router} from '@angular/router';

/**
 * (SERVICE) ShareService
 * This service is meant to be used for sharing information between components and services.
 * 
 * @export
 * @class ShareService
 */
@Injectable()
export class ShareService {

    public animetoshow : Subject<any> = new BehaviorSubject<any>(null);
    public updatetitle : Subject<string> = new BehaviorSubject<string>(null);
    public downloadamount : Subject<number> = new BehaviorSubject<number>(null);
    public favoriteamount : Subject<number> = new BehaviorSubject<number>(null);
    public toastmessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public loaderMessage : Subject<string> = new BehaviorSubject<string>(null);
    public modalMessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public showFileDialogEvent : Subject<Boolean> = new BehaviorSubject<Boolean>(null);
    public searchQuery : Subject<string> = new BehaviorSubject<string>(null);
    public isLocal : boolean;
    public baseDownloadDirectory :string;

    public webSocketLog : any = new Array();

    public defaultResolution : string = '720p';
    public enableConsoleLog : boolean = false;

  
    private favoritecount : number = 0;
    

    /**
     * Creates an instance of ShareService.
     * @memberof ShareService
     */
    constructor( private router: Router){
        this.isLocal = true;
    }   

    /**
     * Routes to a view without the need for importing router seperate as long as share service has been imported.
     * 
     * @param {string} view (view it has to go to)
     * @memberof ShareService
     */
    routeToView(view:string){
        this.router.navigate[view];
    }

    /**
     * Updates the amount of downloads value shown in the sidebar (located in app.component.ts).
     * 
     * @param {number} num 
     * @memberof ShareService
     */
    updateAmountOfDownloads(num:number){
        this.downloadamount.next(num);
    }    
   
    /**
     * Shows a toaster messsage using (toaster.component.ts)
     * 
     * @param {string} type (message type (error or success for example))
     * @param {string} msg (message to show)
     * @memberof ShareService
     */
    showMessage(type: string, msg:string){
        var tobeshown = [type, msg];
        this.toastmessage.next(tobeshown);
    }

    /**
     * Shows a loader with a message using(loader.component.ts)
     * 
     * @param {string} message (message to show)
     * @memberof ShareService
     */
    showLoaderMessage(message: string){
        this.loaderMessage.next(message);
    }

    /**
     * Shows a loader without a message using(loader.component.ts)
     * 
     * @memberof ShareService
     */
    showLoader(){
        this.loaderMessage.next("Loading");
    }

    /**
     * Hides loader using (loader.component.ts)
     * 
     * @memberof ShareService
     */
    hideLoader(){
        this.loaderMessage.next("HIDELOADER");
    }

    /**
     * Shows a modal using (modal.component.ts)
     * 
     * @param {string} title (Title of modal)
     * @param {string} message (Message to show)
     * @param {string} icon (Icon to show)
     * @param {string} actions (Actions (can be html styled))
     * @memberof ShareService
     */
    showModal(title:string,message:string,icon:string,actions:string){
        var combine = [title,message,icon,actions];
        this.modalMessage.next(combine);
    }

    /**
     * Hides modal using (modal.component.ts)
     * 
     * @memberof ShareService
     */
    hideModal(){
        var combine = ["HIDE"];
        this.modalMessage.next(combine);
    }

    /**
     * Shows file dialog using (filedialog.component.ts)
     * 
     * @memberof ShareService
     */
    showFileDialog(){
        this.showFileDialogEvent.next(true);
    }

    /**
     * Hides file dialog using (filedialog.component.ts)
     * 
     * @memberof ShareService
     */
    hideFileDialog(){
        this.showFileDialogEvent.next(false);
    }

    /**
     * Get amount of favorites (shown in sidebar located at app.component.ts)
     * 
     * @memberof ShareService
     */
    getFavoritAnimeCount(){
        let getCurrentFavorites = this.getDataLocal("favorites");
        if(getCurrentFavorites){
             let currentFavorites = JSON.parse(getCurrentFavorites);
             this.favoriteamount.next(this.favoritecount);
        }
    }  

    /**
    * Stores information within localstorage
    * 
    * @param {string} key (identifier key)
    * @param {string} data (data to store)
    * @returns {boolean} (false if item could not be set)
    * @memberof ShareService
    */
    storeDataLocal(key:string, data:string){
        return localStorage.setItem(key, data) || false;
    }

    /**
     * Returns inforamtion from localstorage
     * 
     * @param {string} key (identifier key of information to retreive)
     * @returns {string | boolean:false} (returns boolean if it could not retreive information/returns string with information if it succeeds)
     * @memberof ShareService
     */
    getDataLocal(key : string){
        return localStorage.getItem(key) || false;
    }
    

}