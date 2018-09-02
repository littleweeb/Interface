import {Injectable} from '@angular/core';
declare var $:any;
/**
 * (SERVICE) SemanticService
 * This service allows for controlling semantic ui related events that need jQuery
 * 
 * @export
 * @class SemanticService
 */
@Injectable()
export class SemanticService {
  
    constructor(){
        
    }   
    
    /**
     * Enables a dropdown element
     * 
     * @memberof SemanticService
     */
    enableDropDown(){
        setTimeout(()=>{
            $('.ui.dropdown').dropdown();
        }, 1);
    }

    /**
     * Enables accordion element
     * 
     * @memberof SemanticService
     */
    enableAccordion(){
        setTimeout(()=>{
            $('.ui.accordion').accordion({exclusive: false});
        }, 1);
    }

    /**
     * Opens an accordion element at specific index
     * 
     * @param {number} index (accordion index to open)
     * @memberof SemanticService
     */
    openAccordion(index:number){
        setTimeout(()=>{
            $('.ui.accordion').accordion('open', index);
        }, 1);
    }

    /**
     * Close an accordion element at specific index
     * 
     * @param {number} index (accordion index to close)
     * @memberof SemanticService
     */
    closeAccordion(index:number){
        setTimeout(()=>{
            $('.ui.accordion').accordion('close', index);
        }, 1);
    }

    /**
     * updates a progressbar element
     * 
     * @param {string} progressbar (progressbar element id)
     * @param {string} progress (progress number as a string)
     * @memberof SemanticService
     */
    updateProgress(progressbar: string, progress: string){
        setTimeout(()=>{
            $(progressbar).progress({
                percent: progress
            });
        }, 1);
    }

    /**
     * Hides a element
     * 
     * @param {string} object (id of element)
     * @memberof SemanticService
     */
    hideObject(object: string){
        $(object).dimmer('hide');
    }

    /**
     * Shows a element
     * 
     * @param {string} object (id of element)
     * @memberof SemanticService
     */
    showObject(object: string){
        $(object).dimmer('show');
    }

    /**
     * Hides a modal
     * 
     * @param {string} modal (id of modal element)
     * @memberof SemanticService
     */
    hideModal(modal :string){
        $(modal).modal('hide');
    }

    /**
     * Shows a modal
     * 
     * @param {string} modal (id of modal element)
     * @memberof SemanticService
     */
    showModal(modal:string){
        $(modal).modal('show');
    }

    /**
     * Checks if a modal has already been opened
     * 
     * @param {string} modal (id of modal element)
     * @returns {boolean} (returns a boolean (true in case it's opened))
     * @memberof SemanticService
     */
    isModalOpen(modal:string){
        if ($(modal + ".visible").length > 0) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * Activate a pop up on an element
     * 
     * @param {string} element (element id to activate pop-up on)
     * @memberof SemanticService
     */
    activatePopUp(element : string){
       $(element).popup({
            on: 'hover'
        });
    }

}