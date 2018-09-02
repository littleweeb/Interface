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
const nibl_service_1 = require("../../services/nibl.service");
const share_service_1 = require("../../services/share.service");
require("rxjs/add/observable/of"); //proper way to import the 'of' operator
require("rxjs/add/operator/share");
require("rxjs/add/operator/map");
let Search = class Search {
    constructor(niblService, shareService) {
        this.niblService = niblService;
        this.shareService = shareService;
        this.showPacks = false;
    }
    search(value) {
        console.log("searching for: " + value);
        this.niblService.getSearchAnimeResults(value).subscribe(json => {
            console.log(json);
            var animePacks = [{ number: "", botId: "", name: "" }];
            for (let pack of json) {
                animePacks.push({ number: pack.number, botId: pack.botId, name: pack.name });
            }
            animePacks.splice(0, 1);
            this.shareService.setPackList(animePacks);
            this.showPacks = true;
        });
    }
};
Search = __decorate([
    core_1.Component({
        selector: 'search',
        template: `
        <div class="row" style="width: 100%;">
            <div class="ui horizontal divider">SEARCH</div>
            <div class="ui icon input"  style="width: 100%;">
                <input #searchInput (keyup.enter)="search(searchInput.value)" class="prompt" type="text" placeholder="Search Anime">
                <i class="search icon"></i>
            </div>
        </div>
        <div *ngIf="showPacks">        
            <packlist></packlist>
        </div>
    `,
    }),
    __metadata("design:paramtypes", [nibl_service_1.NiblService, share_service_1.ShareService])
], Search);
exports.Search = Search;
//# sourceMappingURL=search.component.js.map