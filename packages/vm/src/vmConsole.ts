import {IVM} from './types';

export default function loadModule(vm: IVM){
    return vm.injectGlobalObject('console', vmConsole(vm));//

    vm.injectGlobalObject('_$$console', vmConsole(vm), `    
    let console = referenceToObject(global._$$console);
    delete global._$$console;
    global.console = {
        log: function(...args){   
            console.log(JSON.stringify(args));
        },
        dir: function(...args){
            console.dir(JSON.stringify(args));
        }
    }; 
    `)
}
function vmConsole(vm: IVM){    
    return {
        log: function(args: any) {            
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