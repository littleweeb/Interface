import { Component, OnInit,  HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Toaster} from './components/extras/toaster.component'
import {Loader} from './components/extras/loader.component'
import {Modal} from './components/extras/modal.component'
import {FileDialog} from './components/extras/filedialog.component'
import {ShareService} from './services/share.service'
import {VersionService} from './services/versioncheck.service'
import {BackEndService} from './services/backend.service'
/**
 * (MAIN) AppComponent
 * Adds sidebar menu and a router outlet
 * @export
 * @class AppComponent
 */
@Component({
  selector: 'my-app',  
  styleUrls: ['./components/extras/css/toaster.component.css'],
  template: `
           
        
            <div class="ui bottom attached segment pushable">             
                <div class="ui secondary pointing three fixed item menu phoneContent">
                
                        <a class="ui item" (click)="openCloseMenu()">
                           <i class="sidebar icon ">  </i> Menu
                        </a> 
                        
                        <a class="ui item" routerLink="currentlyairing" routerLinkActive="active" >
                         <h4>LittleWeeb {{version}}</h4>
                        </a>
                         <a class="ui item" routerLink="about" routerLinkActive="active">
                           <i class="info icon ">  </i> About
                        </a>
                       
                </div>

                <div class="ui visible inverted left vertical custom-fixed sidebar menu deskContent ">
                    <div class="ui white-text center-text margin-top-2 menu-quote"> It Takes an Idiot to do something Cool </div>
                    <div class="ui horizontal divider white-text"> LittleWeeb - {{version}} </div>
                    <div *ngFor="let menuItem of menuItems">
                        <a class="item" routerLink="{{menuItem.view}}" routerLinkActive="active">
                            <i class="{{menuItem.icon}} icon "></i> {{menuItem.title}}
                        </a>
                    </div> 
                    <div class="ui horizontal divider"> </div>
                    
                    <div style="bottom: 10px; !important;">
                        <div (click)="showReleaseUpdate()" class="custom-notification" *ngIf="newRelease.update_available"> <i class="bell icon"></i>A new Release version is available! (Click here for more info.)</div>
                        <div (click)="showDevelopUpdate()" class="custom-notification" *ngIf="newDevelop.update_available"> <i class="bell icon"></i>A new Develop version is available! (Click here for more info.)</div>
                            
                        <div class="ui white-text center-text menu-quote"> Current Version: {{version}}</div>
                        <div class="ui white-text center-text menu-quote"> Current Build: {{build}}</div>    
                    </div>  
                
                </div>

                <div *ngIf="showMenu" class="ui visible inverted left vertical sidebar menu phoneContent">
                
                    <div class="ui white-text center-text margin-top-2 menu-quote"> It Takes an Idiot to do something Cool </div>
                    <div class="ui horizontal divider white-text"> LittleWeeb - {{version}}  </div>
                    <div *ngFor="let menuItem of menuItems">
                        <a class="item" routerLink="{{menuItem.view}}" routerLinkActive="active" (click)="openCloseMenu()">
                            <i class="{{menuItem.icon}} icon "></i> {{menuItem.title}}
                        </a>
                    </div>      

                    <div style="bottom: 10px; !important">
                        <div (click)="showReleaseUpdate()" class="custom-notification" *ngIf="newRelease.update_available"> <i class="bell icon"></i>A new Release version is available! (Click here for more info.)</div>
                        <div (click)="showDevelopUpdate()" class="custom-notification" *ngIf="newDevelop.update_available"> <i class="bell icon"></i>A new Develop version is available! (Click here for more info.)</div>
                            
                        <div class="ui white-text center-text menu-quote"> Current Version: {{version}}</div>
                        <div class="ui white-text center-text menu-quote"> Current Build: {{build}}</div>    
                    </div>   
                </div>

                
                <div class="pusher overflow-y-scrollable pusher-extra max-height-size-depended" (click)="closeMenu()">
                    <router-outlet class="overflow-y-scrollable height-100"></router-outlet>
                </div>
            </div>
            
            <loader></loader>
            <modal></modal>
            <filedialog></filedialog>
            <toaster style="position: fixed;"></toaster>
    
 
  `
})
export class AppComponent  { 

    menuItems : menuItemToAdd[];
    menuItemToAdd : menuItemToAdd;
    someFunctionToCall : Function;
    showMenu : boolean;
    version : string;
    build : string;
    newDevelop : any = { update_available : false };
    newRelease : any= { update_available : false };
    /**
     * Creates an instance of AppComponent.
     * @param {ShareService} shareService (for sending and receiving information to and from other Components & Services)
     * @param {VersionService} versionService (for checking the local version to the github version)
     * @param {BackEndService} backEndService (for sending and receiving messages to the backend)
     * @param {ActivatedRoute} router (for redirecing and routeroutlet)
     * @memberof AppComponent
     */
    constructor( private routing: Router, private shareService: ShareService, private versionService: VersionService, private backEndService: BackEndService, private router: ActivatedRoute){
        this.version = versionService.currentVersion;
        this.showMenu = false;
        this.consoleWrite("Menu Succesfully Loaded!");
        this.menuItems = [];
        this.menuItemToAdd = {
            title: 'Currently Airing',
            icon: 'add to calendar',
            view : 'currentlyairing'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Search',
            icon: 'search',
            view : 'search'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Favorites',
            icon: 'favorite',
            view : 'favorites'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Choose Anime',
            icon: 'film',
            view : 'animeinfo'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Downloads',
            icon: 'download',
            view : 'downloads'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Settings',
            icon: 'settings',
            view : 'settings'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'About',
            icon: 'info',
            view : 'about'
        }
        this.menuItems.push(this.menuItemToAdd);
    }

    /**
     * Gets the ip used by the browser (defaults to 127.0.0.1)
     * Initiates communication with backend using ip,
     * Checks version
     * Gets favorite anime count
     * 
     * @memberof AppComponent
     */
    async ngOnInit(){

        var base = window.location.origin.split('://')[1].split('/')[0];
        if(base.indexOf(':') > -1){
            base = base.split(':')[0];
        }
        base = base + ":1515";

        this.shareService.storeDataLocal('backEndConnectionAddress', "ws://" + base);

        this.backEndService.tryConnecting();

        

     
        this.shareService.getFavoritAnimeCount();

        this.backEndService.websocketMessages.subscribe(message=>{
            if(message != null){
                if(message.type == "free_space"){
                    let minfreespacestr = this.shareService.getDataLocal("minfreespace");
                    let minfreespace = 0;
                    if(minfreespacestr == false){
                        this.shareService.storeDataLocal("minfreespace", "500");
                        minfreespace = 500;
                    } else {
                        minfreespace = Number(minfreespacestr);
                    }
                    if(message.freespacembytes <= minfreespace){
                        this.shareService.showModal("Running out of Storage Space :(.", `It seems that your device is running out of space. 
                        LittleWeeb can't download when there is not enough space to store an episode. 
                        To resolve this issue, please remove something (be it a downloaded episode or another file). 
                        You currently have ` + message.freespacembytes + ` MB left, but you need atleast ` +  minfreespacestr +
                        `MB for LittleWeeb to be functional. You can change the minimum required space within the Settings.`,
                         "folder open", 
                        `<div class="ui red basic cancel inverted button">
                            Ignore.
                        </div>
                        <a href="/downloads" class="ui green ok inverted button">                       
                            Go to Downloads.
                        </a>`);
                    }
                }

                if(message.type == "version_update"){
                    this.build = message.currentbuild;
                    this.version = message.currentversion;
                    if(message.newversion != "Not Found"){
                        if(message.release_version == "master"){
                            this.newRelease = message;
                        } else if(message.release_version == "develop"){
                            console.log(message);
                            this.newDevelop = message;
                        }
                    }
                }

            }
        })
            
        
        this.shareService.downloadamount.subscribe(amount=>{
            if(amount != null){
                if(amount == 0){                    
                    this.menuItems[4] = {
                        title: 'Downloads',
                        icon: 'download',
                        view : 'downloads'
                    };
                } else {

                    this.menuItems[4] = {
                        title: 'Downloads - ' + amount,
                        icon: 'download',
                        view : 'downloads'
                    };
                }
            }
            
        });

        this.shareService.updatetitle.subscribe((animetitle) => {
            if(animetitle !== null){
                this.consoleWrite("current anime title:");
                this.consoleWrite(animetitle);
                try{
                    this.menuItems[3] =  {
                        title: animetitle,
                        icon: 'film',
                        view : 'animeinfo'
                    };
                } catch(e){
                    this.menuItems[3] =  {
                        title: 'Choose Anime',
                        icon: 'film',
                        view : 'animeinfo'
                    };
                }
               
            }

        }); 
        

        this.shareService.searchQuery.subscribe((search) => {
            this.consoleWrite("animetitle did execute in menu");
            if(search !== undefined && search != null){
                try{

                    this.menuItems[1] =  {
                        title: "Current Search: " + search,
                        icon: 'search',
                        view : 'search'
                    };
                } catch(e){
                    this.menuItems[1] =  {
                        title: "Search",
                        icon: 'search',
                        view : 'search'
                    };
                }
            }

        }); 

        this.shareService.favoriteamount.subscribe(amount=>{
            if(amount != null){
                if(amount == 0){                    
                    this.menuItems[2] = {
                        title: 'Favorites',
                        icon: 'favorite',
                        view : 'favorites'
                    };
                } else {

                    this.menuItems[2] = {
                        title: 'Favorites - ' + amount,
                        icon: 'favorite',
                        view : 'favorites'
                    };
                }
            }
            
        });
    }

    
    showReleaseUpdate(){
        this.shareService.showModal("There is a new version available!", "Your current version is v" + this.newRelease.currentversion +
            ", build: " + this.newRelease.currentbuild + " , but version " + this.newRelease.newversion + ", build: " + this.newRelease.newbuild + " has arrived!", 
            "feed", 
            `<div class="ui red basic cancel inverted button">
            <i class="remove icon"></i>
            Not interested.
            </div>
            <a href="` + this.newRelease.direct_download_url +`" class="ui green ok inverted button">
            <i class="checkmark icon"></i>
            Download
            </a>
            <a  target="_blank" href="` + this.newRelease.release_url +`" class="ui green ok inverted button">
            <i class="checkmark icon"></i>
            Go to github.
            </a>`);
    }

    showDevelopUpdate(){
        this.shareService.showModal("There is a new version available!", "Your current version is v" + this.newDevelop.currentversion +
        ", build: " + this.newDevelop.currentbuild + " , but version " + this.newDevelop.newversion + ", build: " + this.newDevelop.newbuild + " has arrived!", 
        "feed", 
        `<div class="ui red basic cancel inverted button">
        <i class="remove icon"></i>
        Not interested.
        </div>
        <a href="` + this.newDevelop.direct_download_url +`" class="ui green ok inverted button">
        <i class="checkmark icon"></i>
        Download
        </a>
        <a target="_blank" href="` + this.newDevelop.release_url +`" class="ui green ok inverted button">
        <i class="checkmark icon"></i>
        Go to github.
        </a>`);
    }

    /**
     * In case of mobile, side menu is opened and closed through a button
     * This toggles side menu.
     * @memberof AppComponent
     */
    openCloseMenu(){
        if(this.showMenu){
            this.showMenu = false;
        } else {
            this.showMenu = true;
        }
    }

    /**
     * Opens side menu
     * 
     * @memberof AppComponent
     */
    openMenu(){
        this.showMenu = true;
    }

    /**
     * Closes side menu
     * 
     * @memberof AppComponent
     */
    closeMenu(){
        this.showMenu = false;
    }

    
    async consoleWrite(log: any){
        if(this.shareService.enableConsoleLog){
            console.log(log);
        }
    }
}

/**
 * Menu items.
 * 
 * @interface menuItemToAdd
 */
interface menuItemToAdd {
    title: string;
    icon : string;
    view : string;
}
