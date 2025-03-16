"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loadModule;
function loadModule(vm) {
    vm.injectGlobalFunction('sleep', sleep);
    vm.injectGlobalScript(`global.setTimeout = async (callback, timeout)=>{
        let result = await sleep(timeout);        
        callback();
    };`);
}
function sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, timeout);
    });
}
