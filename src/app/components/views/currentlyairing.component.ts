import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {ShareService} from '../../services/share.service'
import {BackEndService} from '../../services/backend.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';


/**
 * (VIEW) Shows currenltyairing view,
 * CurrentlyAiring Component retreives all currently airing anime and shows them.
 * 
 * @export
 * @class CurrentlyAiring
 */
@Component({
    selector: 'currentlyairing',
    templateUrl: './html/currentlyairing.component.html',
    styleUrls: ['./css/currentlyairing.component.css']
})
export class CurrentlyAiring {
    latestAired : any;
    currentlyAiringLoading : boolean;
    waitForDataInterval : any;
    animeTitle : string;
    showCurAir : boolean;
    showAnime : boolean;
    daysArray : any;
    fulltitle : string;
    private today : string;
    private modalToShow : number;
    

    /**
     * Creates an instance of CurrentlyAiring.
     * @param {KitsuService} kitsuService  (used for retreiving anime information using Kitsu's API)
     * @param {ShareService} shareService  (used for sharing and receiving information from other Components & Services)
     * @param {Router} router 
     * @memberof CurrentlyAiring
     */
    constructor( private shareService: ShareService, private backEndService: BackEndService,  private router: Router){
        this.currentlyAiringLoading = false;
        this.animeTitle = "Anime";
        this.showCurAir = true;
        this.showAnime = false;
        this.daysArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];



        this.backEndService.websocketMessages.subscribe((message) => {
            if(message !== null){
                if(message.type == "anime_info_currently_airing"){
                    console.log(message);
                    if(this.latestAired !== undefined){
                        if(this.latestAired.updated != message.result.updated){
                            this.latestAired = message.result;
                        }
                    } else {
                        this.latestAired = message.result;
                    }
                    this.shareService.hideLoader();
                    
                    this.shareService.showMessage("succes", "Currently Airing Updated!");     
                }
            }
        });

    }

    /**
     * It checks if a list with currently airing exists within localstorage and then determines when te last time currently airing has been retreived,
     * it will refresh the currently airing information if more than 5 minutes has passed and store it within localstorage.
     * 
     * @memberof CurrentlyAiring
     */
    async ngOnInit(){
        this.shareService.showLoaderMessage("Loading currently airing!");

        var data;
   
        this.backEndService.getAllCurrentlyAiring(false);
        this.backEndService.getAllCurrentlyAiring(true);



    }
    
    /**
     * Used to show full anime title when the user hovers over the anime card/cover.
     * 
     * @param {string} animetitle (title to show)
     * @memberof CurrentlyAiring
     */
    setPopUpContent(animetitle: string){        
        this.fulltitle = animetitle;        
    }

    /**
     * Used to redirect to animeinfo.component.ts view for showing the anime
     * 
     * @param {*} anime (anime json object to show) 
     * @memberof CurrentlyAiring
     */
    showAnimeInfoFor(anime : any){
        this.consoleWrite(anime);
        this.shareService.showLoader();
        this.shareService.animetoshow.next(anime);
        this.router.navigate(['animeinfo']);      
    }

    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }

}
