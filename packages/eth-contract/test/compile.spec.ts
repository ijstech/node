import assert from "assert";

import fs from 'fs';
import {execSync} from 'child_process'
describe('compiler', function(){
    it('compiler', async function () {
        let list = fs.readdirSync("test/compiler").filter(e=>e.match(/solconfig\..*\.json/));
        for (let soldconfig of list) {
            console.log(soldconfig);
            execSync(`tools/bin/compile.js ${soldconfig}`);
        }

        let expected = fs.readdirSync("test/compiler/expected");
        let actual = fs.readdirSync("test/compiler/src");
        assert.deepStrictEqual(actual, expected);

        for (let type of expected){
            let expected1 = fs.readdirSync(`test/compiler/expected/${type}`);
            let actual1 = fs.readdirSync(`test/compiler/src/${type}`);
            assert.deepStrictEqual(actual1, expected1);
            for (let file of expected1){
                assert.strictEqual(fs.readFileSync(`test/compiler/src/${type}/${file}`,'utf8'), fs.readFileSync(`test/compiler/expected/${type}/${file}`,'utf8'), `expect test/compiler/src/${type}/${file} the same as test/compiler/expected/${type}/${file}`);
            }
        }
    });
});
