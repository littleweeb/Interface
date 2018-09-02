"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
const nibl_service_1 = require("../../services/nibl.service");
const share_service_1 = require("../../services/share.service");
const utility_service_1 = require("../../services/utility.service");
const backend_service_1 = require("../../services/backend.service");
require("rxjs/add/observable/of"); //proper way to import the 'of' operator
require("rxjs/add/operator/share");
require("rxjs/add/operator/map");
let CurrentlyAiring = class CurrentlyAiring {
    constructor(niblService, shareService, utilityService, backendService, router) {
        this.niblService = niblService;
        this.shareService = shareService;
        this.utilityService = utilityService;
        this.backendService = backendService;
        this.router = router;
        this.currentlyAiringLoading = false;
        this.animeTitle = "Anime";
        this.showCurAir = true;
        this.showAnime = false;
        this.niblService.getCurrentlyAiringAnime().subscribe(json => {
            console.log(json);
            this.airingAnime = json.content;
            this.currentlyAiringLoading = true;
        });
    }
    ngOnInit() {
        //semantic-ui code for enabeling tab menu...
        $('.menu .item').tab();
        $.tab('change tab', 'third');
    }
    ngOnDestroy() {
        this.shareService.clearPackList();
        $.tab('change tab', 'third');
    }
    showPackListFor(anime) {
        var synonyms = [];
        if (anime.synonyms[0] != "") {
            synonyms = anime.synonyms;
        }
        synonyms.push(anime.title_english);
        synonyms.push(anime.title_romaji);
        this.animeTitle = anime.title_english;
        var animePacks = [{ id: "", botId: "", name: "" }];
        for (let synonym of synonyms) {
            synonym = this.utilityService.stripName(synonym);
            if (synonym.length > 0) {
                this.niblService.getSearchAnimeResults(synonym).subscribe(json => {
                    console.log(synonym);
                    if (json.length > 0) {
                        for (let pack of json) {
                            if (this.utilityService.compareNames(synonym, this.utilityService.stripName(pack.name)) > 50) {
                                var exists = false;
                                for (let temppack of animePacks) {
                                    if (temppack.id == pack.id && temppack.botId == pack.botId && temppack.name == pack.name) {
                                        exists = true;
                                        break;
                                    }
                                }
                                if (!exists) {
                                    animePacks.push(pack);
                                    if (animePacks[0].id == "") {
                                        animePacks.splice(0, 1);
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        this.waitForDataInterval = setInterval(() => {
            if (animePacks.length > 0) {
                console.log(animePacks);
                this.shareService.setPackList(animePacks);
                this.router.navigate(['/packlist']);
                // this.showAnime = true;
                // this.showCurAir = false;
                clearInterval(this.waitForDataInterval);
            }
            else {
                setTimeout(() => { clearInterval(this.waitForDataInterval); }, 1000);
            }
        }, 500);
    }
};
CurrentlyAiring = __decorate([
    core_1.Component({
        selector: 'currentlyairing',
        template: `
        <div class="ui top attached two item menu">
            <a class="item" data-tab="first" (click)="showCurAir = true; showAnime = false;">Currently Airing</a>
            <a class="item" data-tab="second" (click)="showCurAir = false; showAnime = true;">{{animeTitle}}</a>
        </div>
        <div *ngIf="showCurAir">
            <div class="step" [class.show]="currentlyAiringLoading" *ngIf="currentlyAiringLoading">
                <div class="ui horizontal divider"> Currently Airing </div>
                <div class="row">
                    <div class="ui items" id="currentlyAiringAnimes" *ngFor="let anime of airingAnime">
                        <div (click)="showPackListFor(anime)" class="item" *ngIf="anime.airing_status == 'currently airing'">
                            <div class="ui tiny image"> 
                                <img src="{{anime.image_url_med}}" /> 
                            </div>
                            <div class="middle aligned content">
                                <a class="header">{{anime.title_english}}</a>
                            </div>
                        </div> 
                        <div class="ui divider" *ngIf="anime.airing_status == 'currently airing'"> </div>
                    </div>
                </div>
            </div>
        </div>
        <div *ngIf="showAnime">
            <packlist></packlist>
        </div>
    `
    }),
    __metadata("design:paramtypes", [nibl_service_1.NiblService, share_service_1.ShareService, utility_service_1.UtilityService, backend_service_1.BackEndService, router_1.Router])
], CurrentlyAiring);
exports.CurrentlyAiring = CurrentlyAiring;
//# sourceMappingURL=currentlyairing.component.js.map