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
const Rx_1 = require("rxjs/Rx");
require("rxjs/add/observable/of"); //proper way to import the 'of' operator
require("rxjs/add/operator/share");
require("rxjs/add/operator/map");
let BackEndService = class BackEndService {
    constructor(http) {
        this.http = http;
        this.websocketMessages = new Rx_1.BehaviorSubject(null);
        this.websocketConnected = new Rx_1.BehaviorSubject(null);
        console.log("Initiated backend!");
        this.http.get('http://localhost:6010/whatsyourip').map(res => res.text()).subscribe((result) => {
            this.websocket = new WebSocket("ws://" + result + ":600");
            console.log(result);
            this.websocket.onopen = (evt) => {
                this.websocketConnected.next(evt);
            };
            this.websocket.onmessage = (evt) => {
                this.websocketMessages.next(evt.data);
            };
        });
    }
    sendMessage(message) {
        try {
            this.websocket.send(message);
        }
        catch (Ex) {
            console.log("Cannot send message, websocket hasn't been opened yet: ");
            console.log(Ex);
        }
    }
};
BackEndService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], BackEndService);
exports.BackEndService = BackEndService;
//# sourceMappingURL=backend.service.js.map