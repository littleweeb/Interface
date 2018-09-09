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

    //dropdown custom
    dropdownres : string = "All Resolutions";

    //filedir
    animeDir : string;

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
        this.animeDir = "";
        this.enableDebug = true;
        this.possibleresolutions = new Array();
        
        this.possibleresolutions.push({value : "720", name : "720p"});
        this.possibleresolutions.push({value : "480", name : "480p"});
        this.possibleresolutions.push({value : "1080", name : "1080p"});

        this.episodeList= new Array();
        this.movieList = new Array();

        if(this.backEndService.address.indexOf("local") > -1 || this.backEndService.address.indexOf("127.0.0.1") > -1){
            this.isLocal = true;
        }

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

        this.downloadService.updateAlreadyDownloadedList.subscribe((listwithdownloads)=>{
            if(listwithdownloads != null){
                this.consoleWrite("GETTING LIST WITH DOWNLOADS");
                if(this.waitingToPlay){
                    
                    let found = false;
                    for(let anime of listwithdownloads){
                        for(let file of anime.downloadHistory){
                            if(anime.animeInfo.animeid == this.animeInfo.id && this.episodeToPlay.toString() == file.episodeNumber){
                                this.sendPlayRequest(file);
                                found = true;
                                this.waitingToPlay = false;
                                break;
                            }
                        }
                        if(found){
                            break;
                        }
                    }
                }  
                
                let found = false;
                for(let anime of listwithdownloads){
                    for(let file of anime.downloadHistory){
                        this.consoleWrite("COMPARING FOLLOWING ID:");
                        this.consoleWrite(anime.animeInfo.animeid);
                        this.consoleWrite(this.animeInfo.id);
                        if(file.animeInfo.animeid == this.animeInfo.id){
                            this.alreadyDownloadedFiles = anime.downloadHistory;
                            this.showAlreadyDownloaded = true;
                            this.consoleWrite("FOUND FILES FOR THIS ANIME");
                            found = true;
                            break;
                        }
                    }
                    if(found){
                        break;
                    }
                }
                if(!found){
                    this.showAlreadyDownloaded =false;
                    this.alreadyDownloadedFiles = [];
                }
                
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
                this.resolution = ".";
                this.dropdownres = "All Resolutions";
            } else {
                this.showAllResolutions = false;
                this.resolution = possibledefaultresolution;
                
                this.dropdownres = possibledefaultresolution;
            }
        } else {
            this.shareService.storeDataLocal("default_resolution", '720');      
        }

        await this.http.get('https://raw.githubusercontent.com/erengy/anime-relations/master/anime-relations.txt').toPromise().then(animerelations => this.animeRelations= animerelations.text());
        await this.http.get('https://raw.githubusercontent.com/littleweeb/LittleWeebRules/master/littleweebrules.txt').toPromise().then(littleweebrules => this.littleWeebRules= littleweebrules.text());
       
       
        let getLocalStoredAnime = this.shareService.getDataLocal("animeview");
        if(getLocalStoredAnime != false){
           
            this.botname = "all";
            let animeView = JSON.parse(getLocalStoredAnime);
            if(animeView.title != ""){
              
                
                this.showAllBots = animeView.showAllBots;
                this.showAllResolutions = animeView.showAllResolutions;
                this.packsSelected = animeView.packsSelected;
                this.selectedItems = animeView.selectedItems;
                this.title = animeView.title;
                this.episodeList= animeView.episodeList;
                this.movieList = animeView.movieList;
                this.showList = animeView.showList;
                this.showError =  animeView.showError;
                this.botList = animeView.botList;
                this.prefferedbots = animeView.prefferedbots;
                this.animeDir = animeView.animeDir;
                this.animeInfo = animeView.animeInfo;
                this.enableDebug = true;
                this.consoleWrite(this.animeInfo);
                if(this.animeInfo !== undefined){
                    this.shareService.updatetitle.next(this.animeInfo.animeInfo.canonicalTitle);
                    this.doneLoading = true;
                } 
                
                
            }
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown(); 

        }
        this.shareService.animetoshow.take(1).subscribe(async(anime) => {
            if(anime !== null){
                
                this.consoleWrite("got mah anime");
                this.consoleWrite(anime);
                this.shareService.showLoaderMessage("Loading anime: " + anime.attributes.canonicalTitle );   
               
                if(this.animeInfo === undefined){
                    this.animeInfo = this.kitsuService.getAllInfo(anime.id);
                    this.animeDir = this.animeInfo.animeInfo.canonicalTitle.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'_');   
                    this.showList = false;
                    this.showEpisodes = false;   
                    this.title =  this.animeInfo.animeInfo.canonicalTitle;     
                    this.shareService.updatetitle.next(this.title);              
                    this.showPackListFor(this.animeInfo);
                    
                } else {
                    if(this.animeInfo.id != anime.id){
                        this.animeInfo = await this.kitsuService.getAllInfo(anime.id);
                        this.consoleWrite(this.animeInfo);
                        this.animeDir = this.animeInfo.animeInfo.canonicalTitle.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'_');      
                        this.showList = false;
                        this.showEpisodes = false;   
                        this.title =  this.animeInfo.animeInfo.canonicalTitle;  
                        this.shareService.updatetitle.next(this.title);                   
                        this.showPackListFor(this.animeInfo);
                    } else {
                        this.shareService.hideLoader();                        
                        this.downloadService.getAlreadyDownloaded();
                        this.doneLoading = true;
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
            episodeList: this.episodeList,
            movieList : this.movieList,
            showList : this.showList,
            showError : this.showError,
            botList : this.botList,
            prefferedbots : this.prefferedbots,
            animeInfo : this.animeInfo,
            enableDebug : this.enableDebug,
            animeDir : this.animeDir
        }
        this.consoleWrite(simpleObject);
        this.shareService.storeDataLocal("animeview", JSON.stringify(simpleObject));
    }
   
    /**
     * Retreives available files for the requested anime through nibl.co.uk, parses all synonyms and requests the most likely related episodes
     * uses https://github.com/erengy/anime-relations for retreiving the correct files
     * 
     * @param {*} anime 
     * @memberof AnimeInfo
     */
    async showPackListFor(anime : any){
        
        //disable views for error AND list (cus no episodes have been added yet)

        //some global stuff     
        let seasonIdentifiers = new Array();

        for(let i = 0; i < 99; i++){
            if(i > 0){
                
                let numberAsWord = this.utilityService.numberToWords(i);
                let numberAsRoman = this.utilityService.numberToRoman(i);
                let numberOrdinal = this.utilityService.numberToOrdinal(i);
                let numberAsWordWithOrdinal = this.utilityService.numberToWordsWithOrdinal(i);

                let seasonIdentifierObj = {
                    seasonDelimiter : [" season " + numberAsWordWithOrdinal, " " + numberAsWordWithOrdinal + " season", " season " + numberAsWord, " " + numberAsWord + " season", " " + i.toString() + numberOrdinal + " season", " season " + i.toString(), " " + i.toString() + numberOrdinal, " s" + i.toString(), " " + numberAsRoman + " ", " s0" + i + "e"],
                    seasonNumber : i
                }

                seasonIdentifiers.push(seasonIdentifierObj);
            }else {
                let seasonIdentifierObj = {
                    seasonDelimiter : ["season", "s", "st", "nd", "rd", "th"],
                    seasonNumber : 0
                }

                seasonIdentifiers.push(seasonIdentifierObj);
            }
        }

        this.consoleWrite("SEASON IDENTIFIERS:");
        this.consoleWrite(seasonIdentifiers);


        
        //get anime relation and parse episode where to start and where to stop:
        let everyRelation = this.animeRelations.split('#');
        let startStopEpisodes = new Array();
        for(let relation of everyRelation){

            let id = '|' + anime.id + '|';

            if(relation.indexOf(id) > -1){
                this.consoleWrite("Found relation: " + relation + " using id: " + id);


                if(relation.indexOf("~ - ") != -1){
                    relation = relation.split("~ - ")[1];
                }

                
                let partWithEpisodeIndex = relation.split("- ")[1];
                this.consoleWrite("Splitted using the id:");
                this.consoleWrite(partWithEpisodeIndex.split(id));
                let leftOrRight = "undefined";
                
                if(partWithEpisodeIndex.split(id)[1].indexOf("->") != -1){
                    leftOrRight = "left";
                } else {
                    leftOrRight = "right";
                }

                let hasWrongSeasonNumbers = false;
                
                let startEpisodeString = partWithEpisodeIndex.split(':')[1].split('-')[0];
                let endEpisodeString = "0";
                if(partWithEpisodeIndex.split(':')[1].split(' ')[0].indexOf('-') != -1){
                   endEpisodeString = partWithEpisodeIndex.split(':')[1].split('-')[1].split(" -> ")[0];
                }
                

                let shouldStartEpisodeString = partWithEpisodeIndex.split(':')[2].split('-')[0];
                let shouldEndEpisodeString = "0";
                if(partWithEpisodeIndex.split(':')[2].indexOf('-') != -1){
                    shouldEndEpisodeString = partWithEpisodeIndex.split(':')[2].split('-')[1];
                    if(shouldEndEpisodeString.indexOf('!') > -1){
                        hasWrongSeasonNumbers = true;
                        shouldEndEpisodeString = shouldEndEpisodeString.split('!')[0];
                    }
                }

                

                

                let newStartStop = {
                    startEpisode : Number(startEpisodeString),
                    endEpisode : Number(endEpisodeString),
                    shouldStartEpisode : Number(shouldStartEpisodeString),
                    shouldEndEpisode : Number(shouldEndEpisodeString),
                    hasWrongSeasonNumbers : hasWrongSeasonNumbers,
                    leftOrRight : leftOrRight
                }

                if(endEpisodeString != "0" && shouldEndEpisodeString != "0"){                    
                    startStopEpisodes.push(newStartStop);
                }
                break;
            }
        }

        this.consoleWrite("Start Stop Episode Numbering: ");
        this.consoleWrite(startStopEpisodes);

        let littleweebrule = false;
        let mustinclude = new Array();
        let mustexclude = new Array();
        if(this.littleWeebRules.indexOf(anime.id) != -1){
            this.consoleWrite("Found rule for this anime.");

            let alllines = this.littleWeebRules.split(/\r\n|\r|\n/g);
            let i = 0;
            for(let line of alllines){

                if(line.indexOf(anime.id) != -1){
                    if(line.split('*')[1].trim() == anime.id){

                        this.consoleWrite("all includes");
                        let allincludes = alllines[i + 1].split('+ ')[1].split(',');
                        
                        for(let include of allincludes){
                            mustinclude.push(include.replace(/`/g, ''));
                        }
                        this.consoleWrite(mustinclude);
                        this.consoleWrite("all excludes");
                        

                        let allexcludesline = alllines[i + 3].split('$ ')[1];

                        if(allexcludesline !== undefined){
                            if(allexcludesline.indexOf(',') != -1){

                                let allexcludes = allexcludesline.split(',');
                                for(let exclude of allexcludes){
                                    mustexclude.push(exclude.replace(/`/g, ''));
                                }
                                this.consoleWrite(mustexclude);
                            }

                        }
                        
                        littleweebrule = true;
                        break;
                        
                      
                    }
                }
                i++;
            }
            
            this.consoleWrite("Episode title MUST contain: ");
            this.consoleWrite(mustinclude);

        }


        this.shareService.showLoaderMessage("Retreiving Synonyms"); 

        //getting all the synonyms
        let synonyms = new Array();        
        for(let key in anime.animeInfo.titles){
            this.consoleWrite(key); 
            let synonym = anime.animeInfo.titles[key];
            synonyms.push(synonym);            
        }
        this.consoleWrite("synonyms: ");
        this.consoleWrite(synonyms); 

        //getting season
        let seasonNumber = 1;
        let seasonDelimiter = "";
        for(let seasonIdentifier of seasonIdentifiers){
            if(seasonIdentifier.seasonNumber > 0){               
                let found = false;
                for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                   if(this.utilityService.createSpaces(anime.animeInfo.canonicalTitle.toLowerCase()).indexOf(seasonIdentifierString) != -1){
                        found = true;
                        seasonNumber = seasonIdentifier.seasonNumber;
                        seasonDelimiter = seasonIdentifierString;
                        break;
                    }       
                }
                if(found){
                    break;
                }
            }            
        }

        this.consoleWrite("Found season number:");
        this.consoleWrite(seasonNumber);
         this.consoleWrite(seasonDelimiter);

        
        

        //get all episodes using synonyms 
        let allEpisodes = new Array();

       
        let searchQueries = [];
        for(let synonym of synonyms){
            let searchQuery = this.utilityService.stripName(synonym);   
            let wordsInFileName = searchQuery.split(' ');
            searchQuery = "";
            for(let word of wordsInFileName){
                let withoutNumbers = word.replace(/[0-9]/g, "").trim();
                if(seasonIdentifiers[0].seasonDelimiter.indexOf(withoutNumbers) == -1){
                    searchQuery += word + " ";
                }
            }  
            if(searchQuery.length > 3){                
                 searchQueries.push(searchQuery);
            } 
            if(synonym.length > 3){                
                searchQueries.push(synonym);
            }      

            if(seasonNumber > 1){
                searchQuery = synonym.toLowerCase().split(seasonDelimiter)[0];

                let seasonIdentifierBe = seasonIdentifiers[seasonNumber];
                for(let identifier of seasonIdentifierBe.seasonDelimiter){
                    if(searchQuery.indexOf(identifier)){
                        searchQuery = searchQuery.split(identifier)[0];
                    }
                }                
                searchQueries.push(searchQuery)
            } 
            if(synonym.indexOf(':') != -1){
                searchQuery = synonym.split(':')[0];
                searchQueries.push(this.utilityService.stripName(searchQuery));
            }
                
            
        }

        // get bot list and bind bot index to name
    

        this.niblService.getSearchAnimeResultsMulti(searchQueries).subscribe(async(result) =>{
            this.shareService.showLoaderMessage("Retreiving episodes"); 
             //makes it easier on the loop for getting the bot (Doesn't have to roll through the botlist over and over for each file)
            let botsWithId = {};

            let bots = await this.niblService.getBotListSync();
            //appends botname to index botid
            for(let bot of bots){
                botsWithId[bot.id] = bot.name;
            }

            this.consoleWrite("The following episodes were found on nibl:");
            this.consoleWrite(result);
            for(let file of result){
                if(allEpisodes.indexOf(file) == -1){ 
                    for(let searchQuery of searchQueries){ 
                        let found = false; 
                        for(let filealreadyadded of allEpisodes){
                            if(filealreadyadded.botId == file.botId && filealreadyadded.number == file.number){
                                found = true;
                            }
                        }
                        if(!found){   
                            if(this.utilityService.compareNames(this.utilityService.stripName(file.name), this.utilityService.stripName(this.animeInfo.animeInfo.canonicalTitle)) > 10){
                                file.season = seasonNumber;
                                allEpisodes.push(file);
                            }
                        }
                    }  
                }
            }

            this.consoleWrite(allEpisodes);

            this.consoleWrite("Following start stop was found within anime-relations:");
            this.consoleWrite(startStopEpisodes);
            let parsedEpisodeFiles = new Array();
            for(let episodeFile of allEpisodes){

                if(episodeFile.episodeNumber == -1){
                    //possibly contains episode numbers with this syntax: s0xe0x
                    let episodename = episodeFile.name.toLowerCase();
                    if(episodename.indexOf('s' + seasonNumber.toString()) != -1){
                        let firstpart = episodename.split('s' + seasonNumber.toString())[1];
                        if(firstpart.indexOf('.') != -1){
                            let secondpart = firstpart.split('.')[1];
                            episodeFile.episodeNumber = Number(secondpart);
                           
                        }
                       
                        if(firstpart.indexOf('e') != -1 ){
                            let secondpart = firstpart.split('e')[1];
                           
                            episodeFile.episodeNumber = Number(secondpart.split(' ')[0]);
                        } 
                        
                    } else if(episodename.indexOf('s0' + seasonNumber.toString()) != -1){
                        
                        let firstpart = episodename.split('s0' + seasonNumber.toString())[1];
                        
                        if(firstpart.indexOf('.') != -1){
                            let secondpart = firstpart.split('.')[1];
                            if(secondpart.indexOf('.') != -1){
                                episodeFile.episodeNumber = Number(secondpart.split('.')[0]);
                            }
                            if(secondpart.indexOf(' ') != -1){
                                episodeFile.episodeNumber = Number(secondpart.split(' ')[0]);
                            }
                        }
                        if(firstpart.indexOf('e') != -1 ){
                            let secondpart = firstpart.split('e')[1];
                            if(secondpart.indexOf('.') != -1){
                                episodeFile.episodeNumber = Number(secondpart.split('.')[0]);
                            }
                            if(secondpart.indexOf(' ') != -1){
                                episodeFile.episodeNumber = Number(secondpart.split(' ')[0]);
                            }
                        } 
                       
                    }
                }

                if(startStopEpisodes.length > 0){

                    let epNum = episodeFile.episodeNumber;

                    let start = 0;
                    let stop = 0;

                    if(startStopEpisodes[0].leftOrRight == "left"){
                        start = 0;
                        stop = startStopEpisodes[0].endEpisode;
                        if(seasonNumber > 1){
                            if(epNum >= start && epNum <= stop){  

                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                          
                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                    parsedEpisodeFiles.push(episodeFile);
                                }
                            } 
                        } else {
                            if(epNum <= startStopEpisodes[0].startEpisode){         
                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                         
                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                    parsedEpisodeFiles.push(episodeFile);
                                }
                            } 
                        }
                    
                    } else {
                        
                        start = startStopEpisodes[0].startEpisode;
                        stop = startStopEpisodes[0].endEpisode;
                        if(!isNaN(stop)){
                            let amountofepisodes = stop - start;
                            let seasonIdentifier = seasonIdentifiers[seasonNumber];
                            if(epNum >= start && epNum <= stop){

                                let foundseasonident = false;
                                if(seasonNumber > 1){
                                    for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                                        if(this.utilityService.createSpaces(episodeFile.name.toLowerCase()).indexOf(seasonIdentifierString) != -1){                                    
                                            foundseasonident = true;
                                            break;
                                        }
                                    }
                                } 
                                if(!foundseasonident){
                                    episodeFile.episodeNumber = episodeFile.episodeNumber - start + 1;
                                }             
                                 
                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                          
                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                    parsedEpisodeFiles.push(episodeFile);
                                }
                            } else {
                                
                                  if(seasonNumber > 1){
                                        for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                                            if(this.utilityService.createSpaces(episodeFile.name.toLowerCase()).indexOf(seasonIdentifierString) != -1){                                          
                                                
                                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                          
                                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                                    parsedEpisodeFiles.push(episodeFile);
                                                }
                                                break;
                                            }
                                        }
                                   
                                }  else {
                                    
                                   
                                    for(let synonym of synonyms){
                                        if(this.utilityService.compareNames(this.utilityService.stripName(episodeFile.name), this.utilityService.stripName(synonym)) > 50){
                                            if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                          
                                                episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                                parsedEpisodeFiles.push(episodeFile);
                                            }
                                            break;
                                        }
                                    }
                                } 
                            }
                        } else {
                            let seasonIdentifier = seasonIdentifiers[seasonNumber];
                            if(epNum >= start){
                                let foundseasonident = false;
                                if(seasonNumber > 1){
                                    for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                                        if(this.utilityService.createSpaces(episodeFile.name.toLowerCase()).indexOf(seasonIdentifierString) != -1){                                    
                                            foundseasonident = true;
                                            break;
                                        }
                                    }
                                } 
                                if(!foundseasonident){
                                    episodeFile.episodeNumber = episodeFile.episodeNumber - start + 1;
                                }             
                                
                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                          
                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                    parsedEpisodeFiles.push(episodeFile);
                                }
                            } else {
                                
                                if(seasonNumber > 1){
                                        for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                                            if(this.utilityService.createSpaces(episodeFile.name.toLowerCase()).indexOf(seasonIdentifierString) != -1){                                     
                                                
                                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                          
                                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                                    parsedEpisodeFiles.push(episodeFile);
                                                }
                                                break;
                                            }
                                        }
                                   
                                }  else {
                                    
                                    for(let synonym of synonyms){
                                        if(this.utilityService.compareNames(this.utilityService.stripName(episodeFile.name), this.utilityService.stripName(synonym)) > 30){

                                            let found = false;
                                            let seasonnumber = 0;
                                            let wordsoftitle = this.utilityService.stripName(episodeFile.name).split(' ');
                                            for(let word of wordsoftitle){
                                                for(let seasonIdent of seasonIdentifiers){
                                                    for(let ident of seasonIdent.seasonDelimiter){

                                                        if(ident.indexOf(word) != -1){
                                                            found = true;
                                                        }
                                                    }
                                                    if(found){
                                                        seasonnumber = seasonIdent.seasonNumber;
                                                        break;
                                                    }
                                                }
                                                if(found){
                                                    break;
                                                }
                                            }

                                            if(!found || seasonnumber == seasonNumber){
                                                
                                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){
                                                                          
                                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                                    parsedEpisodeFiles.push(episodeFile);
                                                }
                                            }                                          
                                            break;
                                        }
                                    }
                                } 
                            }
                        }                      
                    }                
                } else { 
                    
                    if(seasonNumber > 1){
                        
                        let seasonIdentifier = seasonIdentifiers[seasonNumber];
                        for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                            if(this.utilityService.createSpaces(episodeFile.name.toLowerCase()).indexOf(seasonIdentifierString) != -1){      
                              
                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){;                           
                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 

                                    parsedEpisodeFiles.push(episodeFile);
                                    break;
                                }
                            }
                        }
                    } else {         
                                        
   
                        for(let synonym of synonyms){
                            if(littleweebrule){
                                
                                if(this.checkForRule(episodeFile.name, littleweebrule, mustinclude, mustexclude)){                                                            
                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                                    parsedEpisodeFiles.push(episodeFile);
                                    break;                             
                                } 
                            }
                            else {        
                                                                                                 
                                episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId);  
                                parsedEpisodeFiles.push(episodeFile);   
                                break;       
                            }
                        }
                    }
                }
            }
            this.consoleWrite("Following files were parsed:");   
            this.consoleWrite(parsedEpisodeFiles);
            this.consoleWrite("Following bots were parsed:");
            this.consoleWrite(this.botList);
            //index by episode



            this.episodeList = new Array();
            
            this.movieList = new Array();
            let tempEpListBe =  new Array();

            for(let parsedFile of parsedEpisodeFiles){
                let epNum = parsedFile.episodeNumber;
                
                if(epNum > this.utilityService.getEpisodeNumber(parsedFile.name) && epNum != -1 && parsedFile.season == 1 ){
                    epNum = this.utilityService.getEpisodeNumber(parsedFile.name);
                    if(epNum == 0 ){
                        epNum = parsedFile.episodeNumber;
                    }
                }
                
                this.consoleWrite(epNum);
                if(epNum && parsedFile.botId != false){
                    if(this.animeInfo.animeInfo.subtype == "TV"){
                        
                        if(this.episodeList === null){
                            this.episodeList = new Array();
                        }
                        if(this.episodeList[epNum] === undefined){
                            this.episodeList[epNum] = new Array();
                            this.episodeList[epNum].push({episodeNumber: epNum, episodeTitle: "Episode " + epNum, files: [parsedFile]}); 
                            
                            tempEpListBe[epNum] = new Array();
                            tempEpListBe[epNum].push(parsedFile);
                        } else {
                            tempEpListBe[epNum].push(parsedFile);
                            var obj = this.episodeList[epNum][0];
                            obj.files=tempEpListBe[epNum];
                            this.episodeList[epNum][0] = obj;
                        }
                    } else {
                        if(epNum == -1){
                            epNum = 1;
                            if(this.movieList === null){
                                this.movieList = new Array();
                            }
                            if(this.movieList[epNum] === undefined){
                                this.movieList[epNum] = new Array();
                                this.movieList[epNum].push(parsedFile);
                            } else {
                                this.movieList[epNum].push(parsedFile);
                            }
                        }
                        
                    }
                }
            }

            
            this.consoleWrite("Following episodes were indexed before last pass:");
            this.consoleWrite(this.episodeList);
            
            this.consoleWrite("Following movies were indexed before last pass:");
            this.consoleWrite(this.movieList);
            if(this.episodeList[0] === undefined){
                this.episodeList[0] = "not defined";
            }
            if(this.movieList[0] === undefined){
                this.movieList[0] = "not defined";
            }

            for(let i = 0; i < this.episodeList.length; i++){
                if(this.episodeList[i] === undefined){
                    this.episodeList.splice(i, this.episodeList.length - i);
                    break;
                }
            }

            for(let i = 0; i < this.movieList.length; i++){
                if(this.movieList[i] === undefined || this.movieList[i] === null){
                    this.movieList.splice(i, this.movieList.length - i);
                    break;
                }
            }

        
            this.consoleWrite("Following episodes were indexed:");
            this.consoleWrite(this.episodeList);
            
            this.consoleWrite("Following movies were indexed:");
            this.consoleWrite(this.movieList);

            this.showEpisodes = true;
            this.showList = true;
            this.shareService.hideLoader();
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown();
            setTimeout(()=>{                
                this.semanticui.enableAccordion();
                this.semanticui.enableDropDown();
            }, 1000);
            
            this.downloadService.getAlreadyDownloaded();
            this.doneLoading = true;
        });

        

    }
    
    /**
     * Check if rule should be used, if so, return true when rule applies, if rule should not be used, always return true.
     * 
     * @param {string} epname (episode name where rule should be aplied upon)
     * @param {boolean} littleweebrule (check if rule should be used)
     * @param {*} mustinclude (the values that should be used to test if rule applies)
     * @returns (boolean, true when rule applies, true when no rule found, false if rule doesn't apply)
     * @memberof AnimeInfo
     */
    checkForRule(epname : string , littleweebrule :boolean, mustinclude:any, mustexclude:any){
        if(littleweebrule){
            let includes = false;
            let excludes = true;
            
            if(mustinclude.length >= 1 && mustexclude.length >= 1){
                for(let include of mustinclude){
                    let mustcontain = include.toLowerCase();
                    let words = epname.toLowerCase();
    
                    if(words.indexOf(mustcontain) != -1){
                        includes = true;
                        break;
                    }
                }

                for(let exclude of mustexclude){
                    let mustcontain = exclude.toLowerCase();
                    let words = epname.toLowerCase();
    
                    if(words.indexOf(mustcontain) != -1){
                        excludes = false;
                        break;
                    }
                }
                if(includes && !excludes){                                        
                    return false;
                } 
                return true;
            } else if(mustinclude.length >= 1){
                for(let include of mustinclude){
                    let mustcontain = include.toLowerCase();
                    let words = epname.toLowerCase();
                    if(words.indexOf(mustcontain) != -1){
                        includes = true;
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
           
        

            
            
        } else {                                      
            return true;
        }
    }

    /**
     * Add bot to botlist of parsed file
     * 
     * @param {number} id (id of bot)
     * @param {*} botsWithId (array with bots and related id)
     * @returns 
     * @memberof AnimeInfo
     */
    addBotToBotList(id : number, botsWithId : any){
        let botname = botsWithId[id];                
        if(botname === undefined){
           return false;
        }
        if(this.botList.indexOf(botname) == -1){                                                                        
            this.botList.push(botname);                                                                                 
        }
        return botname; 
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
                        var newDownload = {id :genid, animeInfo: { animeid : this.animeInfo.id, title: this.animeInfo.animeInfo.canonicalTitle, cover_original : this.animeInfo.animeInfo.posterImage.original, cover_small: this.animeInfo.animeInfo.posterImage.small}, episodeNumber: file.episodeNumber, pack : file.number, bot: file.botId, filename: file.name, filesize: file.size, status : "Waiting", progress : "0", speed : "0", dir : this.animeDir};
                        batchDownloads.push(newDownload);
                        break;
                    } else if(file.name.indexOf(this.resolution)  != -1){
                        this.consoleWrite("Found best file:");
                        this.consoleWrite(file);                
                        //this.appendToDownloadsDirectly(file);

                        var genid = this.utilityService.generateId(file.botId, file.number);
                        var newDownload = {id :genid, animeInfo: { animeid : this.animeInfo.id, title: this.animeInfo.animeInfo.canonicalTitle, cover_original : this.animeInfo.animeInfo.posterImage.original, cover_small: this.animeInfo.animeInfo.posterImage.small}, episodeNumber: file.episodeNumber, pack : file.number, bot: file.botId, filename: file.name, filesize: file.size, status : "Waiting", progress : "0", speed : "0", dir : this.animeDir};
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

        var newDownload = {id :genid, animeInfo: { animeid : this.animeInfo.id, title: this.animeInfo.animeInfo.canonicalTitle, cover_original : this.animeInfo.animeInfo.posterImage.original, cover_small: this.animeInfo.animeInfo.posterImage.small}, episodeNumber: download.episodeNumber, pack : download.number, bot: download.botId, filename: download.name, filesize: download.size, status : "Waiting", progress : "0", speed : "0", dir : this.animeDir};
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
