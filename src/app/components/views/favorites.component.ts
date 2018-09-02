import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';


/**
 * (VIEW) Shows favorite view,
 * Favorite component class enables to list and change the favorites defined by the user.
 * 
 * @export
 * @class Favorites
 */
@Component({
    selector: 'favorites',
    templateUrl: './html/favorites.component.html',
    styleUrls: ['./css/favorites.component.css']
})
export class Favorites {
    favoriteAnimes : any;
    showFavorites : boolean;
    fulltitle: string;

  /**
   * Creates an instance of Favorites.
   * @param {ShareService} shareService (used for sharing and receiving information from other components & services )
   * @param {Router} router (used for redirecting if needed)
   * @memberof Favorites
   */
  constructor(private shareService: ShareService, private router: Router){
        let getCurrentFavorites = this.shareService.getDataLocal("favorites");
        if(!getCurrentFavorites){
            this.showFavorites = false;
            this.favoriteAnimes = [];
        } else {
            let currentFavorites = JSON.parse(getCurrentFavorites);
            this.favoriteAnimes = currentFavorites.favorites;
            this.showFavorites = true;
        }    

    }

    /**
     * Removes anime from favorites
     * 
     * @param {string} id (used for searching the anime to remove)
     * @memberof Favorites
     */
    removeFromFavorites(id : string){
        let getCurrentFavorites = this.shareService.getDataLocal("favorites");
        if(!getCurrentFavorites){
            this.showFavorites = false;
            this.favoriteAnimes = [];
        } else {

           
            let currentFavorites = JSON.parse(getCurrentFavorites);

            let index = 0;
            for(let currentFavorite of currentFavorites.favorites){
                if(currentFavorite.id == id){
                    break;
                }
                index++;
            }

            currentFavorites.favorites.splice(index, 1);

            this.shareService.storeDataLocal("favorites", JSON.stringify(currentFavorites));
            
            this.shareService.favoriteamount.next(currentFavorites.length);
            if(currentFavorites != 0){                    
                this.showFavorites = true;
                this.favoriteAnimes = currentFavorites;
            } else {
                this.showFavorites = false;
                this.favoriteAnimes = [];
            }
        }    
    }

    /**
     * Used to redirect to animeinfo.component.ts view for showing the anime
     * 
     * @param {*} anime (anime json object to show) 
     * @memberof Favorites
     */
    showAnimeInfoFor(anime : any){
        this.shareService.animetoshow.next(anime);
        this.router.navigate(['animeinfo']);      
    }

    /**
     * Used to show full anime title when the user hovers over the anime card/cover.
     * 
     * @param {string} animetitle (title to show)
     * @memberof Favorites
     */
    setPopUpContent(animetitle: string){        
        this.fulltitle = animetitle;        
    }
}
