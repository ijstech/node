"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadModule(vm) {
    return vm.injectGlobalObject('console', vmConsole(vm));
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
    `);
}
exports.default = loadModule;
function vmConsole(vm) {
    return {
        log: function (args) {
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
