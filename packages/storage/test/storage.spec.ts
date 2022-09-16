import assert from 'assert';
import {S3} from '../src/s3';
import {Storage} from '../src';
import Config from './data/config.js';
import Path from 'path';
import Fs from 'fs';

try{
    Fs.rmSync(Path.join(__dirname, 'cache'), { recursive: true, force: true });
}
catch(err){};
Config.localCache = {
    path: Path.join(__dirname, 'cache')
}
describe('Storage', function () {
    this.timeout(1800000);    
    it('Sync Dir', async function(){
        let storage = new Storage(Config);
        let path = Path.join(__dirname, './dir');
        let result = await storage.syncDirTo(path, {s3: true, ipfs: true})
        assert.strictEqual(result.cid, 'bafybeidyzdelnhfq2fus6wi2i6n2r7yqkf2fir6nlwqyzhsxwds2gwn7cm');
    });
    it('Sync Github', async function(){
        let storage = new Storage(Config);
        let result = await storage.syncGithubTo({org:'ijstech',repo:'openswap-scbook',commit:'f1abac737421db53e507be21dafc6710a73c8c6f'}, {ipfs: true});
        assert.strictEqual(result.cid, 'bafybeiabehpjuhbjnnrehsrl327pr5tp4fqhclp3th5ta4bxazlmmdkopq');
    });
    it('get File Content', async function(){
        let storage = new Storage(Config);
        let result = await storage.getFileContent('bafybeidyzdelnhfq2fus6wi2i6n2r7yqkf2fir6nlwqyzhsxwds2gwn7cm', 'file1.txt')
        assert.strictEqual(result, 'file 1');
        result = await storage.getFileContent('bafybeidyzdelnhfq2fus6wi2i6n2r7yqkf2fir6nlwqyzhsxwds2gwn7cm', 'folder1/file2.txt')
        assert.strictEqual(result, 'file 2');        
    })
    it('putObject', async function () {
        let s3 = new S3(Config.s3)
        let result = await s3.putObject('hello.txt', 'hello!');
        assert.strictEqual(typeof(result.ETag), 'string');
    });
    it('getObject', async function () {
        let s3 = new S3(Config.s3)
        let result = await s3.getObject('hello.txt');
        assert.strictEqual(result, 'hello!');
    });
    it('hasObject', async function () {
        let s3 = new S3(Config.s3)
        let result = await s3.hasObject('not_exist_file.txt');
        assert.strictEqual(result, false);
        result = await s3.hasObject('hello.txt');
        assert.strictEqual(result, true);
    });
});