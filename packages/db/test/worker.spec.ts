import {Worker, IRequiredPlugins} from '@ijstech/plugin';
import Path from 'path';
import assert from "assert";
import plugins from './data/config.js';

describe('Worker', function() {    
    this.timeout(60000);
    it('Worker Plugin', async function(){      
        let workerPath = Path.join(__dirname, 'workers/sysdate.ts');
        let worker = new Worker({
            scriptPath: workerPath,
            plugins: plugins
        });
        let result = await worker.process();
        let now = new Date();
        let dt = new Date(result[0].sysdate);
        assert.strictEqual(dt.toDateString(), now.toDateString());
    });
});