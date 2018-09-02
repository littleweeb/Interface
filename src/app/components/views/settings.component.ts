import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'
import {Subject} from 'rxjs/Rx';
import {Pipe} from '@angular/core';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
/**
 * (VIEW) Shows Settings view,
 * Settings component, used to set settings such as IRC Connection (Server, Channels, Username), Download Directory & Resetting & Viewing local storage
 * 
 * Default settings;
 * IRC:
 * address: irc.rizon.net
 * channels: #nibl,#horriblesubs,#news
 * username: "" = let backend generate username
 * 
 * @export
 * @class Settings
 */
@Component({
    selector: 'settings',
    templateUrl: './html/settings.component.html',
    styleUrls: ['./css/settings.component.css']
})
export class Settings {

    downloadlocation : string;

    //status
    connectionStatus : string = "Disconnected.";
    connectionStatusBackEnd : string = "Disconnected";
    littleWeebSettings : any;
    ircSettings : any;
    backEndConnectionAddress : string = "ws://localhost:1515";

    //local storage
    localStorageKeys : string[];
    localStorageData : string;
    localStorageSelected : string;

    //settings
    address: string = "irc.rizon.net";
    channels: string = "#nibl,#horriblesubs,#news";
    username : string = "";
    currentDefaultResolution : string;
    minspacerequired : string;

    //debug settings
    entryDebugLevel : boolean = false;
    parameterDebugLevel : boolean = false;
    infoDebugLevel : boolean = false;
    warningDebugLevel : boolean = false;
    errorDebugLevel : boolean = false;
    severeDebugLevel : boolean = false;

    constructorsDebugMessage : boolean = false;
    methodsDebugMessage : boolean = false;
    eventsDebugMessage : boolean = false;
    tasksDebugMessage : boolean = false;
    externalDebugMessage : boolean = false;
    undefinedDebugMessage : boolean = false;

    //websocketlog
    webSocketLog : string = "";

    //enable console
    enableConsoleLog : boolean;


    /**
     * Creates an instance of Settings.
     * @param {BackEndService} backEndService (used for communicating with the backend)
     * @param {ShareService} shareService (used for sharing and retreiving information with other components & services)
     * @param {SemanticService} semanticui (used for manipulating dom elements for SemanticUI CSS Framework through jQuery)
     * @memberof Settings
     */
    constructor(private backEndService: BackEndService, private shareService: ShareService, private semanticui : SemanticService){
        this.downloadlocation = "Waiting for back-end";
        this.localStorageKeys = [];
        this.localStorageData = "";
        this.localStorageSelected = "";
        this.enableConsoleLog = this.shareService.enableConsoleLog;

        let defaultresolution = this.shareService.getDataLocal("default_resolution");
        if(defaultresolution == false){
            this.shareService.storeDataLocal("default_resolution", "720");            
            this.currentDefaultResolution = "720"; 
        } else {
            this.currentDefaultResolution = defaultresolution;
        }

        let connectionAddress = this.shareService.getDataLocal('backEndConnectionAddress');
        if(!connectionAddress){
            this.shareService.storeDataLocal('backEndConnectionAddress', "ws://127.0.0.1:1515");
            connectionAddress = "ws://127.0.0.1:1515";
        } 

        this.backEndConnectionAddress = connectionAddress;

    }

    /**
     * Listens to messages from the back-end and determines if the back-end has made a succesful connnection with the IRC Server.
     * Retreives the current download directory used by the back-end.
     * Gets the current settings stored for Custom IRC Connection if it exists within localstorage.
     * 
     * @memberof Settings
     */
    ngOnInit(){        
        let baseDownloadDirBe = this.shareService.getDataLocal("baseDownloadDir");

        
        this.backEndService.websocketMessages.subscribe((message) => {
            if(message !== null){
                if(message.type == "websocketstatus"){
                    this.connectionStatusBackEnd = message.status;
                }


                if(message.type == "irc_data"){
                    if(!baseDownloadDirBe){
                        this.shareService.storeDataLocal("baseDownloadDir", message.fullfilepath);
                    } 
                    
                    this.downloadlocation = message.fullfilepath;

                    if(message.connected){
                        this.connectionStatus = "Connected.";
                    } else {
                        this.connectionStatus = "Disconnected.";
                    }

                    this.ircSettings = message;
                }

                if(message.type == "littleweeb_settings"){
                    this.littleWeebSettings = message;

                    if(this.littleWeebSettings.debuglevel.indexOf(0) != -1){
                        this.entryDebugLevel = true;
                    }
                    if(this.littleWeebSettings.debuglevel.indexOf(1) != -1){
                        this.parameterDebugLevel = true;
                    }
                    if(this.littleWeebSettings.debuglevel.indexOf(2) != -1){
                        this.infoDebugLevel = true;
                    }
                    if(this.littleWeebSettings.debuglevel.indexOf(3) != -1){
                        this.warningDebugLevel = true;
                    }
                    if(this.littleWeebSettings.debuglevel.indexOf(4) != -1){
                        this.errorDebugLevel = true;
                    }
                    if(this.littleWeebSettings.debuglevel.indexOf(5) != -1){
                        this.severeDebugLevel = true;
                    }

                    if(this.littleWeebSettings.debugtype.indexOf(0) != -1){
                        this.constructorsDebugMessage = true;
                    }
                    if(this.littleWeebSettings.debugtype.indexOf(1) != -1){
                        this.methodsDebugMessage = true;
                    }
                    if(this.littleWeebSettings.debugtype.indexOf(2) != -1){
                        this.eventsDebugMessage = true;
                    }
                    if(this.littleWeebSettings.debugtype.indexOf(3) != -1){
                        this.tasksDebugMessage = true;
                    }
                    if(this.littleWeebSettings.debugtype.indexOf(4) != -1){
                        this.externalDebugMessage = true;
                    }
                    if(this.littleWeebSettings.debugtype.indexOf(99) != -1){
                        this.undefinedDebugMessage = true;
                    }
                    
                    this.shareService.showMessage("success", "Succesfully retreived settings. ");
                }
            }

            this.webSocketLog = JSON.stringify(this.shareService.webSocketLog, null, '\t');
        });
        this.backEndService.sendMessage({"action" : "get_littleweeb_settings"});
        this.backEndService.sendMessage({"action" : "get_irc_data"});



        let currentConnectionSettingsString= this.shareService.getDataLocal("custom_irc_connection");
        if(currentConnectionSettingsString != false){

            let currentConnectionSettings = JSON.parse(currentConnectionSettingsString);
            this.address = currentConnectionSettings.address;
            this.channels = currentConnectionSettings.channels;
            this.username = currentConnectionSettings.username;
        }

        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
            this.localStorageKeys.push(localStorage.key( i ));
        }

        let minfreespacestr = this.shareService.getDataLocal("minfreespace");
        if(minfreespacestr == false){
            this.shareService.storeDataLocal("minfreespace", "500");
            this.minspacerequired = "500";
        } else {
            this.minspacerequired = minfreespacestr;
        }
        
        this.semanticui.enableAccordion();
        this.semanticui.enableDropDown();

    }


    setCustomBackEndConnection(){
        this.shareService.storeDataLocal('backEndConnectionAddress', this.backEndConnectionAddress);
        let connectionAddress = this.shareService.getDataLocal('backEndConnectionAddress');
        if(!connectionAddress){
            this.shareService.storeDataLocal('backEndConnectionAddress', "ws://127.0.0.1:1515");
            connectionAddress = "ws://127.0.0.1:1515";
        } 
        this.backEndConnectionAddress = connectionAddress;

        this.reconnectToBackend();
    }

    reconnectToBackend(){
        this.disconnectFromBackend();
        this.backEndService.tryConnecting();
    }

    disconnectFromBackend(){
        this.backEndService.stopConnectionWithBackend();
    }

    setDefaultBackEndConnection(){
        this.shareService.storeDataLocal('backEndConnectionAddress', "ws://127.0.0.1:1515");
        let connectionAddress = "ws://127.0.0.1:1515";
        this.backEndConnectionAddress = connectionAddress;
    }

    setResolution(res : string){
        this.shareService.storeDataLocal("default_resolution", res);            
        this.currentDefaultResolution = res; 
        this.shareService.showMessage("success", "Succesfully set resolution to: " + res);
    }

    setMinimumRequiredSpace(){        
        this.shareService.storeDataLocal("minfreespace", this.minspacerequired);
        this.shareService.showMessage("success", "Succesfully set Minimum Space Required to: " + this.minspacerequired);
    }

    /**
     * Opens extra component called filedialog.component.ts 
     * 
     * @memberof Settings
     */
    openFileDialog(){    
        this.shareService.showFileDialog();
    }

    /**
    * Sets up a custom irc connection with user defined settings for IRC Server, Channel & Username
    * Stores it using LocalStorage
    * 
    * @memberof Settings
    */
    setCustomConnection(){
        let newConnection = {address : this.address, channels: this.channels, username: this.username};
        this.shareService.storeDataLocal("custom_irc_connection", JSON.stringify(newConnection));
        this.shareService.showMessage("success", "Succesfully set Custom Connection." );
        this.connectToIrcServer();
    }

    /**
     * Tells the back-end to connect to the irc server using the settings defined by the user, or if not defined, the default irc settings.
     * 
     * @memberof Settings
     */
    connectToIrcServer(){
        this.backEndService.sendMessage({"action" : "connect_irc", "extra" : {address : this.address, channels: this.channels, username: this.username}});
    }

    /**
     * Tells the back-end to close the connection with the irc server.
     * 
     * @memberof Settings
     */
    disconnectIrcServer(){
        this.backEndService.sendMessage({"action" : "disconnect_irc"});
    }

    /**
     * Resets the IRC settings defined by the user to default:
     * address: irc.rizon.net
     * channels: #nibl,#horriblesubs,#news
     * username: "" = let backend generate username
     * @memberof Settings
     */
    setDefaultConnection(){
        let newConnection = {address : "irc.rizon.net", channels: "#nibl, #horriblesubs, #news", username: ""};
        this.address = newConnection.address;
        this.channels = newConnection.channels;
        this.username = newConnection.username;
        this.shareService.storeDataLocal("custom_irc_connection", JSON.stringify(newConnection));
        
        this.shareService.showMessage("success", "Succesfully set Default Connection." );
        this.connectToIrcServer();
    }

    /**
     * Retreives data stored within localstorage for provided key, then shows it.
     * 
     * @param {string} key (key to retreive from local storage)
     * @memberof Settings
     */
    showKey(key :string){
        this.localStorageSelected = key;
        let localstoragedata = this.shareService.getDataLocal(key).toString();
        try{

            this.localStorageData = JSON.stringify(JSON.parse(localstoragedata), undefined, 4);
        } catch(e){
            this.localStorageData = localstoragedata;
        }
    }

    /**
     * Resets the selected storage
     * 
     * @memberof Settings
     */
    resetStorage(){
        if(this.localStorageSelected != ""){
            localStorage.removeItem(this.localStorageSelected);
            this.localStorageKeys = [];
            this.localStorageData = "";
            this.localStorageSelected = "";
            for ( var i = 0, len = localStorage.length; i < len; ++i ) {
                this.localStorageKeys.push(localStorage.key( i ));
            }
            this.shareService.showMessage("success", "Succesfully resetted storage: " + this.localStorageSelected);   
        }    
        
    }

    /**
     * Sets the debug level to be logged
     * 
     * @memberof Settings
     */
    setDebugLevel(){
        let debugLevelArray = [];
        
        if(this.entryDebugLevel){
            debugLevelArray.push(0);
        } 
        if(this.parameterDebugLevel){
            debugLevelArray.push(1);
        }
        if(this.infoDebugLevel){
            debugLevelArray.push(2);
        }
        if(this.warningDebugLevel){
            debugLevelArray.push(3);
        }
        if(this.errorDebugLevel){
            debugLevelArray.push(4);
        }
        if(this.severeDebugLevel){
            debugLevelArray.push(5);
        }

        this.littleWeebSettings.debuglevel = debugLevelArray;
        this.backEndService.sendMessage({"action" : "set_littleweeb_settings", "extra" : this.littleWeebSettings});


    }

    /**
     * Sets the debug message types to be logged
     * 
     * @memberof Settings
     */
    setDebugType(){
        
        let debugTypeArray = [];
        if(this.constructorsDebugMessage){
            debugTypeArray.push(0);
        }
        if(this.methodsDebugMessage){
            debugTypeArray.push(1);
        }
        if(this.eventsDebugMessage){
            debugTypeArray.push(2);
        }
        if(this.tasksDebugMessage){
            debugTypeArray.push(3);
        }
        if(this.externalDebugMessage){
            debugTypeArray.push(4);
        }
        if(this.undefinedDebugMessage){
            debugTypeArray.push(99);
        }

        this.consoleWrite(debugTypeArray);
        this.littleWeebSettings.debugtype = debugTypeArray;
        this.backEndService.sendMessage({"action" : "set_littleweeb_settings", "extra" : this.littleWeebSettings});
    }

    enableDisableConsole(){
        this.shareService.enableConsoleLog = !this.enableConsoleLog;
        console.log(this.shareService.enableConsoleLog);
    }

    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }

    
}