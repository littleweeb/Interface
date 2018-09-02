import { Pipe, PipeTransform } from '@angular/core';

/**
 * (PIPE) keys 
 * Allows for reading keys of json object using ngFor within a html template
 * 
 * @export
 * @class KeysPipe
 * @implements {PipeTransform}
 */
@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform
{
    transform(value:any, args:string[]): any {
        let keys:any[] = [];
        for (let key in value) {
            keys.push({key: key, value: value[key]});
        }
        return keys;
    }
}