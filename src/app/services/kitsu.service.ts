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
    constructor(private http: Http, private niblService :NiblService, private shareService : ShareService, private utilityService : UtilityService){      
        this.consoleWrite("Launching Kitsu API");
        this.currentAnimeData = null;
    }

    /**
     * To search anime using the api from kitsu.
     * 
     * @param {string} search (search query)
     * @param {number} amount (amount of results (max) (range: 1-20))
     * @param {string} [status] (to get only anime with a specific status (airing for example))
     * @returns {object} (json object with response)
     * @memberof KitsuService
     */
    searchAnime(search : string, categories: any, genres :any, years :any, seasons :any,statusus: any, types: any, rRated: boolean, amount: number, offset:number ){  
        let fullquery = "";

        if(search.length > 0){
            fullquery += "&filter[text]" + search;
        }
        let categoriesquery = "";
        if(categories.length > 0){
            let categoriesstring = "";
            for(let category of categories){
                categoriesstring = category.title + ",";
            }
            categoriesstring = categoriesstring.substr(0, categoriesstring.length - 1);
            categoriesquery = "filter[categories]=" + categoriesstring;
            fullquery += "&" + categoriesquery ;
        }
        

        let genresquery = "";
        if(genres.length > 0){
            let genresstring = "";
            for(let genre of genres){
                genresstring = genre.name + ",";
            }
            genresstring = genresstring.substr(0, genresstring.length - 1);
            genresquery = "filter[genres]=" + genresstring;

           
            fullquery += "&" + genresquery;

        }

        let yearsquery = "";
        if(years.length > 0){
            let yearsstring = "";
            for(let year of years){
                yearsstring = year + ".." + year + ",";
            }
            yearsstring = yearsstring.substr(0, yearsstring.length - 1);
            yearsquery = "filter[year]=" + yearsstring;
            fullquery += "&" + yearsquery;
        }

        let statususquery = "";
        if(statusus.length > 0){
            let statususstring = "";
            for(let status of statusus){
                statususstring = status + ",";
            }
            statususstring = statususstring.substr(0, statususstring.length - 1);
            statususquery = "filter[status]=" + statususstring;
            fullquery += "&" + statususquery;
        }

        let typesquery = "";
        if(types.length > 0){
            let typesstring = "";
            for(let type of types){
                typesstring = type + ",";
            }
            typesstring  = typesstring .substr(0, typesstring .length - 1);
            typesquery = "filter[subtype]=" + typesstring ;
            fullquery += "&" + typesquery;
        }

     

        let observable=Observable.create(async observer => { 
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?' + fullquery)).toPromise();
            let results = response.json();

            let amountofanimeairing = results.meta.count;
            let amountofrequests = amountofanimeairing / 20 + 1;
            let reqcount = 0;
            let reqoffset = 0;
            var getRequests = [];
            let objArray = [];
            getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/anime?' + fullquery + '&page[limit]=20&page[offset]=' + (offset * 20))).map((res)=> res.json()));
            for(reqcount = offset + 1 ; reqcount < offset + amount; reqcount++){
                getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/anime?' + fullquery + '&page[limit]=20&page[offset]=' + (reqcount * 20 + 1))).map((res)=> res.json()));
            }

            forkJoin(getRequests).subscribe((next : any) =>{
                for(let result of next){
                    for(let data of result.data){
                        if(data.attributes.posterImage != null && data.attributes.nsfw == rRated){                            
                            objArray.push(data);  
                        }              
                    }
                }  
                observer.next(objArray);
                observer.complete();
            });
          
        });
        return observable;
       
       
    }
        
    /**
     * To get specific anime information using the api from kitsu.
     * 
     * @param {*} id (id of anime)
     * @param {string} query (custom query (check: https://kitsu.docs.apiary.io/#))
     * @param {string} offset (used for specifiying starting index for mutliple results)
     * @param {string} [type] (for specific type (tv, movie etc.))
     * @returns {object} (json object with response)
     * @memberof KitsuService
     */
    async getAnimeInfo(id : any,  offset: string, query: string, type?: string){
        
        this.episodesRetreived = undefined;
        if(type === undefined || type == null){
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id + "?page[limit]=20&page[offset]=" + offset + query)).toPromise();        
            var json = response.json();
            return json;
        } else  {
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id + '/' + type + "?page[limit]=20&page[offset]=" + offset + query)).toPromise();
            var json = response.json();
            return json;  
        }
    }
    
    /**
     * Get all anime information about anime using id of anime using api from kitsu.
     * 
     * @param {*} id (id of anime)
     * @returns {object} (json object with response) 
     * @memberof KitsuService
     */
    async getAllInfo(id: any){
        const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id)).toPromise();        
        var globalInfo = response.json();
        
        var newObj = {id: id, animeInfo : globalInfo.data.attributes, relations : {}};
        const responseRelationship = await this.http.get( encodeURI(globalInfo.data.relationships.genres.links.related)).toPromise();  
        var relationInfo = responseRelationship.json();  
        newObj.relations["genres"] = relationInfo.data;
        return newObj;
    }

    /**
     * Gets currently airing per page (max result = 20 so with > 20 airing animes you need to go through multiple pages)
     * 
     * @param {string} limit (max result limit)
     * @param {string} page (page to request)
     * @returns {object} (json object with response) 
     * @memberof KitsuService
     */
    async getCurrentlyAiringPerPage(limit : string, page: string){
        const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=' + limit + '&page[offset]=' + page)).toPromise();
        return response.json();       
    }

    /**
     * Get all currently airing anime on kitsu
     * 
     * @returns {object} (json object with response) 
     * @memberof KitsuService
     */
     getAllCurrentlyAiring(){
        let observable=Observable.create(async observer => {         

            this.niblService.getLatestEpisodes(692).subscribe(async(result)=>{
                this.consoleWrite("RESULT:");
                this.consoleWrite(result);
                var seconds = new Date().getTime() / 1000;
                var objArray = [];
                var parsedAnimes = [];
                var parsedAnimeTitles= [];
                var getRequests = [];
                this.consoleWrite(result);
                const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current')).toPromise();
                let results = response.json();

                let amountofanimeairing = results.meta.count;
                let amountofrequests = amountofanimeairing / 20 + 1;
                let reqcount = 0;
                let reqoffset = 0;
                getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=20&page[offset]=' + (reqcount * 20))).map((res)=> res.json()));
                for(reqcount = 1 ; reqcount < amountofrequests; reqcount++){
                    getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=20&page[offset]=' + (reqcount * 20 + 1))).map((res)=> res.json()));
                }


                
                let i = 0;
                
                for(i = 0; i < amountofanimeairing; i++){
                    let strippedepisodename = this.utilityService.stripName(result[i]);
                    parsedAnimeTitles.push(strippedepisodename);
                }
                
                this.consoleWrite(parsedAnimeTitles);
                this.consoleWrite(getRequests);
                forkJoin(getRequests).subscribe((next : any) =>{
                    this.consoleWrite("KITSU RESULT:");
                    this.consoleWrite(next);
                    
                    for(let animetitle of parsedAnimeTitles){
                        for(let result of next){
                            for(let data of result.data){
                                let strippedslug = this.utilityService.stripName(data.attributes.slug);
                               // this.consoleWrite(strippedslug);
                            //   this.consoleWrite("comparing:");
                              //  this.consoleWrite(animetitle);
                              //  this.consoleWrite(strippedslug);
                                if(this.utilityService.compareNames(animetitle, strippedslug) > 40 && parsedAnimes.indexOf(strippedslug) == -1){
                                    parsedAnimes.push(strippedslug);
                                    objArray.push(data);
                                    break;
                                }
                            }
                        }
                    }
                    this.consoleWrite("END:");
                    seconds = (new Date().getTime() / 1000) - seconds;
                    this.consoleWrite(seconds); 
                    observer.next(objArray);
                    observer.complete();

                });
                
                
                    
               
            });
        });
        return observable;
        
    } 

    getAllGenres(){
        //https://kitsu.io/api/edge/genres
        let observable=Observable.create(async observer => {      
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/genres')).toPromise();
            let results = response.json();

            let arraywithgenres=[];
            let amountofanimeairing = results.meta.count;
            let amountofrequests = amountofanimeairing / 20 + 1;
            let reqcount = 0;
            let reqoffset = 0;
            var getRequests = [];
            getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/genres?page[limit]=20&page[offset]=' + (reqcount * 20))).map((res)=> res.json()));
            for(reqcount = 1 ; reqcount < amountofrequests; reqcount++){
                getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/genres?page[limit]=20&page[offset]=' + (reqcount * 20 + 1))).map((res)=> res.json()));
            }

            forkJoin(getRequests).subscribe((next : any) =>{
                for(let result of next){
                    for(let data of result.data){
                        arraywithgenres.push(data.attributes);                  
                    }
                }
            });
                
            observer.next(arraywithgenres);
            observer.complete();
        });
        return observable;
    }

     getAllCategories(){
        let observable=Observable.create(async observer => {      
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/categories')).toPromise();
            let results = response.json();

            let arraywithcategories=[];
            let amountofanimeairing = results.meta.count;
            let amountofrequests = amountofanimeairing / 20 + 1;
            let reqcount = 0;
            let reqoffset = 0;
            var getRequests = [];
            getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/categories?page[limit]=20&page[offset]=' + (reqcount * 20))).map((res)=> res.json()));
            for(reqcount = 1 ; reqcount < amountofrequests; reqcount++){
                getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/categories?page[limit]=20&page[offset]=' + (reqcount * 20 + 1))).map((res)=> res.json()));
            }

            forkJoin(getRequests).subscribe((next : any) =>{
                for(let result of next){
                    for(let data of result.data){
                        arraywithcategories.push(data.attributes);                  
                    }
                }
            });
                
            observer.next(arraywithcategories);
            observer.complete();
        });
        return observable;
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