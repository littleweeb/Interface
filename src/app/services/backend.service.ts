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
                    this.sendMessage({"action":"get_irc_data"});
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
       
       this.shareService.showLoaderMessage("Waiting for connection to back-end!");


       let tryconnectinterval = setInterval(()=>{
            if(!this.webSocketConnected){
                
                console.log("Not conntected, trying to connect");
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
                            this.websocket.send(this.messageQue[0]);
                            this.messageQue.splice(0, 1);
                        }
                    }, 100);
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
               
               console.log("Websocket client connected!");          
               clearInterval(tryconnectinterval);
           }        
       }, 2000);
      
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


