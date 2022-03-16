import {Worker} from '../src';
import Types from '@ijstech/types';
import assert from "assert";

let script = `define("index", ["require", "exports", "bignumber.js"], function (require, exports, bignumber) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {             
        async process(session, data) {
            let BigNumber = bignumber.BigNumber;  
            return new BigNumber('123').toNumber();
        }
    }
    exports.default = Worker;
});
`
let opt = Types.IWorkerPlugin;
describe('Worker', function() {    
    it('Process', async function(){
        let worker = new Worker({
            script: script, 
            dependencies:{
                'bignumber.js': {}
            }
        })        
        let result = await worker.process();
        assert.strictEqual(result, 123);
    })
})