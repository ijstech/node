import 'mocha';
import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import {PluginScript} from '@ijstech/tsc';
import Path from 'path';
import * as assert from 'assert';

let WorkerConfig: IWorkerPluginOptions = {
    scriptPath: Path.resolve(__dirname, './worker.ts'),
    plugins: {},
    dependencies:{
        "@ijstech/crypto": {}
    }
};

describe('Wallet', function(){
    let hash: any;
    it('Hash Password', async function(){        
        let worker = new Worker(WorkerConfig);
        hash = await worker.process({password: '123'});
        assert.strictEqual(typeof(hash.hash), 'string');
    });
    it('Verify Password', async function(){
        let worker = new Worker(WorkerConfig);
        let result = await worker.process({password: '123', hash: hash});
        assert.strictEqual(result, true);
    });
    it('Random UUID', async function(){
        let worker = new Worker(WorkerConfig);
        let result = await worker.process({uuid: true});
        assert.strictEqual(typeof(result), 'string');
        assert.strictEqual(result.length, 36);
    })
})
