"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function loadModule(vm) {
    return vm.injectGlobalObject('console', vmConsole(vm));
}
exports.default = loadModule;
;
function vmConsole(vm) {
    return {
        log: function (...args) {
            try {
                if (Array.isArray(args))
                    console.log.apply(null, args);
                else
                    console.log(args);
            }
            catch (err) {
                console.dir(err);
            }
        },
        dir: function (args) {
            try {
                console.dir(args);
            }
            catch (err) { }
            ;
        }
    };
}
;
