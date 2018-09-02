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
const Rx_1 = require("rxjs/Rx");
let ShareService = class ShareService {
    constructor() {
        this.packlistsub = new Rx_1.BehaviorSubject(null);
        this.newdownload = new Rx_1.BehaviorSubject(null);
        this.newdownloads = new Rx_1.BehaviorSubject(null);
        this.newdownloadlist = [];
    }
    setPackList(json) {
        var jsoncombined = JSON.stringify(json);
        this.packlistsub.next(JSON.stringify(jsoncombined));
    }
    clearPackList() {
        this.packlistsub.next();
    }
    appendNewDownload(json) {
        this.newdownload.next(JSON.stringify(json));
        this.newdownloadlist.push(json);
    }
    clearNewDownload() {
        this.newdownload.next();
    }
    appendNewDownloads(json) {
        this.newdownloads.next(JSON.stringify(json));
        for (let dl of json) {
            this.newdownloadlist.push(dl);
        }
    }
    clearNewDownloads() {
        this.newdownloads.next();
    }
    getAlreadyAddedDownloads() {
        return this.newdownloadlist;
    }
    removeFromAlreadyAddedDownloads(download) {
        var index = this.newdownloadlist.indexOf(download);
        if (index > -1) {
            this.newdownloadlist.splice(index, 1);
        }
    }
    removeFromAlreadyAddedDownloadsWithIndex(index) {
        if (index > -1) {
            this.newdownloadlist.splice(index, 1);
        }
    }
};
ShareService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], ShareService);
exports.ShareService = ShareService;
//# sourceMappingURL=share.service.js.map