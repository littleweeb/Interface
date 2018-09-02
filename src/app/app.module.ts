import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

//main components
import { AppComponent }  from './app.component';


//view components
import { CurrentlyAiring } from './components/views/currentlyairing.component';
import { Search } from './components/views/search.component';
import { Downloads } from './components/views/downloads.component';
import { Settings } from './components/views/settings.component';
import { About } from './components/views/about.component';
import { AnimeInfo} from './components/views/animeinfo.component';
import { Favorites } from './components/views/favorites.component';

//extra components
import { Toaster } from './components/extras/toaster.component';
import { Loader} from './components/extras/loader.component';
import { Modal} from './components/extras/modal.component';
import { FileDialog } from './components/extras/filedialog.component';
//services
import {NiblService} from './services/nibl.service'
import {ShareService} from './services/share.service'
import {UtilityService} from './services/utility.service'
import {BackEndService} from './services/backend.service'
import {SemanticService} from './services/semanticui.service'
import {VersionService} from './services/versioncheck.service'
import {DownloadService} from './services/download.service'
import {KitsuService} from './services/kitsu.service'

//import pipes
import {SafePipe} from './pipes/safe.pipe'
import {KeysPipe} from './pipes/key.pipe'

//view routes
const appRoutes: Routes = [
  {
    path: 'currentlyairing',
    component: CurrentlyAiring,
    data: { title: 'Currently Airing' }
  }, 
  {
    path: 'search',
    component: Search,
    data: { title: 'Search' }
  },
  {
    path: 'favorites',
    component: Favorites,
    data: { title: 'Favorites' }
  },
  {
    path: 'downloads',
    component: Downloads,
    data: { title: 'Downloads' }
  },
  {
    path: 'settings',
    component: Settings,
    data: { title: 'Settings' }
  },
  {
    path: 'about',
    component: About,
    data: { title: 'About' }
  },
  {
    path: 'animeinfo',
    component: AnimeInfo,
    data: { title: 'Anime Info' }
  },
  { path: '',
    redirectTo: 'currentlyairing',
    pathMatch: 'full'
  }
];

@NgModule({
  imports:      [  BrowserModule,  RouterModule.forRoot(appRoutes, { enableTracing: true, useHash: true }), FormsModule, HttpModule, CommonModule, BrowserAnimationsModule, NoopAnimationsModule],
  declarations: [ AppComponent, CurrentlyAiring, Search, Favorites, Downloads, Settings, About, AnimeInfo,  Loader, Modal, FileDialog, Toaster, SafePipe, KeysPipe ],
  bootstrap:    [ AppComponent ],
  providers: [NiblService, UtilityService, ShareService, BackEndService, SemanticService, VersionService, DownloadService, KitsuService]
})
export class AppModule { }

