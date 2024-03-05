import 'mocha';
import * as assert from 'assert';
import {promises as Fs, createReadStream} from 'fs';
import Path from 'path';
import { CidCode, cidToHash, FileManager, ICidInfo, FileManagerHttpTransport, parse} from '../src';
import { IGetUploadUrlResult, IFileManagerTransporterOptions, FileNode, IRootInfo, IResult} from '../src/fileManager';
import {Storage} from '@ijstech/storage';
import Config from './data/config.js';
import {S3} from '@ijstech/storage';

Config.localCache = {
    path: Path.join(__dirname, 'cache')
};
let storage = new Storage(Config);
class FileManagerTransport extends FileManagerHttpTransport {
    async getCidInfo(cid: string): Promise<ICidInfo | undefined> {
        let parsed = parse(cid);
        if (parsed.code == CidCode.RAW)
            return parsed;
        let data = await storage.getFileRaw(cid);
        parsed = parse(cid, data);
        return parsed;
    };
    async getRoot(): Promise<IRootInfo>{
        return {
            success: true,
            data: {
                cid: '',
                used: 0,
                quota: 10000000
            }
        };
    };
    async getUploadUrl(cidInfo: ICidInfo): Promise<IGetUploadUrlResult | undefined> {
        let sha256 = cidToHash(cidInfo.cid);
        let result: IGetUploadUrlResult = {
            success: true,
            data: {}
        };
        let url = await storage.getUploadUrl(`ipfs/${cidInfo.cid}`, {
            sha256: sha256
        });
        result.data[cidInfo.cid] = {
            url: url,
            method: 'PUT',
            headers:{
                "x-amz-checksum-sha256": sha256,
                'Content-Type': 'application/octet-stream',
                // 'Content-Length': cidInfo.size.toString()
            }
        };
        if (cidInfo.links){
            for (let link of cidInfo.links){
                if (link.cid){
                    sha256 = cidToHash(link.cid);
                    url = await storage.getUploadUrl(`ipfs/${link.cid}`, {
                        sha256: sha256
                    });
                    result.data[link.cid] = {
                        url: url,
                        method: 'PUT',
                        headers:{
                            "x-amz-checksum-sha256": sha256,
                            'Content-Type': 'application/octet-stream',
                            'Content-Length': link.size.toString()
                        }
                    };
                };
            };
        };
        return result;
    };
    async updateRoot(node: FileNode): Promise<IResult>{
        return {
            success: true
        };
    }
};
describe('FileManager', async function () {    
    this.timeout(60000);
    let transport = new FileManagerTransport({

    });
    let manager = new FileManager({
        transport: transport
    });
    it('Add File Node', async function () {
        let buffer = await Fs.readFile(Path.join(__dirname, './samples/file.txt'));
        let fileNode = await manager.addFileContent('/test/test.txt', buffer);
        let cid = await fileNode.hash();
        if (cid){
            let parsed = parse(cid.cid);
            assert.strictEqual(parsed.code, CidCode.RAW);
            assert.strictEqual(parsed.type, 'file');
        };
        assert.strictEqual(cid?.cid, 'bafkreid7qoywk77r7rj3slobqfekdvs57qwuwh5d2z3sqsw52iabe3mqne');

        //large file
        buffer = await Fs.readFile(Path.join(__dirname, './samples/1048577.bin'));
        fileNode = await manager.addFileContent('/test/test.bin', buffer);
        cid = await fileNode.hash();
        assert.strictEqual(cid?.cid, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');
        assert.strictEqual(cid?.type, 'file');
        assert.strictEqual(cid?.size, 1048681);
        if (cid){
            let parsed = parse(cid.cid, cid.bytes);
            assert.strictEqual(parsed.code, CidCode.DAG_PB);
            assert.deepStrictEqual(parsed.links, [{
                cid: 'bafkreibq4fevl27rgurgnxbp7adh42aqiyd6ouflxhj3gzmcxcxzbh6lla',
                name: '',
                size: 1048576
              },
              {
                cid: 'bafkreidogqfzz75tpkmjzjke425xqcrmpcib2p5tg44hnbirumdbpl5adu',
                name: '',
                size: 1
            }]);
            assert.strictEqual(parse(parsed.links[0].cid).code, CidCode.RAW);
        };        

        buffer = await Fs.readFile(Path.join(__dirname, './samples/1048577.bin'));
        fileNode = await manager.addFileContent('/test2/1048577.bin', buffer);        
        fileNode = await manager.getFileNode('/test2');
        cid = await fileNode?.hash();
        assert.strictEqual(cid?.cid, 'bafybeicvmd5gqjerunziy7quvocsbb3rdhjmxvn6iqdzreokinurbhjlby');
        assert.strictEqual(cid?.type, 'dir');

        // root node
        let rootNode = await manager.getRootNode();
        cid = await rootNode.hash();
        if (cid?.bytes){
            let parsed = parse(cid.cid);
            assert.strictEqual(parsed.code, CidCode.DAG_PB);
            parsed = parse(cid.cid, cid.bytes);
            assert.strictEqual(parsed.type, 'dir');
        };

        //test folder
        fileNode = await manager.getFileNode('/test');
        assert.strictEqual(fileNode?.name, 'test');
        assert.strictEqual(await fileNode?.isFolder(), true);
        cid = await fileNode?.hash();
        assert.strictEqual(cid?.cid, 'bafybeiav42me4biqiqs67juiig7tqzbhipxpjrlg3hdhtlrewwffj3k7zi');

        if (cid?.bytes){
            let parsed = parse(cid.cid);
            assert.strictEqual(parsed.code, CidCode.DAG_PB);
            parsed = parse(cid.cid, cid.bytes);
            assert.strictEqual(parsed.type, 'dir');
            assert.strictEqual(Array.isArray(parsed?.links), true);
            if (parsed?.links)
                assert.strictEqual(parsed?.links[0].name, 'test.bin');
        };
        await manager.applyUpdates();
    });
    it('Get Local Data', async function(){     
        let rootNode = await manager.getRootNode();
        let cid = rootNode.cidInfo;
        assert.strictEqual(cid?.cid, 'bafybeiadhh6b33tyybyi6gp6tcykcyak3fyqkqt4a5iz6cvkkd476jdkea');
        assert.strictEqual(cid?.type, 'dir');
        assert.strictEqual(cid?.size, 2097650);

        cid = await storage.getItemInfo(`bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq`); //large file
        assert.strictEqual(cid?.type, 'file');
        assert.strictEqual(cid?.size, 1048681);

        cid = await storage.getItemInfo('bafkreibq4fevl27rgurgnxbp7adh42aqiyd6ouflxhj3gzmcxcxzbh6lla');// large file chunk 0
        let path = await storage.getLocalFilePath('bafkreibq4fevl27rgurgnxbp7adh42aqiyd6ouflxhj3gzmcxcxzbh6lla');
        let stat = await Fs.stat(path);
        assert.strictEqual(cid?.type, 'file');
        assert.strictEqual(stat.size, 1048576);

        cid = await storage.getItemInfo('bafkreidogqfzz75tpkmjzjke425xqcrmpcib2p5tg44hnbirumdbpl5adu');// large file chunk 1
        path = await storage.getLocalFilePath('bafkreidogqfzz75tpkmjzjke425xqcrmpcib2p5tg44hnbirumdbpl5adu');
        stat = await Fs.stat(path);
        assert.strictEqual(cid?.type, 'file');
        assert.strictEqual(stat.size, 1);
        
        cid = await storage.getItemInfo('bafybeiav42me4biqiqs67juiig7tqzbhipxpjrlg3hdhtlrewwffj3k7zi'); // test folder
        path = await storage.getLocalFilePath('bafybeiav42me4biqiqs67juiig7tqzbhipxpjrlg3hdhtlrewwffj3k7zi');
        assert.strictEqual(cid?.type, 'dir');

        let content = await storage.getItem(`bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq`);
        let data = JSON.parse(content);
        assert.strictEqual(data?.type, 'file');
        assert.strictEqual(data?.size, 1048681);
    });
    it('Set Root CID', async function(){     
        let manager = new FileManager({
            transport: transport,
            rootCid: 'bafybeiadhh6b33tyybyi6gp6tcykcyak3fyqkqt4a5iz6cvkkd476jdkea'
        });
        let rootNode = await manager.getRootNode();
        assert.strictEqual(await rootNode.isFolder(), true);
        assert.strictEqual(rootNode.cid, 'bafybeiadhh6b33tyybyi6gp6tcykcyak3fyqkqt4a5iz6cvkkd476jdkea');
        assert.strictEqual(await (rootNode.itemCount()), 2);

        let node = await manager.getFileNode('/test2');
        assert.strictEqual(await node.isFolder(), true);
        assert.strictEqual(node.cid, 'bafybeicvmd5gqjerunziy7quvocsbb3rdhjmxvn6iqdzreokinurbhjlby');
        assert.strictEqual(await (node.itemCount()), 1);
        let item = await node.items(0);
        assert.strictEqual(item?.name, '1048577.bin');
        assert.strictEqual(await item?.isFile(), true);

        manager = new FileManager({
            transport: transport
        });
        rootNode = await manager.setRootCid('bafybeiadhh6b33tyybyi6gp6tcykcyak3fyqkqt4a5iz6cvkkd476jdkea');
        node = await manager.getFileNode('/test2/1048577.bin');
        assert.strictEqual(node.name, '1048577.bin');
        assert.strictEqual(await node.isFile(), true);
        assert.strictEqual(node.cid, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');
    });
    // it('Check FileManagerHttpTransport Query', async function(){
    //     let transport = new FileManagerHttpTransport({
    //         endpoint: 'http://localhost:8088'
    //     });
    //     let manager = new FileManager({
    //         transport: transport
    //     });
    //     let rootNode = await manager.setRootCid('bafybeiadhh6b33tyybyi6gp6tcykcyak3fyqkqt4a5iz6cvkkd476jdkea');
    //     assert.strictEqual(await rootNode.isFolder(), true);
    //     assert.strictEqual(rootNode.cid, 'bafybeiadhh6b33tyybyi6gp6tcykcyak3fyqkqt4a5iz6cvkkd476jdkea');
    //     assert.strictEqual(await (rootNode.itemCount()), 2);

    //     let node = await manager.getFileNode('/test2');
    //     assert.strictEqual(await node.isFolder(), true);
    //     assert.strictEqual(node.cid, 'bafybeicvmd5gqjerunziy7quvocsbb3rdhjmxvn6iqdzreokinurbhjlby');
    //     assert.strictEqual(await (node.itemCount()), 1);
    //     let item = await node.items(0);
    //     assert.strictEqual(item?.name, '1048577.bin');
    //     assert.strictEqual(await item?.isFile(), true);

    //     manager = new FileManager({
    //         transport: transport
    //     });
    //     rootNode = await manager.setRootCid('bafybeiadhh6b33tyybyi6gp6tcykcyak3fyqkqt4a5iz6cvkkd476jdkea');
    //     node = await manager.getFileNode('/test2/1048577.bin');
    //     assert.strictEqual(node.name, '1048577.bin');
    //     assert.strictEqual(await node.isFile(), true);
    //     assert.strictEqual(node.cid, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');
    // });

    // it('Check FileManagerHttpTransport Update', async function(){
    //     let s3 = new S3(Config.s3);
    //     //delete all test data
    //     let items = await s3.listObjects({prefix: 'ipfs'})
    //     for (let i = 0; i < items.Contents?.length; i ++){
    //         let key = items.Contents[i].Key;
    //         await s3.deleteObject(key);
    //     };        
    //     let transport = new FileManagerHttpTransport({
    //         endpoint: 'http://localhost:8088'
    //     });
    //     let exists = await s3.hasObject('ipfs/bafybeieew4sqq2zdvqrs26hyeimquh5qvchvibeac4kxcw43yokyqyp4ze');
    //     assert.strictEqual(exists, false);
    //     //upload file
    //     let manager = new FileManager({
    //         transport: transport
    //     });
    //     let buffer = await Fs.readFile(Path.join(__dirname, './samples/1048577.bin'));
    //     await manager.addFileContent('/test3/1048577.bin', buffer);
    //     await manager.applyUpdates();

    //     exists = await s3.hasObject('ipfs/bafybeieew4sqq2zdvqrs26hyeimquh5qvchvibeac4kxcw43yokyqyp4ze');
    //     assert.strictEqual(exists, true);

    //     //check if the file is uploaded
    //     manager = new FileManager({
    //         transport: transport,
    //         rootCid: 'bafybeieew4sqq2zdvqrs26hyeimquh5qvchvibeac4kxcw43yokyqyp4ze'
    //     });
    //     let rootNode = await manager.getRootNode();
    //     assert.strictEqual(await rootNode.isFolder(), true);
    //     assert.strictEqual(rootNode.cid, 'bafybeieew4sqq2zdvqrs26hyeimquh5qvchvibeac4kxcw43yokyqyp4ze');
        
    //     let node = await manager.getFileNode('/test3');
    //     assert.strictEqual(await node.isFolder(), true);
    //     assert.strictEqual(node.cid, 'bafybeicvmd5gqjerunziy7quvocsbb3rdhjmxvn6iqdzreokinurbhjlby');
    //     assert.strictEqual(await (node.itemCount()), 1);
    //     let item = await node.items(0);
    //     assert.strictEqual(item?.name, '1048577.bin');
    //     assert.strictEqual(await item?.isFile(), true);
    //     assert.strictEqual(item.cid, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');


    //     //add file to existing folder
    //     manager = new FileManager({
    //         transport: transport,
    //         rootCid: 'bafybeieew4sqq2zdvqrs26hyeimquh5qvchvibeac4kxcw43yokyqyp4ze'
    //     });        
    //     rootNode = await manager.getRootNode();
    //     assert.strictEqual(rootNode.cid, 'bafybeieew4sqq2zdvqrs26hyeimquh5qvchvibeac4kxcw43yokyqyp4ze');

    //     node = await rootNode.addFileContent('test3/file.txt', 'Hello World!');
    //     await manager.applyUpdates();
    //     assert.strictEqual(rootNode.cid, 'bafybeifsaekfrx3lsjw3zytlqdjahesf7m3nejdv4pgbo4mey3ei57zt6i');

    //     // check if the file is uploaded 
    //     manager = new FileManager({
    //         transport: transport,
    //         rootCid: 'bafybeifsaekfrx3lsjw3zytlqdjahesf7m3nejdv4pgbo4mey3ei57zt6i'
    //     });
    //     rootNode = await manager.getRootNode();
    //     assert.strictEqual(rootNode.cid, 'bafybeifsaekfrx3lsjw3zytlqdjahesf7m3nejdv4pgbo4mey3ei57zt6i');
        
    //     node = await manager.getFileNode('/test3/file.txt');
    //     assert.strictEqual(await node.isFile(), true);
    //     assert.strictEqual(node.cid, 'bafkreid7qoywk77r7rj3slobqfekdvs57qwuwh5d2z3sqsw52iabe3mqne');

    //     node = await manager.getFileNode('/test3/1048577.bin');
    //     assert.strictEqual(await node.isFile(), true);
    //     assert.strictEqual(node.cid, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');

    //     // check if the file is uploaded 
    //     manager = new FileManager({
    //         transport: transport,
    //         rootCid: 'bafybeifsaekfrx3lsjw3zytlqdjahesf7m3nejdv4pgbo4mey3ei57zt6i'
    //     });        
    //     node = await manager.getFileNode('/test3/1048577.bin');
    //     assert.strictEqual(await node.isFile(), true);
    //     assert.strictEqual(node.cid, 'bafybeihd4yzq7n5umhjngdum4r6k2to7egxfkf2jz6thvwzf6djus22cmq');

    //     // check if the folder is uploaded 
    //     manager = new FileManager({
    //         transport: transport,
    //         rootCid: 'bafybeifsaekfrx3lsjw3zytlqdjahesf7m3nejdv4pgbo4mey3ei57zt6i'
    //     });        
    //     node = await manager.getFileNode('/test3');
    //     assert.strictEqual(await node.isFolder(), true);
    //     assert.strictEqual(node.cid, 'bafybeib52rxgw7kd4hkvyuklg6k6isjnhynnfp5dh7ckejexojpxzodapa');
    //     assert.strictEqual(await (node.itemCount()), 2);

    //     buffer = await Fs.readFile(Path.join(__dirname, './samples/test.png'));
    //     await node.addFileContent('test.png', buffer);
    //     await manager.applyUpdates();
    //     rootNode = await manager.getRootNode();
    //     assert.strictEqual(rootNode.cid, 'bafybeid3rwd52gvq4ewayotikbwoopsoem5tv4wrprazw5igx6p6zpw6qi');

    //     // check if the file is uploaded 
    //     manager = new FileManager({
    //         transport: transport,
    //         rootCid: 'bafybeid3rwd52gvq4ewayotikbwoopsoem5tv4wrprazw5igx6p6zpw6qi'
    //     });        
    //     node = await manager.getFileNode('/test3/test.png');
    //     assert.strictEqual(await node.isFile(), true);
    //     assert.strictEqual(node.cid, 'bafybeidozewhivatocukvcn2tlqch5qknyk7c5wp7ktk3zcjty5xzqycum');
    // });
});