import {Worker} from '../src';
import assert from "assert";
import {Compiler} from '@ijstech/tsc';
import {PluginCompiler} from '../src/compiler';
import Path from 'path';
import {promises as Fs} from 'fs';
import { stringify } from 'querystring';
async function getScript(rootPath: string, fileName: string): Promise<string>{
    try{
        let filePath = Path.resolve(__dirname, rootPath, fileName);
        return await Fs.readFile(filePath, 'utf8');
    }
    catch(err){}
};

async function packImporter(fileName: string, isPackage?: boolean): Promise<{fileName: string, script: string, dts?: string}>{
    if (isPackage){
        let compiler = new Compiler();
        let script = await getScript('packs/pack1', 'index.ts');
        await compiler.addFileContent('index.ts', script, fileName, packImporter);
        let result = await compiler.compile(true);
        return {
            fileName: fileName,
            script: result.script,
            dts: result.dts
        }
    }
    else{
        let script = await getScript('packs/pack1', fileName + '.ts');
        return {
            fileName: fileName + '.ts',
            script: script
        }
    }
};
describe('Plugins', function() {    
    it('Worker Plugin', async function(){              
        let compiler = await PluginCompiler.instance();
        let script = await getScript('scripts', 'worker.ts');                
        let packs:{fileName:string,script:string}[] = [];        
        await compiler.addFileContent('index.ts', script, '', async function(fileName: string, isPackage: boolean): Promise<any>{
            let pack = await packImporter(fileName, isPackage);
            packs.push(pack);
            return pack;
        });    
        
        let prog = await compiler.compile(false);           
        let deps = {
            'bignumber.js':{}
        };
        for (let i = 0; i < packs.length; i++){
            let pack = packs[i];
            deps[pack.fileName] = {script: pack.script};
        };
        let worker = new Worker({
            isolated: true,
            script: prog.script,
            dependencies: deps
        });
        let result = await worker.process({v1:1,v2:2});                
        assert.deepStrictEqual(result, {test: 'pack1 test result', value:3});        
        result = await worker.process({v1:1,v2:3});        
        assert.deepStrictEqual(result, {test: 'pack1 test result', value:4});        
    });    
    it('Router Plugin', async function(){              
        let compiler = await PluginCompiler.instance();
        let script = await getScript('scripts', 'router.ts');                
        let packs:{fileName:string,script:string}[] = [];
        await compiler.addFileContent('index.ts', script);        
        let prog = await compiler.compile(false);        
        assert.strictEqual(prog.errors.length, 0);
        assert.strictEqual(typeof(prog.script), 'string');
    })
})