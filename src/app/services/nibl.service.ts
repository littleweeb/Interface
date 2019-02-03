import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';
import {ShareService} from './share.service'
import {UtilityService} from './utility.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { forkJoin } from "rxjs/observable/forkJoin";

/**
 * (SERVICE) NiblService
 * NiblService allows for communicating with http://nibl.co.uk API.
 * @export
 * @class NiblService
 */
@Injectable()
export class NiblService {

    private month : number;
    private year : number; 
    private date : Date;
    private season: string;
    private currentlyAiring : Object;
    private searchResult : Object;
    private botList : Object;
    private latestPacks : Object;
    private packsForBot : Object;
    private enableDebugging : boolean = true;
    private observable : any;

    /**
     * Creates an instance of NiblService.
     * @param {Http} http (used for http requests)
     * @param {ShareService} shareService (used to send and receive information to/from other Components & Services)
     * @param {UtilityService} utilityService  (contains methods not specific to any Component)
     * @memberof NiblService
     */
    constructor(private http: Http,private shareService: ShareService, private utilityService:UtilityService){
        this.consoleWrite("Nibl Service Initialiazed...");
        this.date = new Date();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
    }

 
    getBotListSync(){
        
    }


     /**
     * Custom this.consoleWrite function so that it can be enabled/disabled if there is no need for debugging
     * 
     * @param {*} log (gets any type of variable and shows it if enableDebug is true) 
     * @memberof NiblService
     */
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }

}