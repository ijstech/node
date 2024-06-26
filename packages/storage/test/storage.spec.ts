import assert from 'assert';
import {S3} from '../src/s3';
import {Storage} from '../src';
import Config from './data/config.js';
import Path from 'path';
import * as IPFSUtils from '@ijstech/ipfs';
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
    let s3 = new S3(Config.s3);
    before(async function(){
        let s3 = new S3(Config.s3);
        //delete all ipfs objects
        let items = await s3.listObjects({prefix: 'ipfs'})
        if (items.Contents?.length){
            for (let i = 0; i < items.Contents?.length; i ++){
                let key = items.Contents[i].Key;
                if (key)
                    await s3.deleteObject(key);
            };  
        };        
    })
    it('put Dir', async function(){
        let storage = new Storage(Config);
        let path = Path.join(__dirname, './dir');
        let result = await storage.putDir(path, {s3: true, ipfs: true}, 'local test dir')
        assert.strictEqual(result.cid, 'bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism');
        result = await storage.putItems(result.links);
        assert.strictEqual(result.cid, 'bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism');
    });
    it('get Item', async function(){
        let storage = new Storage(Config);
        let info = await storage.getItemInfo('bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism');  
        assert.deepStrictEqual(info, {
            cid: 'bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism',
            code: 112,
            size: 1048917,
            type: 'dir',
            name: '',
            links: [
              {
                cid: 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq',
                name: '1048577.bin',
                size: 1048681
              },
              {
                cid: 'bafkreiedx5743ej6qhjv6diostwr5qdbd2hdwsijyi5qb347a5xsaxthyy',
                name: 'file1.txt',
                size: 6
              },
              {
                cid: 'bafybeiaujqvgye35gwlz6jlzljojrosci25yuro6qb2754ysfkkjwgo4ma',
                name: 'folder 1',
                size: 64
              }
            ]
        });
        let result = await storage.getItem('bafkreiedx5743ej6qhjv6diostwr5qdbd2hdwsijyi5qb347a5xsaxthyy')
        assert.strictEqual(result, 'file 1');
        info = await storage.getItemInfo('bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism');
        assert.strictEqual(info.type, 'dir');
        assert.strictEqual(info.size, 1048917);
        info = await storage.getItemInfo('bafkreiedx5743ej6qhjv6diostwr5qdbd2hdwsijyi5qb347a5xsaxthyy');
        assert.strictEqual(info.type, 'file');
        info = await storage.getItemInfo('bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq'); //1048577.bin
        assert.strictEqual(info.type, 'file');
        assert.strictEqual(info.size, 1048681);
        assert.strictEqual(info.code, IPFSUtils.CidCode.DAG_PB);
        assert.deepStrictEqual(info.links, [
            {
                cid: 'bafkreibq4fevl27rgurgnxbp7adh42aqiyd6ouflxhj3gzmcxcxzbh6lla',
                name: '',
                size: 1048576
              },
              {
                cid: 'bafkreidogqfzz75tpkmjzjke425xqcrmpcib2p5tg44hnbirumdbpl5adu',
                name: '',
                size: 1
              }
        ]);
        info = await storage.getItemInfo('bafkreibq4fevl27rgurgnxbp7adh42aqiyd6ouflxhj3gzmcxcxzbh6lla'); //chunk 0
        assert.strictEqual(info.type, 'file');
    });
    // it('put Github', async function(){
    //     let storage = new Storage(Config);
    //     let result = await storage.putGithub({org:'ijstech',repo:'openswap-scbook',commit:'f1abac737421db53e507be21dafc6710a73c8c6f'}, {ipfs: true, s3: false});
    //     assert.strictEqual(result.cid, 'bafybeiabehpjuhbjnnrehsrl327pr5tp4fqhclp3th5ta4bxazlmmdkopq');
    // });    
    // it('get File', async function(){
    //     let storage = new Storage(Config);
    //     let result = await storage.getFile('bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism', 'file1.txt')
    //     assert.strictEqual(result, 'file 1');
    //     result = await storage.getFile('bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism', 'file1.txt')
    //     assert.strictEqual(result, 'file 1');
    // });    
    it('get File Path', async function(){
        let storage = new Storage(Config);
        let result = await storage.getLocalFilePath('bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');  //1048577.bin
        assert.strictEqual(typeof(result), 'string');
        result = await storage.getLocalFilePath('bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism', '1048577.bin');
        assert.strictEqual(typeof(result), 'string');
        result = await storage.getLocalFilePath('bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism', 'folder 1/file 2.txt');
        let content = await Fs.readFile(result, 'utf-8');
        assert.strictEqual(content, 'file 2');
        result = await storage.getLocalFilePath('bafybeidn6qdn3idyhpdqv65ofiinqjr6egalh6bwodb7cc4o77lxquuism', 'folder 1/file 2.txt');
        content = await Fs.readFile(result, 'utf-8');
        assert.strictEqual(content, 'file 2');
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
    it('s3.copyObject', async function(){
        let s3 = new S3(Config.s3)
        await s3.copyObject('hello.txt', 'hello1.txt');
        let exists = await s3.hasObject('hello1.txt');
        assert.strictEqual(exists, true);
        await s3.moveObject('hello1.txt', 'hello2.txt');
        exists = await s3.hasObject('hello2.txt');
        assert.strictEqual(exists, true);
        await s3.deleteObject('hello2.txt');
    });
    it('a3.hasObject', async function () {
        let s3 = new S3(Config.s3)
        let result = await s3.hasObject('not_exist_file.txt');
        assert.strictEqual(result, false);
        result = await s3.hasObject('hello.txt');
        assert.strictEqual(result, true);
        await s3.deleteObject('hello.txt');
        result = await s3.hasObject('hello.txt');
        assert.strictEqual(result, false);
    });    
    it ('s3.putObjectFrom', async function(){
        let s3 = new S3(Config.s3)
        await s3.deleteObject('file1.txt');
        let result = await s3.putObjectFrom('file1.txt', Path.join(__dirname, 'dir/file1.txt'));
        assert.strictEqual(result.Key, 'file1.txt');
    });
    it ('s3.getObjectSignedUrl', async function(){
        let s3 = new S3(Config.s3)
        let result = await s3.getObjectSignedUrl('file1.txt');
        assert.strictEqual(typeof(result), 'string');;
    });
    it ('s3.putObjectSignedUrl', async function(){
        let s3 = new S3(Config.s3)
        let cid = await IPFSUtils.hashFile(Path.join(__dirname, 'dir/file1.txt'))
        let sha256 = IPFSUtils.cidToHash(cid.cid);
        await s3.deleteObject('file1-presign.txt');
        let url = await s3.putObjectSignedUrl('file1-presign.txt', {
            sha256: sha256
        });
        assert.strictEqual(typeof(url), 'string');
        try{
            let res = await fetch(url, {
                method: 'PUT',
                headers:{
                    "x-amz-checksum-sha256": sha256,
                    // "content-length": cid.size.toString()
                },
                body: await Fs.readFile(Path.join(__dirname, 'dir/file1.txt'))
            });
        }
        catch(err){
            console.dir(err.message)
        }
        let headResult = await s3.headObject('file1-presign.txt');
        let exists = await s3.hasObject('file1-presign.txt');
        assert.strictEqual(exists, true);
        await s3.deleteObject('file1-presign.txt')
    });
    it('s3.listObjects', async function(){
        let s3 = new S3(Config.s3);
        let result = await s3.listObjects({
            maxKeys: 2
        });
        assert.strictEqual(result.Contents?.length, 2)
        result = await s3.listObjects({
            maxKeys: 100,
            startAfter: result.Contents?.[1].Key
        });
        assert.strictEqual(result.Contents?.length, 6)
    });    
});