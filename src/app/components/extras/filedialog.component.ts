import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'
import {KeysPipe} from '../../pipes/key.pipe';

/**
 * (EXTRA) FileDialog Component,
 * Used for showing a file dialog.
 * 
 * @export
 * @class FileDialog
 */
@Component({
    selector: 'filedialog',
    templateUrl: './html/filedialog.component.html',
    styleUrls: ['./css/filedialog.component.css']
})
export class FileDialog {
    directoryList : any[];
    currentDirectoryPathSelected : string;
    currentlyDirectoryPathViewing : string;
    showCreate : boolean;

    /**
     * Creates an instance of FileDialog.
     * @param {ShareService} shareService (used for receiving and sending information to or from other Components & Services)
     * @param {SemanticService} semanticService (used for controlling SemanticUI CSS Framework through jQuery)
     * @param {BackEndService} backEndService (used for sending and receiving messages to the back-end)
     * @memberof FileDialog
     */
    constructor(private shareService:ShareService, private semanticService:SemanticService, private backEndService:BackEndService){
        this.currentDirectoryPathSelected = "Drives";
        this.currentlyDirectoryPathViewing ="Drives";
        this.semanticService.hideModal('.ui.modal.filedialog');
        this.showCreate = false;
        this.shareService.showFileDialogEvent.subscribe(message=>{  
            if(message != null){               
                if(message){
                    
                    this.backEndService.sendMessage({"action" : "get_directories"});
                    this.semanticService.showModal('.ui.modal.filedialog');
                     
                } else {
                     this.semanticService.hideModal('.ui.modal.filedialog');
                }
            } 
        });
        this.directoryList = [];
        this.backEndService.websocketMessages.subscribe((message) =>{

            if(message.type == "directories"){
                this.directoryList = message.directories;
            }

        });
    }

    /**
     * Requests list with directories from the back-end
     * 
     * @param {string} path (Path to directory where it want's the list with directories from)
     * @memberof FileDialog
     */
    openDir(path : string){ 
         this.backEndService.sendMessage({"action" : "get_directories", "extra" : {"path" : path}});
         this.currentDirectoryPathSelected = path;
    }

    /**
     * Selects a directory to be used for downloads
     * 
     * @memberof FileDialog
     */
    selectDir(){
        this.currentDirectoryPathSelected.replace(/\\/g, '/');
        this.backEndService.sendMessage({"action" : "set_download_directory", "extra" : { "path" : this.currentDirectoryPathSelected}});
        this.shareService.storeDataLocal("baseDownloadDir",this.currentDirectoryPathSelected);
    }

    /**
     * Goes back a directory
     * 
     * @memberof FileDialog
     */
    goBackDir(){
        var currentDir = this.currentDirectoryPathSelected;
        var previousDirs = currentDir.split('\\');
        var previousDir = previousDirs[previousDirs.length - 2];

        if((previousDirs.length - 2) >= 0){            
            this.backEndService.sendMessage({"action" : "get_directories", "extra" : {"path" : previousDir}});
            this.currentDirectoryPathSelected = previousDir;
        } else {
            this.backEndService.sendMessage({"action" : "get_directories"});
            this.currentDirectoryPathSelected = "Drives";
        }
    }

    /**
     * Creates a directory
     * 
     * @param {string} path (Path to new directory) 
     * @memberof FileDialog
     */
    createDir(path : string){
        if(this.currentDirectoryPathSelected != "DRIVES" && this.currentlyDirectoryPathViewing != "DRIVES"){            
            this.backEndService.sendMessage({"action" : "create_directory", "extra" : {"path" : this.currentDirectoryPathSelected + "/" + path}});
            setTimeout(() => {            
                this.openDir(this.currentDirectoryPathSelected + "/" + path);
            }, 500);
        } else {
            this.shareService.showMessage("succes", "You cannot create a directory in the drives view!");
        }
    }
}