import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Http} from '@angular/http';
import {Subject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import {ShareService} from '../../services/share.service'
import {NiblService} from '../../services/nibl.service'
import {UtilityService} from '../../services/utility.service'
import {SemanticService} from '../../services/semanticui.service'
import {BackEndService} from '../../services/backend.service'
import {KitsuService} from '../../services/kitsu.service'
import {DownloadService} from '../../services/download.service'

/**
 * (VIEW) Shows AnimeInfo view
 * AnimeInfo Component shows episodes and information about the anime.
 *  
 * @export
 * @class AnimeInfo
 */
@Component({
    selector: 'animeinfo',
    templateUrl: './html/animeinfo.component.html',
    styleUrls: ['./css/animeinfo.component.css']
})
export class AnimeInfo{

    //episode stuff
    botList : any[];
    botname : string;
    possibleresolutions : any[];
    resolution : string = "720";
    showAllBots : boolean;
    showAllResolutions : boolean;
    selectedItems : any[];
    packsSelected :boolean;
    title : string;
    episodeList: any[];
    movieList: any[];
    prefferedbots : string[];
    showList : boolean;
    showError : boolean; 
    downloads : any[];
    alreadyDownloadedFiles : any[];
    fileExtensions : any[] = [".mkv", ".mp4", ".avi"];
    currentPage: number = 0;
    localObject : Object;

    //dropdown custom
    dropdownres : string = "All Resolutions";


    //information view
    animeInfo : any;
    showEpisodes : boolean = true;
    showInfo : boolean = false;
    showTrailer: boolean= false;
    showDownload: boolean = false;
    isLocal : boolean = false;
    enableAdvanced : boolean = false;
    doneLoading : boolean = false;
    showAlreadyDownloaded : boolean = false;

    //anime-relations  https://github.com/erengy/anime-relations
    animeRelations : string = "";

    //littleweebrules https://raw.githubusercontent.com/littleweeb/LittleWeebRules/master/littleweebrules.txt
    littleWeebRules : string = "";
    //debugging
    enableDebug : boolean = false;

    //download stuff
    waitingToPlay :boolean = false;
    episodeToPlay :number = 0;

   /**
    * Creates an instance of AnimeInfo.
    * @param {Http} http (for http requests)
    * @param {Router} router (for redirecting)
    * @param {DownloadService} downloadService (for download communication)
    * @param {KitsuService} kitsuService (for requesting anime information)
    * @param {ShareService} shareService (for sharing and getting info from other components and services)
    * @param {NiblService} niblService (for requesting episode files from nibl.co.uk)
    * @param {UtilityService} utilityService (for using functions that are not specifick for this component)
    * @param {SemanticService} semanticui (for controlling semantic ui css framework through jquery)
    * @param {BackEndService} backEndService (for communicating with the backend)
    * @memberof AnimeInfo
    */
   constructor(private http:Http, private router: Router, private downloadService : DownloadService, private kitsuService: KitsuService, private shareService: ShareService, private niblService:NiblService, private utilityService: UtilityService, private semanticui : SemanticService, private backEndService: BackEndService){
        this.consoleWrite("initianted animeinfo");
        this.doneLoading = false;
        this.botname = "all";
        this.showAllBots = true;
        this.showAllResolutions = false;
        this.packsSelected = false;
        this.selectedItems = [];
        this.title = "";
        this.showList = false;
        this.showError = false;
        this.botList = new Array();
        this.prefferedbots  = ["CR-HOLLAND|NEW", "CR-AMSTERDAM|NEW", "CR-FRANCE|NEW", "Ginpachi-Sensei", "Cerebrate"];
        this.animeInfo = {};
        this.showEpisodes = true;
        this.showInfo = false;
        this.showTrailer = false;
        this.enableDebug = true;
        this.possibleresolutions = new Array();       
        this.possibleresolutions.push({value : "720P", name : "720p"});
        this.possibleresolutions.push({value : "480P", name : "480p"});
        this.possibleresolutions.push({value : "1080P", name : "1080p"});
        this.possibleresolutions.push({value : "ALL", name : "All"});

        this.episodeList= new Array();
        this.movieList = new Array();

        if(this.backEndService.address.indexOf("local") > -1 || this.backEndService.address.indexOf("127.0.0.1") > -1){
            this.isLocal = true;
        }

        this.backEndService.websocketMessages.subscribe((message) => {
            if(message !== null){
                console.log(message);
                switch(message.type){
                    case "kitsu_anime_info":
                        console.log("ANIME INFO!!!");
                        this.animeInfo = message;
                        this.botList = message.anime_bot_sources;
                        this.semanticui.enableAccordion();
                        this.semanticui.enableDropDown();
                        this.doneLoading = true;
                         this.showError = false;
                         this.showInfo = true;
                         this.shareService.hideLoader();
                        break;
                }
            } 
        });

        this.downloadService.updateDownloadList.subscribe((listwithdownloads)=>{
            if(listwithdownloads != null){                
                this.downloads = []; 
                for(let download of listwithdownloads){
                
                    if(download.animeInfo.animeid == this.animeInfo.id){
                        this.downloads.push(download);
                    }
                }
                this.showDownload = true;  
            } else {
                this.downloads = []; 
                this.showDownload = false;
            }
            
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown();
        });

       
        this.shareService.updatetitle.next(this.title);      
        this.semanticui.enableAccordion();
        this.semanticui.enableDropDown();
       
    }
    /**
     * Checks if the anime to be shown has already been loaded/parsed before opening this view(if not request all info, else , show already retreived information)
     * 
     * @memberof AnimeInfo
     */
    async ngOnInit(){

        let possibledefaultresolution = this.shareService.getDataLocal("default_resolution");
        if(possibledefaultresolution != false){
            if(possibledefaultresolution == "all"){
                this.showAllResolutions = true;
                this.resolution = "UNKNOWN";
                this.dropdownres = "All Resolutions";
            } else {
                this.showAllResolutions = false;
                this.resolution = possibledefaultresolution;
                
                this.dropdownres = possibledefaultresolution;
            }
        } else {
            this.shareService.storeDataLocal("default_resolution", '720P');      
        }


        
        this.shareService.animetoshow.take(1).subscribe(async(anime) => {
            if(anime !== null){
                
                this.consoleWrite("got mah anime");
                this.consoleWrite(anime);
                this.shareService.showLoaderMessage("Loading anime: " + anime.attributes.canonicalTitle + ", the first time might take a few seconds!" );   
               
                if(this.animeInfo === undefined){
                    this.backEndService.getAnimeInfo(anime.id);
                    this.backEndService.getAnimeInfoWithEpisodes(anime.id);
                    this.title = anime.attributes.canonicalTitle ;     
                    this.shareService.updatetitle.next(this.title); 
                    
                } else {
                    if(this.animeInfo.id != anime.id){
                        this.backEndService.getAnimeInfo(anime.id);
                        this.backEndService.getAnimeInfoWithEpisodes(anime.id);
                        this.title = anime.attributes.canonicalTitle ;     
                        this.shareService.updatetitle.next(this.title); 
                    } 
                }
               
            } else {
                if(this.animeInfo === undefined){
                    this.title = "No episodes found!";
                    this.showError = true;
                    this.shareService.hideLoader();
                    
                    this.downloadService.getAlreadyDownloaded();
                    this.doneLoading = true;   
                }
            }
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown();
        }); 

        
        setTimeout(()=>{                
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown();
        }, 100);
    }

    getPreviousPage(){
        let getLocalStoredAnime = this.shareService.getDataLocal("anime_view");
        if(getLocalStoredAnime != false){
           
            let animeView = JSON.parse(getLocalStoredAnime);
            if(animeView.title != ""){
              
                
                this.showAllBots = animeView.showAllBots;
                this.showAllResolutions = animeView.showAllResolutions;
                this.packsSelected = animeView.packsSelected;
                this.selectedItems = animeView.selectedItems;
                this.title = animeView.title;
                this.showError =  animeView.showError;
                this.prefferedbots = animeView.prefferedbots;
                this.animeInfo = animeView.animeInfo;
                this.enableDebug = true;
                this.consoleWrite(this.animeInfo);
                if(this.animeInfo !== undefined){
                    this.shareService.updatetitle.next(this.animeInfo.anime_info.data[0].attributes.canonicalTitle);
                    this.doneLoading = true;
                    this.shareService.hideLoader();
                } 
                
                
            }
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown(); 

        }
    }

    /**
     * Stores currently shown information locally so it doesnt have to reload/request the information if user switches between views
     * 
     * @memberof AnimeInfo
     */
    ngOnDestroy(){

        var simpleObject = {
            botname : this.botname,
            showAllBots : this.showAllBots,
            showAllResolutions : this.showAllResolutions,
            packsSelected : this.packsSelected,
            selectedItems : this.selectedItems,
            title : this.title,
            showError : this.showError,
            prefferedbots : this.prefferedbots,
            animeInfo : this.animeInfo,
            enableDebug : this.enableDebug
        }
        this.consoleWrite(simpleObject);
        this.shareService.storeDataLocal("anime_view", JSON.stringify(simpleObject));
    }

   
    
    /**
     * Opens all collapsed accordions with episode files (only in advanced mode)
     * 
     * @memberof AnimeInfo
     */
    showAll(){
        var i = 0;
        this.consoleWrite(this.episodeList.length);
        for(i = 0; i < this.episodeList.length; i++){                        
           this.semanticui.openAccordion(i);
        }
    }

    /**
     *  Closes all opened accordions with episode files (only in advanced mode)
     * 
     * @memberof AnimeInfo
     */
    closeAll(){
        var i = 0;
         for(i = 0; i < this.episodeList.length; i++){
            
            this.semanticui.closeAccordion(i);
        }
    }    
    
   /**
    * uses function AnimeInfo.selectBestEpisode to select best file for each episodes and appends them to the download queue
    * 
    * @memberof AnimeInfo
    */
    batchAll(){       
        var i = 0;
        let batchDownloads = [];
        for(i=0; i < this.episodeList.length;i++){
            if(this.episodeList[i] != "not defined"){
                let files = this.episodeList[i][0].files;
                this.consoleWrite(files);
                for(let file of files){
                    if(this.prefferedbots.indexOf[file.botId] && file.name.indexOf(this.resolution) != -1){
                        this.consoleWrite("Found best file:");
                        this.consoleWrite(file);
                        var genid = this.utilityService.generateId(file.botId, file.number);
                        var newDownload = {id :genid, animeInfo: { animeid : this.animeInfo.id, title: this.animeInfo.animeInfo.canonicalTitle, cover_original : this.animeInfo.animeInfo.posterImage.original, cover_small: this.animeInfo.animeInfo.posterImage.small}, episodeNumber: file.episodeNumber, pack : file.number, bot: file.botId, filename: file.name, filesize: file.size, status : "Waiting", progress : "0", speed : "0"};
                        batchDownloads.push(newDownload);
                        break;
                    } else if(file.name.indexOf(this.resolution)  != -1){
                        this.consoleWrite("Found best file:");
                        this.consoleWrite(file);                
                        //this.appendToDownloadsDirectly(file);

                        var genid = this.utilityService.generateId(file.botId, file.number);
                        var newDownload = {id :genid, animeInfo: { animeid : this.animeInfo.id, title: this.animeInfo.animeInfo.canonicalTitle, cover_original : this.animeInfo.animeInfo.posterImage.original, cover_small: this.animeInfo.animeInfo.posterImage.small}, episodeNumber: file.episodeNumber, pack : file.number, bot: file.botId, filename: file.name, filesize: file.size, status : "Waiting", progress : "0", speed : "0"};
                        batchDownloads.push(newDownload);
                        break;
                    }
                }
            }
        } 

        this.downloadService.addDownloadBatch(batchDownloads);
    }

    /**
     * Selects the best episode to be downloaded and appends them to the download que
     * 
     * @param {number} i (episode number)
     * @memberof AnimeInfo
     */
    selectBestEpisode(i:number){
        this.semanticui.closeAccordion(i);
        this.consoleWrite(i);
        this.consoleWrite(this.episodeList);

        if(this.episodeList[i] != "not defined"){
            let files = this.episodeList[i][0].files;
            this.consoleWrite(files);
            for(let file of files){
                if(this.prefferedbots.indexOf[file.botId] && file.name.indexOf(this.resolution) != -1){
                    this.consoleWrite("Found best file:");
                    this.consoleWrite(file);
                    this.appendToDownloadsDirectly(file);
                    break;
                } else if(file.name.indexOf(this.resolution)  != -1){
                    this.consoleWrite("Found best file:");
                    this.consoleWrite(file);                
                    this.appendToDownloadsDirectly(file);
                    break;
                }
            }
        }
       

    }

    /**
     * Same as AnimeInfo.selectBestEpisode but then for the movie list
     * 
     * @returns 
     * @memberof AnimeInfo
     */
    selectBestMovie(){
        this.semanticui.closeAccordion(0);
        let files = this.movieList[0][0];
        this.consoleWrite(files);
        for(let file of files){
            if(this.prefferedbots.indexOf[file.botId] && file.name.indexOf(this.resolution) != -1){
                this.consoleWrite("Found best file:");
                this.consoleWrite(file);
                this.appendToDownloadsDirectly(file);
                break;
            } else if(file.name.indexOf(this.resolution)  != -1){
                this.consoleWrite("Found best file:");
                this.consoleWrite(file);                
                this.appendToDownloadsDirectly(file);
                break;
            }
        }
    }

   /**
    * Show only episodes for a certain bot (only in advanced mode)
    * 
    * @param {string} bot 
    * @memberof AnimeInfo
    */
   showBot(bot: string){
        if(bot == "all"){
            //every filename has a dot for extension
            this.showAllBots = true;
            this.botname = undefined;
        } else {
            this.showAllBots = false;
            this.botname = bot;
        }
    }

    /**
     * Select resolution (works for both advanced and easy mode (AnimeInfo.selectBestEpisode/Movie uses this value))
     * 
     * @param {string} res 
     * @memberof AnimeInfo
     */
    showResolution(res: string){
        if(res == "all"){
            //every filename has a dot for extension
            this.showAllResolutions = true;
            this.resolution = undefined;
            this.dropdownres = "All Resolutions";
        } else {
            this.showAllResolutions = false;
            this.resolution = res;
            this.dropdownres = res;
        }
    }

    /**
     * Appends a download to the download queue, generates a unique id for each download (used for referencing)
     * 
     * @param {*} download (json object with episode file information)
     * @memberof AnimeInfo
     */
    appendToDownloadsDirectly(download: any){
        var genid = this.utilityService.generateId(download.botId, download.number);

        var newDownload = {id :genid, animeInfo: { animeid : this.animeInfo.id, title: this.animeInfo.animeInfo.canonicalTitle, cover_original : this.animeInfo.animeInfo.posterImage.original, cover_small: this.animeInfo.animeInfo.posterImage.small}, episodeNumber: download.episodeNumber, pack : download.number, bot: download.botId, filename: download.name, filesize: download.size, status : "Waiting", progress : "0", speed : "0"};
        this.downloadService.addDownload(newDownload);
        
        this.shareService.showMessage("succes", "Added to Downloads!");

    }

    /**
     * Adds currently viewed anime to favorites
     * 
     * @memberof AnimeInfo
     */
    addToFavorites(){
        var animeobj = {id: this.animeInfo.id, attributes : this.animeInfo.animeInfo};
        this.consoleWrite(animeobj);
        
        let getCurrentFavorites = this.shareService.getDataLocal("favorites");
        if(!getCurrentFavorites){
            let newFavoritesObject = {"favorites" : [animeobj]};
            this.shareService.storeDataLocal("favorites", JSON.stringify(newFavoritesObject));
            this.shareService.favoriteamount.next(1);
        } else {
            let currentFavorites = JSON.parse(getCurrentFavorites);
            let found = false;
            for(let currentfavorite of currentFavorites.favorites){
                if(currentfavorite.id == animeobj.id){
                    found = true;
                    break;
                }
            }
            if(!found){
                currentFavorites.favorites.push(animeobj);
                this.shareService.storeDataLocal("favorites", JSON.stringify(currentFavorites));
            }
            this.shareService.favoriteamount.next(currentFavorites.length);
        }

        this.shareService.showMessage("succes", "Added to Favorites!");
    }
    
    /**
     * Toggles advanced mode
     * 
     * @memberof AnimeInfo
     */
    enableOrDisableAdvanced(){
        this.enableAdvanced = !this.enableAdvanced;
        this.consoleWrite(this.enableAdvanced);
        this.semanticui.enableAccordion();
        this.semanticui.enableDropDown();
    }

    /**
     * similar to indexOf(x) != -1, but is usable within bind tags in html templates 
     * 
     * @param {string} input (input string)
     * @param {string} contains (value to check for)
     * @returns (boolean if input string contains contains string)
     * @memberof AnimeInfo
     */
    checkIfStringContiains(input :string, contains: string){
        if(input.indexOf(contains) != -1){
            return true;
        } else {
            return false;
        }
    }

    /**
     * playEpisode request, to automatically download and play a episode
     * since download doesnt immidiatly starts, it tries to play the episodes 4 times every second (if after 4 times no download has started, it will show an error)
     * @param {number} epnum 
     * @memberof AnimeInfo
     */
    playEpisode(epnum: number){
        if(this.isLocal){
            this.shareService.showLoaderMessage("Waiting for download to start!");
            this.selectBestEpisode(epnum);
            this.waitingToPlay = true;
            this.episodeToPlay = epnum;
            let count = 0;
            
            let tempint = setInterval(() =>{
                if(this.waitingToPlay ){                
                    this.downloadService.getAlreadyDownloaded();
                } else {
                    this.shareService.hideLoader();
                    clearInterval(tempint);
                }
                if(count > 20){                
                    this.shareService.showMessage("error", "Could not start playing episode!");
                    this.shareService.hideLoader();
                    clearInterval(tempint);
                }
                count++;
            }, 1000);
        }
    }

    playEpisodeAdvanced(download: any, epnum: number){
        if(this.isLocal){
            this.appendToDownloadsDirectly(download);
            this.waitingToPlay = true;
            this.episodeToPlay = epnum;
            let count = 0;
            let tempint = setInterval(() =>{
                if(this.waitingToPlay ){                
                    this.downloadService.getAlreadyDownloaded();
                } else {
                    this.shareService.hideLoader();
                    clearInterval(tempint);
                }
                if(count > 20){                
                    this.shareService.showMessage("error", "Could not start playing episode!");
                    this.shareService.hideLoader();
                    clearInterval(tempint);
                }
                count++;
            }, 1000);

        }
    }

     /**
     * 
     * Sends a play request to the backend
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendPlayRequest(download : any){
        if(this.isLocal){
            setTimeout(this.backEndService.sendMessage({"action" : "open_file", "extra" : {"path": download.fullfilepath}}), 1000);
        }
    }

    /**
     * Sends open file location to the backend
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendOpenLocationRequest(download : any){
        if(this.isLocal){            
            this.backEndService.sendMessage({"action" : "open_download_directory"});
        }  
    }

    /**
     * Sends abort request to the backend
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendAbortRequest(download : any){
       this.downloadService.abortDownload(download);       
    }

    /**
     * Sends a delete request to the backend
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendDeleteRequest(download : any){
       this.downloadService.removeDownload(download);
    }

    /**
     * Sends a download request to local machine via http
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    getUrl(download : any){
        var ip =  window.location.hostname;
        this.shareService.showModal("Here is your url!", 
                                    `You can either copy the following url, or hit download to download the file in question. <br \>
                                     <div >
                                        <p><h3>http://` + ip + `:6010?sendFile=` + download.downloadDirectory + `/`+ download.filename + `</h3></p>
                                    </div>
                                    `, 
                                    "linkify", 
                                    `<div class="ui red basic cancel inverted button">
                                        <i class="remove icon"></i>
                                        Cancel
                                     </div>
                                     <a target="_blank" href="http://` + ip + `:6010?sendFile=` + + download.downloadDirectory + `/`+ download.filename + `" class="ui green ok inverted button">
                                        <i class="checkmark icon"></i>
                                        Download
                                     </a>
                                     `);
    }

    prevPage(){
        if(this.currentPage > 0){
            this.currentPage--;
            this.backEndService.getAnimeInfoWithEpisodes(this.animeInfo.anime_id, this.currentPage);
        }
    }

    nextPage(){
        if(this.currentPage <= this.animeInfo.anime_total_episode_pages){
            this.currentPage++;
            this.backEndService.getAnimeInfoWithEpisodes(this.animeInfo.anime_id, this.currentPage);
        }
    }

    specificPage(page : number){
        if(page <= this.animeInfo.anime_total_episode_pages){
            this.currentPage = page;
            this.backEndService.getAnimeInfoWithEpisodes(this.animeInfo.anime_id, this.currentPage);
        }        
    }

    lastPage(){
        this.currentPage = this.animeInfo.anime_total_episode_pages;
        this.backEndService.getAnimeInfoWithEpisodes(this.animeInfo.anime_id, this.currentPage);
    }

    firstPage(){
        this.currentPage = this.animeInfo.anime_total_episode_pages;
        this.backEndService.getAnimeInfoWithEpisodes(this.animeInfo.anime_id);
    }

    /**
     * Custom this.consoleWrite function so that it can be enabled/disabled if there is no need for debugging
     * 
     * @param {*} log (gets any type of variable and shows it if enableDebug is true) 
     * @memberof AnimeInfo
     */
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }
}
