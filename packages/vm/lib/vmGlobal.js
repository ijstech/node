"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function loadModule(vm) {
    vm.injectGlobalFunction('sleep', sleep);
    vm.injectGlobalScript(`global.setTimeout = async (callback, timeout)=>{
        let result = await sleep(timeout);        
        callback();
    };`);
}
exports.default = loadModule;
function sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, timeout);
    });
}
