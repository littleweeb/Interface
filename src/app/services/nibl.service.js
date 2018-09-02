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
const http_1 = require("@angular/http");
require("rxjs/add/observable/of"); //proper way to import the 'of' operator
require("rxjs/add/operator/share");
require("rxjs/add/operator/map");
let NiblService = class NiblService {
    constructor(http) {
        this.http = http;
        console.log("Nibl Service Initialiazed...");
        this.date = new Date();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
    }
    getCurrentlyAiringAnime() {
        var seasons = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"];
        var currentSeason = seasons[this.month + 1];
        this.observable = this.http.get('https://api.nibl.co.uk:8080/anilist/series/season?year=' + this.year + '&season=' + currentSeason).map(res => {
            this.observable = null;
            this.currentlyAiring = res.json();
            return this.currentlyAiring;
        }).share();
        return this.observable;
    }
    getSearchAnimeResults(query) {
        this.observable = this.http.get('https://api.nibl.co.uk:8080/nibl/search/?query=' + query + '&episodeNumber=-1').map(res => {
            this.observable = null;
            this.searchResult = res.json().content;
            return this.searchResult;
        }).share();
        return this.observable;
    }
    getBotList() {
        this.observable = this.http.get('https://api.nibl.co.uk:8080/nibl/bots').map(res => {
            this.observable = null;
            this.botList = res.json().content;
            return this.botList;
        }).share();
        return this.observable;
    }
    getLatestPack() {
        this.observable = this.http.get('https://api.nibl.co.uk:8080/nibl/latest?size=100').map(res => {
            this.observable = null;
            this.latestPacks = res.json().content;
            return this.latestPacks;
        }).share();
        return this.observable;
    }
    getPacksForBot(id) {
        this.observable = this.http.get('https://api.nibl.co.uk:8080/nibl/bots/' + id).map(res => {
            this.observable = null;
            this.packsForBot = res.json().content.packList;
            return this.packsForBot;
        }).share();
        return this.observable;
    }
};
NiblService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], NiblService);
exports.NiblService = NiblService;
//# sourceMappingURL=nibl.service.js.map