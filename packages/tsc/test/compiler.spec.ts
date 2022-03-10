import {Compiler} from '../src';
import assert from "assert";
import Path from 'path';

describe('Compiler', function() {    
    it("compile", function(){
        let compiler = new Compiler();
        compiler.addFile('index.ts', `
            import * as Demo from './lib/demo';
            Demo.test();
        `)
        compiler.addFile('lib/demo.ts', `
            export function test(): number{
                return 1
            }
        `)
        let result = compiler.compile(false);
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(result.dts, null);
        assert.strictEqual(result.errors.length, 0);
    });
    it("import JSON", function(){
        let compiler = new Compiler();
        compiler.addFile('index.ts', `
            import Demo from './demo.json';
            let value = Demo.value;
        `)
        compiler.addFile('demo.json.ts', `export default
            {
                value: true
            }
        `)
        let result = compiler.compile(true);        
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(typeof(result.dts), 'string');
        assert.strictEqual(result.errors.length, 0);
    });
    it("Add Directory", async function(){
        let path = Path.join(__dirname, 'samples');        
        let compiler = new Compiler();
        let files = await compiler.addDirectory(path);
        let result = compiler.compile(true);
        assert.strictEqual(typeof(result.script), 'string');
        assert.strictEqual(typeof(result.dts), 'string');
        assert.strictEqual(result.errors.length, 0);
    })
})