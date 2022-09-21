import assert from 'assert';
import {S3} from '../src/s3';
import {Storage} from '../src';
import Config from './data/config.js';
import Path from 'path';
import {promises as Fs, rmSync} from 'fs';


try{
    rmSync(Path.join(__dirname, 'cache'), { recursive: true, force: true });
}
catch(err){};
Config.localCache = {
    path: Path.join(__dirname, 'cache')
}
describe('Storage', function () {
    this.timeout(1800000);    
    it('put Dir', async function(){
        let storage = new Storage(Config);
        let path = Path.join(__dirname, './dir');
        let result = await storage.putDir(path, {s3: true, ipfs: true}, 'local test dir')
        assert.strictEqual(result.cid, 'bafybeidbj3z4j6gv5pjwm3beu2oh4b7xaaem5zyp2o2sbitvdkgrfftkuy');
    });
    it('get Item', async function(){
        let storage = new Storage(Config);
        let result = JSON.parse(await storage.getItem('bafybeidbj3z4j6gv5pjwm3beu2oh4b7xaaem5zyp2o2sbitvdkgrfftkuy'))
        assert.strictEqual(result.cid, 'bafybeidbj3z4j6gv5pjwm3beu2oh4b7xaaem5zyp2o2sbitvdkgrfftkuy');
        result = await storage.getItem('bafkreiedx5743ej6qhjv6diostwr5qdbd2hdwsijyi5qb347a5xsaxthyy')
        assert.strictEqual(result, 'file 1');
    });
    it('put Github', async function(){
        let storage = new Storage(Config);
        let result = await storage.putGithub({org:'ijstech',repo:'openswap-scbook',commit:'f1abac737421db53e507be21dafc6710a73c8c6f'}, {ipfs: true, s3: false});
        assert.strictEqual(result.cid, 'bafybeiabehpjuhbjnnrehsrl327pr5tp4fqhclp3th5ta4bxazlmmdkopq');
    });
    it('get File', async function(){
        let storage = new Storage(Config);
        let result = await storage.getFile('bafybeidbj3z4j6gv5pjwm3beu2oh4b7xaaem5zyp2o2sbitvdkgrfftkuy', 'file1.txt')
        assert.strictEqual(result, 'file 1');
        result = await storage.getFile('bafybeidbj3z4j6gv5pjwm3beu2oh4b7xaaem5zyp2o2sbitvdkgrfftkuy', 'folder 1/file 2.txt')
        assert.strictEqual(result, 'file 2');
    });    
    it('put File', async function(){
        let storage = new Storage(Config);
        let path = Path.join(__dirname, './dir/folder 1/file 2.txt');
        let result = await storage.putFile(path, {}, 'local file')
        assert.strictEqual(result.cid, 'bafkreih6p4idjvfghxpjdetts4zpwvj2oidyr5bcyvzd5r6kdrudfaedpy');
    });    
    it('put content', async function(){
        let storage = new Storage(Config);
        let path = Path.join(__dirname, './dir/folder 1/file 2.txt');
        let content = await Fs.readFile(path, 'utf-8');
        let result = await storage.putContent(content, {}, 'local file content')
        assert.strictEqual(result.cid, 'bafkreih6p4idjvfghxpjdetts4zpwvj2oidyr5bcyvzd5r6kdrudfaedpy');
    }); 
    it('s3.putObject', async function () {
        let s3 = new S3(Config.s3)
        let result = await s3.putObject('hello.txt', 'hello!');
        assert.strictEqual(typeof(result.ETag), 'string');
    });
    it('s3.getObject', async function () {
        let s3 = new S3(Config.s3)
        let result = await s3.getObject('hello.txt');
        assert.strictEqual(result, 'hello!');
    });
    it('a3.hasObject', async function () {
        let s3 = new S3(Config.s3)
        let result = await s3.hasObject('not_exist_file.txt');
        assert.strictEqual(result, false);
        result = await s3.hasObject('hello.txt');
        assert.strictEqual(result, true);
    });
});