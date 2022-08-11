import {Worker} from '../src';
import assert from "assert";

let script = `define("index", ["require", "exports", "bignumber.js"], function (require, exports, bignumber) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Worker {             
        async process(session, data) {
            let BigNumber = bignumber.BigNumber;  
            return new BigNumber(data.v1).plus(data.v2).toNumber();
        }
    }
    exports.default = Worker;
});
`;

describe('Worker', function() {    
    it('Process', async function(){
        let worker = new Worker({
            script: script, 
            dependencies:{
                'bignumber.js': {}
            }
        })        
        let result = await worker.process({v1: 1, v2: 2});
        assert.strictEqual(result, 3);
    })
})