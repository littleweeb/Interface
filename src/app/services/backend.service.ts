import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';
import {ShareService} from './share.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

/**
 * (SERVICE) BackEndService
 * Used for communicating with LittleWeebs backend using Websockets
 * 
 * 
 * @export
 * @class BackEndService
 */
@Injectable()
export class BackEndService {

    public websocketMessages : Subject<any> = new BehaviorSubject<any>({"type" : "NOMESSAGE"});
    public websocketConnected : Subject<string> = new BehaviorSubject<string>(null);
    public osVersion : string = "";
    public connectingState : string = "";
    public address : string;
    public connected : boolean;

    private websocket : any;
    private interval: any;
    private messageQue: string[];
    private enableDebugging : boolean = true;
    private webSocketConnected : boolean = false;
    private canSend : boolean = true;
    /**
     * Creates an instance of BackEndService.
     * Requests base download dir and gets default irc settings from localstorage (if there is something stored there)
     * Send connect to irc server request to back-end
     * @param {ShareService} shareService (used for sending and receiving information to/from other Components & Services)
     * @memberof BackEndService
     */
    constructor(private shareService:ShareService){
        this.consoleWrite("Initiated backend!");
        this.messageQue = [];
        this.connected = false;

        let connectionAddress = this.shareService.getDataLocal('backEndConnectionAddress');
        if(!connectionAddress){
            this.shareService.storeDataLocal('backEndConnectionAddress', "ws://127.0.0.1:1515");
            connectionAddress = "ws://127.0.0.1:1515";
        } 

        this.address = connectionAddress;

        this.websocketMessages.subscribe((messageRec) => {
             if(messageRec !== null){
                this.consoleWrite("Message received:");
                this.consoleWrite(messageRec);
                if(messageRec.type == "irc_data")
                {
                    if(messageRec.connected)
                    {
                        if(!this.connected)
                        {                            
                            this.shareService.showMessage("succes", "Connected!");
                            this.shareService.hideLoader();

                            this.connected = true;
                                                    
                        } 
                        else
                        {
                            this.connected = false;
                        }
                    } 
                    else 
                    {          
                        this.sendMessage({"action":"connect_irc"});              
                        this.connected = false;                        
                    }

                    this.shareService.baseDownloadDirectory = messageRec.downloadlocation;
                    this.shareService.isLocal = messageRec.local;
                    this.osVersion =  messageRec.osVersion;
                    this.connectingState = messageRec.state;
                } 
                else if(messageRec.type == "welcome")
                {
                    this.sendMessage({action : "get_irc_data"});
                    this.sendMessage({action : "get_free_space"});   
                    this.sendMessage({action : "check_version"});
                } 
                else if(messageRec.type =="received_websocket_message"){
                   this.canSend = true;
                }
                else if(messageRec.errortype != null)
                {
                   // this.shareService.showMessage('error', messageRec.errormessage);
                }
             }            
        })
    }

   /**
    * Starts connection with back-end if available, and retries if not (shows message when it can't connect)
    * 
    * @param {string} address (address of backend)
    * @memberof BackEndService
    */
   async tryConnecting(){
       
       this.shareService.showMessage('success', "Waiting for backend.");


       let tryconnectinterval = setInterval(()=>{
            if(!this.webSocketConnected){
                
                this.shareService.showMessage('error', "Not connected, retrying.");
                let connectionAddress = this.shareService.getDataLocal('backEndConnectionAddress');
                if(!connectionAddress){
                    this.shareService.storeDataLocal('backEndConnectionAddress', "ws://127.0.0.1:1515");
                    connectionAddress = "ws://127.0.0.1:1515";
                } 
    
                this.address = connectionAddress;
                //this.shareService.showLoaderMessage("Waiting for connection to backend!");
                this.websocket = new WebSocket(this.address);
                    
                this.websocket.onopen = (evt : any) =>{
                    this.shareService.showLoaderMessage("Waiting for connection to IRC!");
                    this.webSocketConnected = true;
                    console.log(evt);
                    
                    this.websocketMessages.next({"type" : "websocketstatus", "status":"Connected."});
                    this.interval = setInterval(()=>{
                        if(this.messageQue.length >= 1){
                            if(this.canSend){
                                this.canSend = false;
                                this.websocket.send(this.messageQue[0]);
                                this.messageQue.splice(0, 1);
                            }
                        }
                    }, 10);
                };
                this.websocket.onmessage = (evt : any) => {
                    try{     
                        let parsed = JSON.parse(evt.data);     
                        this.shareService.webSocketLog.push(parsed);
                        this.websocketMessages.next(parsed);
    
                    } catch (e){
                        
                        this.shareService.webSocketLog.push({"error_parsing" : evt.data});
                        this.websocketMessages.next({"error" : "parsing-messesage: '" + evt.data + "'"});
                        this.consoleWrite(e);
                    }
    
                    if(this.shareService.webSocketLog.length > 1000){
                        this.shareService.webSocketLog.splice(0);
                    }
                }
                this.websocket.onclose = (evt : any)=>{
                    this.webSocketConnected = false;
                    this.websocketMessages.next({"type" : "websocketstatus", "status":"Disconnected."});                
                    clearInterval(this.interval);
                    this.tryConnecting();
                }
           } else {
               this.shareService.hideLoader();     
               
               this.shareService.showMessage('success', "Connected to backend!");
               console.log("Websocket client connected!");          
               clearInterval(tryconnectinterval);
           }        
       }, 5000);
      
    }

    /**
     * Send message to backend
     * Uses a message que so that it won't hammer the back-end with requests to give the back-end time to respond.
     * 
     * @param {*} message (message to send)
     * @memberof BackEndService
     */
    sendMessage(message: any) {
        this.messageQue.push(JSON.stringify(message));
        this.consoleWrite("pusshed the following message:");
        this.consoleWrite(JSON.stringify(message));
    }

    stopConnectionWithBackend(){
        if(this.websocket !== undefined){
            this.websocket.close();
        }
    }

    searchAnime(search : string, categories: any, genres :any, years :any, seasons :any,statusus: any, types: any, rRated: boolean, page: number = 0, amount:number = 20){  
      
        console.log("start search: " + search);
        let queryObject = {"search":search, query:[], page : page, pages : amount};

        let filterArray = new Array();
        
        if(categories.length > 0){
            let categoriesstring = "";
            for(let category of categories){
                categoriesstring = category.title + ",";
            }
            categoriesstring = categoriesstring.substr(0, categoriesstring.length - 1);
            let queryObj = {"categories" : categoriesstring}; 
            filterArray.push(queryObj);
        }
        

        let genresquery = "";
        if(genres.length > 0){
            let genresstring = "";
            for(let genre of genres){
                genresstring = genre.name + ",";
            }
            genresstring = genresstring.substr(0, genresstring.length - 1);
            let queryObj = {"genres" : genresstring}; 
            filterArray.push(queryObj);

        }

        let yearsquery = "";
        if(years.length > 0){
            let yearsstring = "";
            for(let year of years){
                yearsstring = year + ".." + year + ",";
            }
            yearsstring = yearsstring.substr(0, yearsstring.length - 1);
            let queryObj = {"year" : yearsstring}; 
            filterArray.push(queryObj);
        }

        let statususquery = "";
        if(statusus.length > 0){
            let statususstring = "";
            for(let status of statusus){
                statususstring = status + ",";
            }
            statususstring = statususstring.substr(0, statususstring.length - 1);
            let queryObj = {"status" : statususstring}; 
            filterArray.push(queryObj);
        }

        let typesquery = "";
        if(types.length > 0){
            let typesstring = "";
            for(let type of types){
                typesstring = type + ",";
            }
            typesstring  = typesstring .substr(0, typesstring .length - 1);            
            let queryObj = {"subtype" : typesstring}; 
            filterArray.push(queryObj);
        }

        queryObject.query = filterArray;
        
        console.log("query: " + search);
        console.log(queryObject);
        this.sendMessage({"action":"search_kitsu", "extra":queryObject});       
       
    }

    getAnimeInfo(id : any){                
        this.sendMessage({"action":"get_anime_profile", "extra":{"id":id}});     
    }  

    getAllCurrentlyAiring(botId : number = 21, likeness : number = 0.5, niblnotfound : boolean = false){        
        this.sendMessage({"action":"get_currently_airing",  "extra" : {"likeness" : likeness, "botid": botId, "nonniblfoundanime":niblnotfound}});     
    } 

    getAllGenres(){
        this.sendMessage({"action":"get_genres_kitsu"});
    }

    getAllCategories(){      
        this.sendMessage({"action":"get_categories_kitsu"});
    }  

    getBotList(){
        this.sendMessage({"action":"get_botlist_nibl"});        
    }

    getAnimeInfoWithEpisodes(id : string, page: number = 0, pages: number = 1){
        this.sendMessage({"action":"get_anime_episodes", "extra":{"id":id, "page":page, "pages":pages }});        
    }

    /**
     * Custom this.consoleWrite function so that it can be enabled/disabled if there is no need for debugging
     * 
     * @param {*} log (gets any type of variable and shows it if enableDebug is true) 
     * @memberof BackEndService
     */
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }

    
    
}


