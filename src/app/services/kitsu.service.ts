import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Subject, BehaviorSubject, Observable} from 'rxjs/Rx';
import {BackEndService} from './backend.service';
import {NiblService} from './nibl.service'
import {ShareService} from './share.service'
import {UtilityService} from './utility.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { forkJoin } from "rxjs/observable/forkJoin";
import { concat } from "rxjs/observable/concat"
import { query } from '@angular/core/src/animation/dsl';

/**
 * (SERVICE) KitsuService
 * Service to communicatie with the API from http://kitsu.io
 * 
 * @export
 * @class KitsuService
 */
@Injectable()
export class KitsuService {

    public currentAnimeData: any;
    public animeDataEvents : Subject<any> = new BehaviorSubject<any>(null);

    private episodesRetreived : any;
    private enableDebugging : boolean = true;

    /**
     * Creates an instance of KitsuService.
     * @param {Http} http (used for http requests)
     * @param {NiblService} niblService (used for communicating with the api from nibl.co.uk)
     * @param {ShareService} shareService (used to send and receive information to/form other Components & Services)
     * @param {UtilityService} utilityService (contains methods not specific to any Component)
     * @memberof KitsuService
     */
    constructor(private http: Http, private backEndService: BackEndService, private niblService :NiblService, private shareService : ShareService, private utilityService : UtilityService){      
        this.consoleWrite("Launching Kitsu API");
        this.currentAnimeData = null;
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
        this.backEndService.sendMessage({"action":"search_kitsu", "extra":queryObject});       
       
    }
        
    /**
     * To get specific anime information using the api from kitsu.
     * 
     * @param {*} id (id of anime)
     * @memberof KitsuService
     */
    getAnimeInfo(id : any){                
        this.backEndService.sendMessage({"action":"get_anime_profile", "extra":{"id":id}});     
    }  
    /**
     * Get all currently airing anime on kitsu
     * 
     * @returns {object} (json object with response) 
     * @memberof KitsuService
     */
    getAllCurrentlyAiring(botId : number = 21, likeness : number = 0.5, niblnotfound : boolean = false){        
        this.backEndService.sendMessage({"action":"get_currently_airing",  "extra" : {"likeness" : likeness, "botid": botId, "nonniblfoundanime":niblnotfound}});     
    } 

    getAllGenres(){
        //https://kitsu.io/api/edge/genres
        this.backEndService.sendMessage({"action":"get_genres_kitsu"});
    }

    getAllCategories(){      
        this.backEndService.sendMessage({"action":"get_categories_kitsu"});
    }    
    
    /**
     * Custom this.consoleWrite function so that it can be enabled/disabled if there is no need for debugging
     * 
     * @param {*} log (gets any type of variable and shows it if enableDebug is true) 
     * @memberof KitsuService
     */
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }
}