import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {KitsuService} from '../../services/kitsu.service'
import {SemanticService} from '../../services/semanticui.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

/**
 * (VIEW) Shows Search view,
 * Search Component class enables users to search for animes.
 * 
 * @export
 * @class Search
 */
@Component({
    selector: 'search',
    templateUrl: './html/search.component.html',
    styleUrls: ['./css/search.component.css']
})
export class Search {
    
    searchquery : string;
    fullresult : any;
    results : any = [];
    showResults : boolean = false;
    showError : boolean = false;
    fulltitle: string;
    categories : any = [];
    selectedcategories : any = [];
    genres : any = [];
    selectedgenres : any = [];
    years : any = [];
    selectedyears : any = [];
    seasons : any = [];
    selectedseasons : any = [];
    types : any = [];
    selectedtypes : any = [];
    statusus : any = [];
    selectedstatusus : any = [];
    rRated : boolean = false;

    showCategories : boolean = false;
    showGenres : boolean = false; 
    showYears : boolean = false;
    showSeasons: boolean = false;
    showShowTypes : boolean = false;
    showPagination : boolean = false;

    currentPage : number = 0;



    /**
    * Creates an instance of Search.
    * @param {ShareService} shareService (used for sharing and receiving information from other components & services )
    * @param {KitsuService} kitsuService (used for communicating with kitsu's API)
    * @param {Router} router (used for redirecting if needed)
    * @memberof Search
    */
    constructor(private semanticService : SemanticService, private shareService : ShareService, private kitsuService : KitsuService, private router:Router){
        this.seasons = ["winter", "spring", "summer", "autumn"];
        this.types = ["TV", "movie", "special", "OVA", "ONA", "music"];
        this.statusus = ["current", "finished", "tba", "unreleashed", "upcoming"];
        this.searchquery = "nothing searched";
    }

   /**
    * Runs everytime and checks if the search query has already been executed before, and shows the results if it has, so that it doesnt 
    * need to execute the query each time you switch between the search view and other views.
    * 
    * @memberof Search
    */
   ngOnInit(){
        let previousSearch = this.shareService.getDataLocal("animesearch");

        this.kitsuService.getAllCategories().subscribe((result) => {
            this.categories = result;   
            this.semanticService.enableAccordion();
            this.semanticService.enableDropDown();
        });

        this.kitsuService.getAllGenres().subscribe((result) => {
            this.genres = result;
            this.semanticService.enableAccordion();
            this.semanticService.enableDropDown();
        });

        for(let i = 1950; i <= (new Date()).getFullYear(); i++){
            this.years.push(i.toString());
        }


        this.semanticService.enableAccordion();
        this.semanticService.enableDropDown();
        if(previousSearch != false){
            this.consoleWrite("PREVSEARCH:");
            this.consoleWrite(previousSearch);
            let search = JSON.parse(previousSearch);
            this.searchquery = search.query;
            this.results = search.result;
            this.searchquery = search.query;
            this.fullresult  = search.result;
            this.selectedcategories = search.categories;
            this.selectedgenres = search.genres;
            this.selectedseasons = search.seasons;
            this.selectedyears = search.years;
            this.selectedtypes = search.types;
            this.selectedstatusus = search.statusus;
            this.showPagination = search.showPagination;
            this.shareService.searchQuery.next(this.searchquery);
            this.showResults = true;
        }  
    }

    /**
     * Async method for executing a search query and stores it using localstorage
     * 
     * @param {string} searchQuery (contains the search query)
     * @memberof Search
     */
    async search(searchQuery:string){
        this.searchquery = searchQuery;
        this.showResults = false;
        this.searchquery = searchQuery;                
        this.shareService.searchQuery.next(this.searchquery);
        this.shareService.showLoaderMessage("Searching");
        this.kitsuService.searchAnime(searchQuery, this.selectedcategories, this.selectedgenres, this.selectedyears, this.selectedseasons, this.selectedstatusus, this.selectedtypes, this.rRated,  5, 0).subscribe((result)=>{
           this.consoleWrite(result);
           this.consoleWrite(this.rRated);
            this.results= result;
            if(this.results.length >= 99){
                this.showPagination = true;
            }

            
            let newSearchResult = {
                query : searchQuery,
                result: this.results, 
                pagenumber : this.currentPage, 
                categories: this.selectedcategories, 
                genres : this.selectedgenres, 
                years: this.selectedyears, 
                seasons : this.selectedseasons, 
                types : this.selectedtypes,
                statusus : this.selectedstatusus,
                showPagination : this.showPagination
            };
            
            this.shareService.storeDataLocal("animesearch", JSON.stringify(newSearchResult));

            this.shareService.hideLoader();
            this.showResults = true;
        })
         
    }

    addGenre(genre :any){
        let found = false;
        for(let genre_ of this.selectedgenres)
        {   
            if(genre.name == genre_.name){
                found =true;
                break;
            }
        }
        if(!found){
            this.selectedgenres.push(genre);
        }
    }

    addCategory(categorie: any){
        let found = false;
        for(let categorie_ of this.selectedcategories)
        {   
            if(categorie.title == categorie_.title){
                found =true;
                break;
            }
        }
        if(!found){
            this.selectedcategories.push(categorie);
        }
    }

    addYear(year :string){
        let found = false;
        for(let year_ of this.selectedyears)
        {   
            if(year == year_){
                found =true;
                break;
            }
        }
        if(!found){
            this.selectedyears.push(year);
        }
    }

    addSeason(season: string){
        let found = false;
        for(let season_ of this.selectedseasons)
        {   
            if(season == season_){
                found =true;
                break;
            }
        }
        if(!found){
            this.selectedseasons.push(season);
        }
    }

    addType(type :string){
        let found = false;
        for(let type_ of this.selectedtypes)
        {   
            if(type == type_){
                found =true;
                break;
            }
        }
        if(!found){
            this.selectedtypes.push(type);
        }
    }

    addStatus(status: string){
        let found = false;
        for(let status_ of this.selectedstatusus)
        {   
            if(status== status_){
                found =true;
                break;
            }
        }
        if(!found){
            this.selectedstatusus.push(status);
        }
    }

    removeGenre(genre: any){
        let index = 0;
        for(let genre_ of this.selectedgenres)
        {   
            if(genre.name == genre_.name){
                this.selectedgenres.splice(index, 1);
                break;
            }
            index++;
        } 
        
    }

    removeCategory(categorie: any){
        let index = 0;
        for(let categorie_ of this.selectedcategories)
        {   
            if(categorie.title == categorie_.title){
                this.selectedcategories.splice(index, 1);
                break;
            }
            index++;
        }
    }

    removeYear(year: string){
        let index = 0;
        for(let year_ of this.selectedyears)
        {   
            if(year == year_){
                this.selectedyears.splice(index, 1);
                break;
            }
            index++;
        }
    }

    removeSeason(season: string){
        let index = 0;
        for(let season_ of this.selectedseasons)
        {   
            if(season == season_){
                this.selectedseasons.splice(index, 1);
                break;
            }
            index++;
        }
    }
    removeType(type: string){
        let index = 0;
        for(let type_ of this.selectedtypes)
        {   
            if(type == type_){
                this.selectedtypes.splice(index, 1);
                break;
            }
            index++;
        }
    }
    removeStatus(status: string){
        let index = 0;
        for(let status_ of this.selectedstatusus)
        {   
            if(status == status_){
                this.selectedstatusus.splice(index, 1);
                break;
            }
            index++;
        }
    }

    includeRRated(yesorno : string){
        if(yesorno == "Yes"){
            this.rRated = true;
        } else {
            this.rRated = false;
        }
    }

    nextPage(){       
        this.currentPage++;
        
        this.shareService.showLoaderMessage("Waiting for page.");
        this.kitsuService.searchAnime(this.searchquery, this.selectedcategories, this.selectedgenres, this.selectedyears, this.selectedseasons, this.selectedstatusus, this.selectedtypes, this.rRated,  5, (this.currentPage * 5)).subscribe((result)=>{
                
            this.results= result;
            if(this.results.length >= 99){
                this.showPagination = true;
            }

            

            let newSearchResult = {
                query : this.searchquery,
                result: this.results, 
                pagenumber : this.currentPage, 
                categories: this.selectedcategories, 
                genres : this.selectedgenres, 
                years: this.selectedyears, 
                seasons : this.selectedseasons, 
                types : this.selectedtypes,
                statusus : this.selectedstatusus,
                showPagination : this.showPagination
            };                   
            this.shareService.storeDataLocal("animesearch", JSON.stringify(newSearchResult));

            this.shareService.hideLoader();
            this.showResults = true;
        })
    }

    prevPage(){
        if(this.currentPage > 0){
            this.currentPage--;
            
            this.shareService.showLoaderMessage("Waiting for page.");
            this.kitsuService.searchAnime(this.searchquery, this.selectedcategories, this.selectedgenres, this.selectedyears, this.selectedseasons, this.selectedstatusus, this.selectedtypes, this.rRated,  5, (this.currentPage * 5)).subscribe((result)=>{
                   
                this.results= result;
                if(this.results.length >= 99){
                    this.showPagination = true;
                }
    
                

                let newSearchResult = {
                    query : this.searchquery,
                    result: this.results, 
                    pagenumber : this.currentPage, 
                    categories: this.selectedcategories, 
                    genres : this.selectedgenres, 
                    years: this.selectedyears, 
                    seasons : this.selectedseasons, 
                    types : this.selectedtypes,
                    statusus : this.selectedstatusus,
                    showPagination : this.showPagination
                };                
                this.shareService.storeDataLocal("animesearch", JSON.stringify(newSearchResult));
    
                this.shareService.hideLoader();
                this.showResults = true;
            })
        }
    }

    specificPage(pageNumber : string){
        let pNum = Number(pageNumber);
        this.results = [];
        if(pNum  < (this.fullresult.length / 100)){
             
            this.kitsuService.searchAnime(this.searchquery, this.selectedcategories, this.selectedgenres, this.selectedyears, this.selectedseasons, this.selectedstatusus, this.selectedtypes, this.rRated,  5, (this.currentPage * 5)).subscribe((result)=>{
                   
                this.results= result;
                if(this.results.length >= 99){
                    this.showPagination = true;
                }
    
                
                let newSearchResult = {
                    query : this.searchquery,
                    result: this.results, 
                    pagenumber : this.currentPage, 
                    categories: this.selectedcategories, 
                    genres : this.selectedgenres, 
                    years: this.selectedyears, 
                    seasons : this.selectedseasons, 
                    types : this.selectedtypes,
                    statusus : this.selectedstatusus,
                    showPagination : this.showPagination
                };                
                this.shareService.storeDataLocal("animesearch", JSON.stringify(newSearchResult));
    
                this.shareService.hideLoader();
                this.showResults = true;
            })
            this.currentPage = pNum;
        }
    }

    /**
     * Used to show the full title if the user hovers over a card with anime information 
     * 
     * @param {string} animetitle 
     * @memberof Search
     */
    setPopUpContent(animetitle: string){        
        this.fulltitle = animetitle;        
    }

    /**
     * Opens Component: animeinfo.component.ts to show anime information when the user clicks on one of the results (shown as anime cover + title)
     * 
     * @param {*} anime (anime json object for the anime that the user clicked on)
     * @memberof Search
     */
    async showAnimeInfoFor(anime : any){
       
        this.consoleWrite(anime);     
        
        this.shareService.animetoshow.next(anime);
        this.router.navigate(['animeinfo']);   

    }

    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }


}