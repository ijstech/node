import assert from "assert";
import {Package, PackageManager} from '../src/index';
import Path from 'path';

describe('Package Manager', function() {    
    it('get package script', async function(){
        let manager = new PackageManager();        
        manager.packageImporter = (packageName: string):Promise<Package>=>{
            if (packageName == 'pack1')
                return manager.addPackage(Path.join(__dirname, './pack'))
        }        
        let pack = await manager.addPackage(Path.join(__dirname, './router'));        
        let result = await manager.getScript(pack.name);
        assert.strictEqual(typeof(result.dependencies['pack1'].script), 'string');
        assert.strictEqual(typeof(result.dependencies['pack1'].dts), 'string');
        assert.strictEqual(typeof(result.script), 'string');
        result = await manager.getScript(pack.name, 'test.ts');
        assert.strictEqual(typeof(result.dependencies['bignumber.js'].script), 'string');
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(typeof(result.dependencies['@ijstech/plugin'].dts), 'string');        
    })
})