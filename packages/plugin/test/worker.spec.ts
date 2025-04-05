import {Worker} from '../src';
// import {PluginScript} from '@ijstech/tsc'
import Path from 'path';
import assert from "assert";

describe('Worker', function() {    
    this.timeout(60000);
    it('Worker Plugin', async function(){      
        let workerPath = Path.join(__dirname, 'packs/worker/index.ts');
        // let content = await PluginScript({scriptPath: workerPath});
        let worker = new Worker({
            // script: content.script,
            scriptPath: workerPath
        });

        let result = await worker.process({v1:1,v2:2}, '');
        assert.strictEqual(result?.retryCount, 2);
    });
});