import {Worker} from '../src';
import Types from '@ijstech/types';
import assert from "assert";

let script = `define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {       
        async process(session, data) {
            return 123
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
        })        
        let result = await worker.process();
        assert.strictEqual(result, 123);
    })
})