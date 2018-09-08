import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {ShareService} from './share.service';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { BackEndService } from './backend.service';

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
    constructor(private http: Http, private shareService:ShareService, private backendService:BackEndService){
        this.currentVersion = "0.4.0"; //current version
    }

    async getVersion(){
        
        this.backendService.sendMessage({action : "check_version"});

      
    }
}