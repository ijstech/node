import {Compiler} from '../src';
import assert from "assert";
import Path from 'path';

describe('Compiler', function() {    
    it("Dependencies Importer", async function(){
        let compiler = new Compiler();
        await compiler.addPackage('bignumber.js');
        await compiler.addFileContent('index.ts', `
            import * as Demo from './lib/demo';
            Demo.test();
        `, async function(fileName: string): Promise<{fileName: string, content: string}|null>{
            return {
                fileName: 'lib/demo.ts',
                content: `
import {BigNumber} from 'bignumber.js';
export function test(): number{
    let result = new BigNumber('123')
    return result.toNumber();
}`
            };
        });
        let result = await compiler.compile(false);
        assert.strictEqual(typeof(result.script), 'string');
        assert.deepStrictEqual(result.dts, {});
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
        assert.deepStrictEqual(result.dts, {});
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
        assert.strictEqual(typeof(result.dts['index.d.ts']), 'string');
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
        assert.strictEqual(typeof(result.dts['index.d.ts']), 'string');
        assert.strictEqual(result.errors.length, 0);
    });
    it("Add Directory", async function(){
        let path = Path.join(__dirname, 'samples');        
        let compiler = new Compiler();
        let files = await compiler.addDirectory(path);
        await compiler.addPackage('bignumber.js');
        let result = await compiler.compile(true);
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(typeof(result.dts['index.d.ts']), 'string');
        assert.strictEqual(result.errors.length, 0);
    });    
})