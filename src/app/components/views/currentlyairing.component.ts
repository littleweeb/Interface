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
                    this.latestAired = message.result;
                    this.shareService.hideLoader();
                    
                    var seconds = new Date().getTime() / 1000;
                    this.shareService.storeDataLocal("currently_airing",JSON.stringify( {currentTime: seconds, airing: message.result }));
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
        var retreiveAiring = this.shareService.getDataLocal("currently_airing");
        if(retreiveAiring != false){                         
              
            var airing = JSON.parse(retreiveAiring);
            var seconds = new Date().getTime() / 1000;
            this.shareService.showMessage("succes", "Loading Cached CurrentlyAiring - aprox " + Math.round((seconds - airing.currentTime)) + " before refresh!"); 
            this.latestAired = airing.airing; 
            this.showCurAir = true;
            this.shareService.hideLoader();
            if(seconds - airing.currentTime > 100){
                
                this.shareService.showMessage("succes", "Updating currently airing."); 
           
                this.backEndService.getAllCurrentlyAiring();
            }
            
        } else {

            this.backEndService.getAllCurrentlyAiring();
        }    

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
