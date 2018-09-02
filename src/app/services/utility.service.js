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
let UtilityService = class UtilityService {
    constructor() {
    }
    compareNames(str1, str2) {
        str1 = this.stripName(str1);
        str2 = this.stripName(str2);
        var str1L = str1.length;
        var str2L = str2.length;
        var equal = 0;
        if (str1L > str2L) {
            for (var x = 0; x < str2L; x++) {
                var charstr1 = str1.charAt(x);
                var charstr2 = str2.charAt(x);
                if (charstr1 == charstr2) {
                    equal++;
                }
            }
            var oneprocent = str1L / 100;
            var percentageEqual = equal / oneprocent;
            return percentageEqual;
        }
        else {
            for (var x = 0; x < str1L; x++) {
                var charstr1 = str1.charAt(x);
                var charstr2 = str2.charAt(x);
                if (charstr1 == charstr2) {
                    equal++;
                }
            }
            var oneprocent = str2L / 100;
            var percentageEqual = equal / oneprocent;
            return percentageEqual;
        }
    }
    stripName(input) {
        try {
            if (input.indexOf('.') > -1) {
                input = input.split('.')[0];
            }
        }
        catch (e) {
        }
        try {
            while (input.indexOf('[') > -1) {
                if (input.indexOf('[') > -1) {
                    if (input.indexOf(']') > -1) {
                        input = input.split('[')[0] + input.split(']')[1];
                    }
                    else {
                        input = input.split('[')[0] + input.split('[')[1];
                    }
                }
            }
        }
        catch (e) {
        }
        try {
            while (input.indexOf('(') > -1) {
                if (input.indexOf('(') > -1) {
                    if (input.indexOf(')') > -1) {
                        input = input.split('(')[0] + input.split(')')[1];
                    }
                    else {
                        input = input.split('(')[0] + input.split('(')[1];
                    }
                }
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("S0") > -1) {
                try {
                    input = input.split("S0")[0] + input.split("S0")[1].substring(2);
                }
                catch (e) {
                    try {
                        input = input.split("S0")[0] + input.split("S0")[1].substring(1);
                    }
                    catch (e) {
                        input = input.split("S0")[0] + input.split("S0")[1];
                    }
                }
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("E0") > -1) {
                try {
                    input = input.split("E0")[0] + input.split("E0")[1].substring(2);
                }
                catch (e) {
                    try {
                        input = input.split("E0")[0] + input.split("E0")[1].substring(1);
                    }
                    catch (e) {
                        input = input.split("E0")[0] + input.split("E0")[1];
                    }
                }
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("0") > -1) {
                try {
                    input = input.split("0")[0] + input.split("0")[1].substring(2);
                }
                catch (e) {
                    try {
                        input = input.split("0")[0] + input.split("0")[1].substring(1);
                    }
                    catch (e) {
                        input = input.split("0")[0] + input.split("0")[1];
                    }
                }
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("1080") > -1) {
                input = input.split("1080")[0] + input.split("1080")[1].substring(1);
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("720") > -1) {
                input = input.split("720")[0] + input.split("720")[1].substring(1);
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("480") > -1) {
                input = input.split("480")[0] + input.split("480")[1].substring(1);
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("3D") > -1) {
                input = input.split("3D")[0] + input.split("3D")[1];
            }
        }
        catch (e) { }
        try {
            if (input.indexOf("BD") > -1) {
                input = input.split("BD")[0] + input.split("BD")[1];
            }
        }
        catch (e) { }
        try {
            var numberInString = parseInt(input.replace(/^\D+/g, ''));
            while (numberInString > 9) {
                numberInString = parseInt(input.replace(/^\D+/g, ''));
                if (numberInString > 9) {
                    if (input.indexOf(numberInString.toString()) > -1) {
                        input = input.split(numberInString.toString())[0] + input.split(numberInString.toString())[1];
                    }
                }
            }
        }
        catch (e) { }
        try {
            input = input.replace(/[^\w\s]/gi, ' ').toLowerCase();
            input = input.split('_').join(' ').trim();
            input = input.replace(/ +(?= )/g, '');
        }
        catch (e) { }
        return input;
    }
    generateId(str1, str2) {
        var text = "";
        var possible = str1 + str2;
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
};
UtilityService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], UtilityService);
exports.UtilityService = UtilityService;
//# sourceMappingURL=utility.service.js.map