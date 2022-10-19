import assert from 'assert';
import { PackageManager, Package } from '@ijstech/package';
import {Worker} from '@ijstech/plugin';
import Path from 'path';

describe('Fetch Plugin', async function () {
    let packageManager = new PackageManager();
    let pack: Package; 
    before(async()=>{
        pack = await packageManager.addPackage(Path.join(__dirname,'worker'));    
    });
    it('GET', async function () {
        let script = await pack.getScript('index.ts');
        let worker = new Worker({
             script: script.script,
             plugins: {
                fetch: {
                    methods: ['GET']
                }
             }
        });
        let result = await worker.process();
        console.dir(result)
        assert.strictEqual(result.status, 200)
    });
}) 