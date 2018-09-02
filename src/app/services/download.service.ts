import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable, Subject, BehaviorSubject} from 'rxjs/Rx';
import {BackEndService} from './backend.service';
import {ShareService} from './share.service';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
/**
 * (SERVICE) DownloadService
 *  Service for handling downloads, communicates with backend.
 * 
 * @export
 * @class DownloadService
 */
@Injectable()
export class DownloadService {

    public alreadyDownloaded : any;
    public downloadQue : any[];
    public updateDownloadList : Subject<any> = new BehaviorSubject<any>(null);
    public updateAlreadyDownloadedList : Subject<any> = new BehaviorSubject<any>(null);

    private enableDebugging : boolean = true;
    
    /**
     * Creates an instance of DownloadService.
     * @param {BackEndService} backendService (for communicating with the backend)
     * @param {ShareService} shareService (for sharing information with other components & services)
     * @memberof DownloadService
     */
    constructor(private backendService: BackEndService, private shareService:ShareService){
        this.downloadQue = [];
        this.alreadyDownloaded = {};
        this.backendService.websocketMessages.subscribe((message) => {
            if(message.type == "download_update"){
                let obj = this.downloadQue.find(x => x.id == message.id);               
                var index = this.downloadQue.indexOf(obj);
                if(index != -1){

                    if(this.downloadQue[index].filename != message.filename){
                        this.getAlreadyDownloaded();
                    }
                    this.downloadQue[index] = message;
                    this.updateDownloadList.next(this.downloadQue); 
                    this.shareService.updateAmountOfDownloads(this.downloadQue.length);  
                } else {
                    
                    this.downloadQue.push( message );
                    this.updateDownloadList.next(this.downloadQue);   
                    this.shareService.updateAmountOfDownloads(this.downloadQue.length);
                }
               
                if(message.status == "COMPLETED"){
                    let obj = this.downloadQue.find(x => x.id == message.id);               
                    let index = this.downloadQue.indexOf(obj);
                    this.downloadQue.splice(index, 1);
                    this.updateDownloadList.next(this.downloadQue); 
                    this.getAlreadyDownloaded();
                    this.shareService.updateAmountOfDownloads(this.downloadQue.length);  
                }

                if(message.status == "ABORTED"){
                    let obj = this.downloadQue.find(x => x.id == message.id);               
                    let index = this.downloadQue.indexOf(obj);
                    this.downloadQue.splice(index, 1);
                    this.updateDownloadList.next(this.downloadQue); 
                    this.getAlreadyDownloaded();  
                    this.shareService.updateAmountOfDownloads(this.downloadQue.length);
                }

                

            }

            if(message.type == "download_history_list"){
                this.consoleWrite(message);
                this.updateAlreadyDownloadedList.next(message.downloadHistorylist);
                this.alreadyDownloaded = message;
            }
        });
    }

    /**
     * Adds download to the download queue on the backend.  
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof DownloadService
     */
    addDownload(download: any){
        this.downloadQue.push(download);

        let customDirPerAnime = this.shareService.getDataLocal("CustomDirectoryPerAnime");
        this.consoleWrite("custom dir check clicked");
        this.consoleWrite(customDirPerAnime);
        if(!customDirPerAnime){
            this.shareService.storeDataLocal("CustomDirectoryPerAnime", "enabled");
            download.filesize = download.filesize.substr(0, download.filesize.length - 1);
            this.backendService.sendMessage({"action": "add_download", "extra" : download});
        } else {
            if(customDirPerAnime == "enabled"){
                download.filesize = download.filesize.substr(0, download.filesize.length - 1);
                this.backendService.sendMessage({"action": "add_download", "extra" : download});
            } else {
                download.filesize = download.filesize.substr(0, download.filesize.length - 1);
                download.dir = "NoSeperateDirectories";                
                this.backendService.sendMessage({"action": "add_download", "extra" : download});
            }
        }

        this.shareService.updateAmountOfDownloads(this.downloadQue.length);
       
    }

    /**
     * Sends a remove download from queue request to the backend and removes it from the local download list
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof DownloadService
     */
    removeDownload(download: any){
        this.backendService.sendMessage({"action" : "remove_download", "extra" : {"id" : download.id}});
        let obj = this.downloadQue.find(x => x.id == download.id);               
        let index = this.downloadQue.indexOf(obj);
        this.downloadQue.splice(index, 1);
        this.shareService.updateAmountOfDownloads(this.downloadQue.length);
        this.updateDownloadList.next(this.downloadQue);           
        this.getAlreadyDownloaded();
    }

    abortDownload(download: any){
        this.backendService.sendMessage({"action" : "abort_download", "extra" : {"id" : download.id}});
        let obj = this.downloadQue.find(x => x.id == download.id);               
        let index = this.downloadQue.indexOf(obj);
        this.downloadQue.splice(index, 1);
        this.shareService.updateAmountOfDownloads(this.downloadQue.length);
        this.updateDownloadList.next(this.downloadQue);        
    }


    /**
     * Requests all downloaded files from the backend
     * 
     * @memberof DownloadService
     */
    getAlreadyDownloaded(){
       this.backendService.sendMessage({"action" : "get_downloads"});
    }

    /**
     * Sends a update to a observable used to track the downloadqueue
     * 
     * @memberof DownloadService
     */
    getDownloadList(){
       this.updateDownloadList.next(this.downloadQue);
    }

    /**
     * Custom this.consoleWrite function so that it can be enabled/disabled if there is no need for debugging
     * 
     * @param {*} log (gets any type of variable and shows it if enableDebug is true) 
     * @memberof DownloadService
     */
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }

   
}