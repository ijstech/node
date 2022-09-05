import {Router, Worker, RouterRequest, RouterResponse} from '../src';
import assert from "assert";
import {PackageManager, IPackage} from '@ijstech/package';
import Path from 'path';

describe('Plugins', function() {    
    it('Worker Plugin', async function(){              
        let manager = new PackageManager();        
        manager.packageImporter = async (packName: string): Promise<IPackage>=>{
            if (packName == '@ijs/pack1')
                return manager.addPackage(Path.join(__dirname, 'packs/pack1'))
        };        
        let workerPack = await manager.addPackage(Path.join(__dirname, 'packs/worker'))        
        let script = await manager.getScript(workerPack.name);                
        let worker = new Worker({
            script: script.script,
            dependencies: script.dependencies
        });        
        let result = await worker.process({v1:1,v2:2});                
        assert.deepStrictEqual(result, {test: 'pack1 test result', value:3});        
        result = await worker.process({v1:1,v2:3});        
        assert.deepStrictEqual(result, {test: 'pack1 test result', value:4});        

        script = await manager.getScript(workerPack.name, 'test.ts');
        worker = new Worker({
            script: script.script,
            dependencies: script.dependencies
        });
        result = await worker.process();
        assert.deepStrictEqual(result, {test: 'test1'});        
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
    })
})