import {Compiler} from '../src';
import assert from "assert";
import Path from 'path';
import {promises as Fs} from 'fs';

async function getFile(filePath: string): Promise<string>{
    return await Fs.readFile(Path.resolve(__dirname, filePath), 'utf8');
}
describe('Compiler', function() {     
    it ('Import Package', async function(){
        let compiler = new Compiler();
        let script = await getFile('packages/pack1/index.ts');
        await compiler.addFileContent('index.ts', script, '@ijs/pack1');
        let pack = await compiler.compile(true);
        assert.strictEqual(pack.script.startsWith('define("@ijs/pack1"'), true);

        compiler.reset();
        await compiler.addFileContent('index.ts', `
            import * as pack1 from '@ijs/pack1';
            pack1.test();
        `, '', async function(fileName: string): Promise<{fileName: string, script: string, dts?: string}|null>{
            return {
                fileName: '@ijs/pack1/index.d.ts',
                script: pack.script,
                dts: pack.dts
            };
        });
        let result = await compiler.compile(false);
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(result.errors.length, 0);
    });
    it("Import Files", async function(){
        let compiler = new Compiler();
        await compiler.addPackage('bignumber.js');
        await compiler.addFileContent('index.ts', `
            import {test} from './lib/demo';
            export {test}
            test();
        `, '@ijs/pack123', async function(fileName: string): Promise<{fileName: string, script: string}|null>{
            return {
                fileName: 'lib/demo.ts',
                script: `
import {BigNumber} from 'bignumber.js';
export function test(): number{
    let result = new BigNumber('123')
    return result.toNumber();
}`
            };
        });
        let result = await compiler.compile(false);
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(result.errors.length, 0);
    });
    it("compile", async function(){
        let compiler = new Compiler();
        compiler.addFileContent('index.ts', `
            import * as Demo from './lib/demo';
            Demo.test();
        `)
        compiler.addFileContent('lib/demo.ts', `
            export function test(): number{
                return 1
            }
        `)
        let result = await compiler.compile(false);
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(result.dts, '');
        assert.strictEqual(result.errors.length, 0);
    });
    it("import JSON", async function(){
        let compiler = new Compiler();
        compiler.addFileContent('index.ts', `
            import Demo from './demo.json';
            let value = Demo.value;
        `);
        compiler.addFileContent('demo.json.ts', `export default
            {
                value: true
            }
        `);
        let result = await compiler.compile(true); 
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(typeof(result.dts), 'string');
        assert.strictEqual(result.errors.length, 0);
    });
    it("Add Package", async function(){
        let compiler = new Compiler();
        compiler.addFileContent('index.ts', `
            import {BigNumber} from 'bignumber.js';
            let n = new BigNumber(123);
            console.dir(n);
        `);
        await compiler.addPackage('bignumber.js');
        let result = await compiler.compile(true);      
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(typeof(result.dts), 'string');
        assert.strictEqual(result.errors.length, 0);
    });
    it("Add Directory", async function(){
        let path = Path.join(__dirname, 'samples');        
        let compiler = new Compiler();
        let files = await compiler.addDirectory(path);
        await compiler.addPackage('bignumber.js');
        let result = await compiler.compile(true);
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(typeof(result.dts), 'string');
        assert.strictEqual(result.errors.length, 0);
    });    
})