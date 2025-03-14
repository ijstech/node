/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {IVM} from './types';

export default function loadModule(vm: IVM){
    vm.injectGlobalFunction('sleep', sleep);
    vm.injectGlobalScript(`global.setTimeout = async (callback, timeout)=>{
        let result = await sleep(timeout);        
        callback();
    };`);
}
function sleep(timeout: number){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve(true);
        }, timeout)
    })
}