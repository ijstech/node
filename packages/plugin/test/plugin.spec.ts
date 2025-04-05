import {Router, Worker, RouterRequest, RouterResponse, LocalTaskManager} from '../src';
import assert from "assert";
import {PackageManager, Package} from '@ijstech/package';
import Path from 'path';
// const taskManager = new LocalTaskManager();

describe('Plugins', function() {    
    this.timeout(60000);
    it('Agent Plugin', async function(){              
        let manager = new PackageManager();        
         
        let workerPack = await manager.addPackage(Path.join(__dirname, 'packs/agent'))   
        let script = await manager.getScript(workerPack.name); 
        let worker = new Worker({
            plugins: {
                fetch: { methods: [ 'GET' ] }
            },
            // taskManager: taskManager,
            script: script.script
        });        
        let result = await worker.process({v1:1,v2:2}, 'wf2');
        assert.deepStrictEqual(result, {step1: true, step2: true, step3: true});
    });
    it('Router Plugin', async function(){              
        let manager = new PackageManager();       
        let pack = await manager.addPackage(Path.join(__dirname, 'packs/router'))
        let script = await manager.getScript(pack.name);
        let router = new Router({
            baseUrl: '',
            methods: ['GET'],
            script: script.script,
            dependencies: script.dependencies
        })
        let responseData = {};
        let response = RouterResponse(responseData);
        let request = RouterRequest({});
        await router.route(null, request, response);
        assert.deepStrictEqual(responseData, {statusCode: 200, contentType: 'application/json', body: 'hello' })        
    });
})