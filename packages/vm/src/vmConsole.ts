/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {IVM} from './types';

export default function loadModule(vm: IVM){
    return vm.injectGlobalObject('console', vmConsole(vm));
};
function vmConsole(vm: IVM){    
    return {
        log: function(...args: any) {            
            try{
                if (Array.isArray(args))
                    console.log.apply(null, args) //JSON.parse(args));
                else
                    console.log(args);
            }
            catch(err){
                console.dir(err)
            }
        },
        dir: function(args: any) {    
            try{
                console.dir(args)
            }
            catch(err){};
        }
    };
};