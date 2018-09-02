import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {ShareService} from './share.service';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

/**
 * (SERVICE) VersionCheck
 * Service for checking the local version and the version from the github repo: https://github.com/littleweeb/LittleWeeb
 * @export
 * @class VersionService
 */
@Injectable()
export class VersionService {

    public currentVersion : string;
    /**
     * Creates an instance of VersionService.
     * @param {Http} http (used for http requests)
     * @param {ShareService} shareService (used for sending and receiving information to and from other Components & Services)
     * @memberof VersionService
     */
    constructor(private http: Http, private shareService:ShareService){
        this.currentVersion = "0.4.0"; //current version
    }

    async getVersion(){
     
        const response = await this.http.get('https://raw.githubusercontent.com/littleweeb/LittleWeeb/master/VERSION').toPromise();
        var version = JSON.stringify(response).indexOf(this.currentVersion);
        var newversion = JSON.stringify(response).split('"')[3].split('\\')[0];
        if(version == -1){
            this.shareService.showModal("There is a new version available!", "Your current version is v" + this.currentVersion + 
                                        ", but version " + newversion + " has arrived!", 
                                        "feed", 
                                        `<div class="ui red basic cancel inverted button">
                                        <i class="remove icon"></i>
                                        Not interested.
                                        </div>
                                        <a href="https://littleweeb.github.io/" class="ui green ok inverted button">
                                        <i class="checkmark icon"></i>
                                        Go to website.
                                        </a>`);
        }

    }
}