"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const core_1 = require("@angular/core");
const platform_browser_1 = require("@angular/platform-browser");
const forms_1 = require("@angular/forms");
const http_1 = require("@angular/http");
const router_1 = require("@angular/router");
const common_1 = require("@angular/common");
//main components
const app_component_1 = require("./app.component");
//body components
const menu_component_1 = require("./components/menu.component");
//view components
const currentlyairing_component_1 = require("./components/views/currentlyairing.component");
const latestpack_component_1 = require("./components/views/latestpack.component");
const search_component_1 = require("./components/views/search.component");
const botlist_component_1 = require("./components/views/botlist.component");
const downloads_component_1 = require("./components/views/downloads.component");
const settings_component_1 = require("./components/views/settings.component");
const about_component_1 = require("./components/views/about.component");
const packlist_component_1 = require("./components/views/packlist.component");
//services
const nibl_service_1 = require("./services/nibl.service");
const share_service_1 = require("./services/share.service");
const utility_service_1 = require("./services/utility.service");
const backend_service_1 = require("./services/backend.service");
//view routes
const appRoutes = [
    {
        path: 'currentlyairing',
        component: currentlyairing_component_1.CurrentlyAiring,
        data: { title: 'Currently Airing' }
    },
    {
        path: 'latestpack',
        component: latestpack_component_1.LatestPack,
        data: { title: 'Latest XDCC Pack' }
    },
    {
        path: 'search',
        component: search_component_1.Search,
        data: { title: 'Search' }
    },
    {
        path: 'botlist',
        component: botlist_component_1.BotList,
        data: { title: 'Bot List' }
    },
    {
        path: 'downloads',
        component: downloads_component_1.Downloads,
        data: { title: 'Downloads' }
    },
    {
        path: 'settings',
        component: settings_component_1.Settings,
        data: { title: 'Settings' }
    },
    {
        path: 'about',
        component: about_component_1.About,
        data: { title: 'About' }
    },
    {
        path: 'packlist',
        component: packlist_component_1.PackList,
        data: { title: 'Pack List' }
    },
    { path: '',
        redirectTo: 'currentlyairing',
        pathMatch: 'full'
    }
];
let AppModule = class AppModule {
};
AppModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, router_1.RouterModule.forRoot(appRoutes, { enableTracing: true }), forms_1.FormsModule, http_1.HttpModule, common_1.CommonModule],
        declarations: [app_component_1.AppComponent, menu_component_1.MenuComponent, currentlyairing_component_1.CurrentlyAiring, latestpack_component_1.LatestPack, search_component_1.Search, botlist_component_1.BotList, downloads_component_1.Downloads, settings_component_1.Settings, about_component_1.About, packlist_component_1.PackList],
        bootstrap: [app_component_1.AppComponent],
        providers: [nibl_service_1.NiblService, utility_service_1.UtilityService, share_service_1.ShareService, backend_service_1.BackEndService]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map