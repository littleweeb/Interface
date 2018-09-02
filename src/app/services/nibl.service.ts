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

    /**
     * Sends multiple search requests
     * 
     * @param {string[]} queries (search queries)
     * @returns 
     * @memberof NiblService
     */
    getSearchAnimeResultsMulti(queries : string[]){

        let observable=Observable.create(observer => {
          
             let getRequests = [];

            for(let query of queries){
                getRequests.push( this.http.get( 'https://api.nibl.co.uk:8080/nibl/search/?query=' + query + '&episodeNumber=-1').map((res)=> res.json()));
            }
            forkJoin(getRequests).subscribe((next : any) =>{
                let objlist = [];
                for(let obj of next){
                    let content = obj.content;
                    for(let file of content){
                        if(objlist.indexOf(file) == -1){
                            objlist.push(file);
                        }
                    }
                }
                
                observer.next(objlist);
                observer.complete();
            });
           
        });
        return observable;
    }
    
    /**
     * Gets a list with all the bots
     * 
     * @returns {object} (Contains results as json object)
     * @memberof NiblService
     */
    async getBotListSync(){
        const response = await this.http.get( 'https://api.nibl.co.uk:8080/nibl/bots').toPromise();
        return response.json().content;
    }

    /**
     * Get latest episodes added to a bot of the past week
     * 
     * @param {number} id (bot id)
     * @returns {string []} (episode names)
     * @memberof NiblService
     */
    getLatestEpisodes(id: number){
        this.observable = this.http.get('https://api.nibl.co.uk:8080/nibl/search/' + id + '?query=720').map(res => {
            this.observable = null;
            var eplist = res.json();
            var listWithEpisodeNames = [];
            let aWeekAgoDate = new Date();
            aWeekAgoDate.setDate(aWeekAgoDate.getDate()-8);
            
            for(let ep of eplist.content){

                let date = ep.lastModified.split('-');
                let lastModified = new Date(date[0], date[1] - 1, date[2].split(' ')[0]); 
                if( (lastModified.getTime() > aWeekAgoDate.getTime()))
                {                    
                    listWithEpisodeNames.push(ep.name);
                }
            }
            var reverse = listWithEpisodeNames.reverse();
            var withoutDuplicates = reverse.filter(function(item, index) {
                if (reverse.indexOf(item) == index)
                    return item;
            });
            return reverse;
        }).share();
        return this.observable;

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