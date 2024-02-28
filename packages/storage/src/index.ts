import {promises as Fs, createReadStream, createWriteStream, unlink, mkdirSync} from 'fs';
import Path from 'path';
import Https from 'https';
import Crypto from 'crypto';
import Os from 'os';
import * as IPFSUtils from '@ijstech/ipfs';
import {IS3Options, S3, IPreSignedUrlOptions} from './s3';
import Extract from 'extract-zip';
import {getClient} from '@ijstech/db';
import {IDbConnectionOptions} from '@ijstech/types';
import {Context} from './log.pdm';
export {S3};

// let Web3Storage: any;
let getFilesFromPath: any;
let File: any;
const appPrefix = 'sc';

async function download(url: string, dest: string) {
    return new Promise((resolve, reject) => {
        const request = Https.get(url, response => {
            if (response.statusCode === 200) {
                const file = createWriteStream(dest)
                file.on('finish', () => resolve(''));
                file.on('error', err => {
                    file.close();
                    unlink(dest, () => reject(err.message)); // Delete temp file
                });
                response.pipe(file);
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                //Recursively follow redirects, only a 200 will resolve.
                download(response.headers.location, dest).then(() => resolve(''))
            } else {
                reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`)
            }
        });
        request.on('error', err => {
            reject(err.message)
        });
    });
};
export interface IGithubRepo{
    org: string; 
    repo: string;
    commit: string;
};
export interface IStorageOptions{
    s3?: IS3Options;
    // web3Storage?: {endpoint?: string,token: string};
    localCache?: {path: string};
    log?: IDbConnectionOptions;
};
export type IItemType = 'stat' | 'ipfs' | 'tmp';
export class Storage{
    private options: IStorageOptions;
    public s3: S3;
    // private _web3Storage: any;
    private _initDir: boolean;

    constructor(options: IStorageOptions){
        this.options = options;
        if (this.options.s3)
            this.s3 = new S3(this.options.s3);         
    };
    // private get web3Storage(){
    //     if (!this._web3Storage && this.options.web3Storage?.token){
    //         let Lib = require('web3.storage');
    //         Web3Storage = Lib.Web3Storage;
    //         getFilesFromPath = Lib.getFilesFromPath;
    //         File = Lib.File;
    //         this._web3Storage = new Web3Storage({ token: this.options.web3Storage.token});   
    //     };
    //     return this._web3Storage; 
    // };
    private async initDir(){
        if (!this._initDir){
            if (this.options.localCache?.path){
                await Fs.mkdir(Path.join(this.options.localCache.path, 'stat'), { recursive: true });
                await Fs.mkdir(Path.join(this.options.localCache.path, 'ipfs'), { recursive: true });
                await Fs.mkdir(Path.join(this.options.localCache.path, 'tmp'), { recursive: true });
            };
            this._initDir = true;
        };
    };
    private async localCacheExist(type: IItemType, key: string): Promise<boolean>{
        if (this.options.localCache?.path){            
            await this.initDir();
            try{
                let filePath = Path.join(this.options.localCache.path, type, key);
                await Fs.access(filePath);
                return true;
            }
            catch(err){
                return false;
            }
        }
        else
            return false;
    };
    private async getLocalCachePath(type: IItemType, key: string): Promise<string>{
        if (this.options.localCache?.path){
            await this.initDir();
            return Path.join(this.options.localCache.path, type, key);  
        };
    };
    private async getLocalCache(type: IItemType,key: string): Promise<string>{
        let filePath = await this.getLocalCachePath(type, key);
        if (filePath){
            let content = await Fs.readFile(filePath, 'utf8');
            return content;
        };
    };
    private async getLocalCacheRaw(type: IItemType,key: string): Promise<Uint8Array>{
        let filePath = await this.getLocalCachePath(type, key);
        if (filePath){
            let content = await Fs.readFile(filePath);
            return content;
        };
    };
    private async putLocalCache(type: IItemType, key: string, content: string | Uint8Array){
        let filePath = await this.getLocalCachePath(type, key);
        if (filePath){
            await Fs.writeFile(filePath, content);
        };
    };
    async getFile(rootCid: string, filePath?: string|string[]): Promise<string>{
        let path = await this.getLocalFilePath(rootCid, filePath);
        if (path)
            return await Fs.readFile(path, 'utf8');
    };
    async getFileRaw(rootCid: string, filePath?: string|string[]): Promise<Uint8Array>{
        let path = await this.getLocalFilePath(rootCid, filePath, false, true);
        if (path)
            return await Fs.readFile(path);
    };
    private moveFile(sourcePath: string, destPath: string): Promise<boolean>{
        return new Promise((resolve, reject)=>{
            const readStream = createReadStream(sourcePath);
            const writeStream = createWriteStream(destPath);

            readStream.on('error', err => {
                reject(err);
            });
            writeStream.on('error', err => {
                reject(err);
            });
            writeStream.on('finish', () => {
                Fs.rm(sourcePath);
                resolve(true)
            });
            readStream.pipe(writeStream);
        });
    };
    async getLocalFilePath(rootCid: string, filePath?: string |string[], returnIndex?: boolean, rawFile?: boolean): Promise<string>{
        if (rootCid.startsWith('/') && typeof(filePath) == 'string')
            return Path.join(rootCid, filePath);

        if (typeof(filePath) == 'string' && filePath[0] == '/')
            filePath = filePath.substring(1);        
        let paths: string[];
        if (filePath){
            if (Array.isArray(filePath))
                paths = filePath
            else
                paths = filePath.split('/');
        };        
        let item:IPFSUtils.ICidInfo;
        if (filePath && await this.localCacheExist('stat', rootCid)){
            item = JSON.parse(await this.getLocalCache('stat', rootCid))
        }
        else if (!filePath && await this.localCacheExist('ipfs', rootCid)){
            return await this.getLocalCachePath('ipfs', rootCid);
        }
        else if (this.s3) {
            if (!filePath && await this.s3.hasObject(`ipfs/${rootCid}`)){ 
                let info = await this.getItemInfo(rootCid);
                if (!rawFile && info.code == IPFSUtils.CidCode.DAG_PB && await this.localCacheExist('stat', rootCid)){
                    return await this.getLocalCachePath('stat', rootCid);
                }   
                else{
                    let targetFilePath = await this.getLocalCachePath('ipfs', rootCid);
                    if (targetFilePath) {
                        let tmpFilePath = await this.getLocalCachePath('tmp', rootCid);
                        let success = await this.s3.downloadObject(`ipfs/${rootCid}`, tmpFilePath);
                        if (!success)
                            throw new Error('Failed to download file');
                        if (info.code == IPFSUtils.CidCode.DAG_PB){
                            let cidInfo = await this.getItemInfo(rootCid);
                            if (cidInfo.cid != rootCid){
                                await Fs.rm(tmpFilePath);
                                throw new Error('CID not match');
                            }
                        }
                        else{
                            let cid = (await IPFSUtils.hashFile(tmpFilePath)).cid;
                            if (cid != rootCid) {
                                await Fs.rm(tmpFilePath);
                                throw new Error('CID not match');
                            };
                        }
                        await this.moveFile(tmpFilePath, targetFilePath);
                        return targetFilePath;
                    };
                }
            }
            else {
                item = await this.getItemInfo(rootCid); 
                if (item.type != 'dir'){
                    throw new Error('Invalid directory');
                };
            }
        };
        if (paths?.length > 0){
            let path = paths.shift();
            for (let i = 0; i < item.links.length; i++){
                let link = item.links[i];
                if (link.name == path){       
                    let info = await this.getItemInfo(link.cid);     
                    if (info.type == 'dir')
                        return await this.getLocalFilePath(link.cid, paths, returnIndex)
                    else{
                        let info = await this.getItemInfo(link.cid);
                        if (info.code == IPFSUtils.CidCode.DAG_PB){
                            return await this.getLocalFilePath(link.cid)
                        }
                        else{
                            let targetFilePath = await this.getLocalCachePath('ipfs', link.cid);                        
                            if (targetFilePath){
                                if (await this.localCacheExist('ipfs', link.cid))
                                    return targetFilePath;
                                let tmpFilePath = await this.getLocalCachePath('tmp', link.cid);    
                                let success = await this.s3.downloadObject(`ipfs/${link.cid}`, tmpFilePath);
                                if (!success)
                                    throw new Error('Failed to download file');
                                let {cid} = await IPFSUtils.hashFile(tmpFilePath);
                                if (cid != link.cid){
                                    await Fs.rm(tmpFilePath);
                                    throw new Error('CID not match');
                                };
                                await this.moveFile(tmpFilePath, targetFilePath);
                                return targetFilePath;
                            };
                        };
                    };
                };
            };
        }
        else{
            if (returnIndex && item.type == 'dir')
                return await this.getLocalFilePath(item.cid, ['index.html']);
            return await this.getLocalCachePath('stat', rootCid);
        }
    };
    async getUploadUrl(path: string, options?: IPreSignedUrlOptions): Promise<string>{
        return this.s3.putObjectSignedUrl(path, options);
    };
    async putContent(fileContent: string, to?: {ipfs?:boolean, s3?: boolean}, source?: string): Promise<IPFSUtils.ICidInfo>{
        let fileItem = await IPFSUtils.hashContent(fileContent);
        fileItem.type = 'file';
        fileItem.name = '';
        if (this.s3){
            let exists = await this.s3.hasObject(`ipfs/${fileItem.cid}`);  
            if (exists)
                return fileItem;
        };
        // let folderItem = await IPFSUtils.hashItems([
        //     {
        //         cid: fileItem.cid,
        //         name: 'file',
        //         size: fileItem.size,
        //         type: fileItem.type
        //     }
        // ])
        // if ((!to || to.ipfs != false) && this.web3Storage){
        //     const files = [
        //         new File([fileContent], 'file'),
        //     ];       
        //     let cid = await this.web3Storage.put(files, {
        //         name: source
        //     });  
        //     if (cid != folderItem.cid)
        //         throw new Error('CID not match');
        // };
        if (!to || to.s3 != false){    
            let logContext: Context;
            if (this.options.log){
                let client = getClient(this.options.log);
                logContext = new Context(client);
                let log = logContext.uploadLog.add();
                log.source = source;
                log.uploadDate = new Date();
                log.size = fileItem.size;

                logContext.uploadItem.applyInsert({
                    cid: fileItem.cid,
                    logGuid: log.guid,
                    size: fileItem.size,
                    type: 2
                });
            }
            await this.s3.putObject(`ipfs/${fileItem.cid}`, fileContent);
            if (logContext)
                await logContext.save();
        };
        return fileItem;
    };
    async putFile(filePath: string, to?: {ipfs?:boolean, s3?: boolean}, source?: string): Promise<IPFSUtils.ICidInfo>{
        let fileItem: IPFSUtils.ICidInfo = await IPFSUtils.hashFile(filePath);      
        fileItem.name = filePath.split('/').pop() || filePath;
        fileItem.type = 'file';  
        let exists: boolean;
        if (this.s3){
            exists = await this.s3.hasObject(`ipfs/${fileItem.cid}`);  
            if (exists)
                return fileItem;
        };
        let folderItem = await IPFSUtils.hashItems([
            {
                cid: fileItem.cid,
                name: fileItem.name,
                size: fileItem.size,
                links: [],
                type: 'file'
            }
        ]);

        // if ((!to || to.ipfs != false) && this.web3Storage){            
        //     const files = await getFilesFromPath(filePath);
        //     let cid = await this.web3Storage.put(files, {
        //         name: source
        //     });  
        //     if (cid != folderItem.cid)
        //         throw new Error('CID not match');
        // };
        if (!to || to.s3 != false){
            let logContext: Context;
            if (this.options.log){
                let client = getClient(this.options.log);
                logContext = new Context(client);
                let log = logContext.uploadLog.add();
                log.source = source;
                log.uploadDate = new Date();
                log.size = fileItem.size;
            }
            await this.putToS3(logContext, filePath, fileItem, folderItem);
            if (logContext)
                await logContext.save();
        };
        return fileItem;
    };
    async getItemInfo(cid: string): Promise<IPFSUtils.ICidData>{
        let parsed = IPFSUtils.parse(cid);
        if (parsed.code == IPFSUtils.CidCode.DAG_PB){
            parsed = JSON.parse(await this.getItem(cid));
            return {
                cid: cid,
                size: parsed.size,
                code: IPFSUtils.CidCode.DAG_PB,
                type: parsed.type,
                name: parsed.name,
                links: parsed.links
            };
        }
        else
            return {
                cid: cid,
                size: parsed.size,
                code: IPFSUtils.CidCode.RAW,
                type: 'file'
            };
    };
    async getItem(cid: string): Promise<string>{
        if (await this.localCacheExist('stat', cid)){
           return await this.getLocalCache('stat', cid)
        }
        else if (await this.localCacheExist('ipfs', cid)){
            return await this.getLocalCache('ipfs', cid)
        }
        else if (this.s3){
            let match: boolean;
            let itemType: IItemType;
            let content: string | Uint8Array;
            let result: string;
            if (await this.s3.hasObject(`ipfs/${cid}`)){                  
                let parsed = IPFSUtils.parse(cid);
                if (parsed.code == IPFSUtils.CidCode.DAG_PB){
                    itemType = 'stat';
                    content = await this.s3.getObjectRaw(`ipfs/${cid}`);
                    parsed = IPFSUtils.parse(cid, content);
                    let links = [];
                    for (let i = 0; i < parsed.links.length; i ++){
                        let link = parsed.links[i];
                        links.push({
                            cid: link.cid,
                            name: link.name,
                            size: link.size
                        });
                    };
                    if (parsed.type == 'dir'){
                        match = (await IPFSUtils.hashItems(parsed.links)).cid == cid;
                    }
                    else
                        match = (await IPFSUtils.hashChunks(parsed.links)).cid == cid;                    
                    result = JSON.stringify({
                        cid: cid,
                        name: parsed.name || '',
                        size: parsed.size,
                        type: parsed.type,
                        links: links
                    });          
                }
                else{
                    itemType = 'ipfs';
                    result = await this.s3.getObject(`ipfs/${cid}`);
                    match = (await IPFSUtils.hashContent(result)).cid == cid;
                };
            }
            else{
                itemType = 'stat';
                content = await this.s3.getObject(`stat/${cid}`);
                result = content
                try{
                    if ((await IPFSUtils.hashItems(JSON.parse(content).links)).cid == cid)
                        match = true;
                }
                catch(err){};
            }; 
            if (!match)            
                throw new Error('CID not match');
            await this.putLocalCache(itemType, cid, result);
            return result;      
        };
    };
    async putItems(items: IPFSUtils.ICidInfo[], source?: string): Promise<IPFSUtils.ICidInfo>{
        let hash = await IPFSUtils.hashItems(items, 1);
        hash.name = '';
        hash.type = 'dir';
        hash.links = [];
        items.forEach(item=>{
            hash.links?.push({
                cid: item.cid,
                name: item.name,
                size: item.size,
                type: item.type
            })
        });
        let logContext: Context;
        if (this.options.log){
            let client = getClient(this.options.log);
            logContext = new Context(client);
            let log = logContext.uploadLog.add();
            log.source = source;
            log.uploadDate = new Date();
            log.size = hash.size;
        };
        await this.putToS3(logContext, null, hash);
        if (logContext){
            await logContext.save();
        };
        return {
            cid: hash.cid,
            name: '',
            size: hash.size,
            type: 'dir',
            links: items
        };
    };
    async putDir(path: string, to?: {ipfs?:boolean, s3?: boolean}, source?: string): Promise<IPFSUtils.ICidInfo>{
        let hash = await IPFSUtils.hashDir(path, 1);
        hash.name = path.split('/').pop() || path;
        hash.type = 'dir';
        let cid: string;
        // if ((!to || to.ipfs != false) && this.web3Storage){
        //     let items = await Fs.readdir(path);
        //     for (let i = 0; i < items.length; i ++)
        //         items[i] = path + '/' + items[i];
        //     const files = await getFilesFromPath(items);
        //     cid = await this.web3Storage.put(files, {
        //         name: source
        //     });  
        //     if (cid != hash.cid)
        //         throw new Error('CID not match');
        // };
        if (!to || to.s3 != false){
            let logContext: Context;
            if (this.options.log){
                let client = getClient(this.options.log);
                logContext = new Context(client);
                let log = logContext.uploadLog.add();
                log.source = source;
                log.uploadDate = new Date();
                log.size = hash.size;
            };
            await this.putToS3(logContext, path, hash);
            if (logContext){
                await logContext.save();
            }
        }
        return hash;
    };
    private async putToS3(logContext: Context, sourcePath: string, item: IPFSUtils.ICidData, parent?: IPFSUtils.ICidInfo){        
        // let itemType: IItemType;
        // if (item.type == 'dir')
        //     itemType = 'stat'
        // else
        //     itemType = 'ipfs';
        
        let exists = await this.s3.hasObject(`ipfs/${item.cid}`);
        if (!exists){
            if (item.code == IPFSUtils.CidCode.DAG_PB){
                if (item.type == 'file'){
                    let fileStream = createReadStream(sourcePath, {highWaterMark: 1048576});
                    let idx = 0;
                    for await (const data of fileStream) {
                        let chunk = item.links[idx];
                        idx++;
                        let exists = await this.s3.hasObject(`ipfs/${chunk.cid}`);
                        if (!exists)
                            await this.s3.putObjectRaw(`ipfs/${chunk.cid}`, data, IPFSUtils.cidToHash(chunk.cid));
                    };
                    await this.s3.putObjectRaw(`ipfs/${item.cid}`, item.bytes, IPFSUtils.cidToHash(item.cid));
                }
                else if (item.links?.length > 0){
                    if (sourcePath){
                        for (let i = 0; i < item.links.length; i ++){
                            let link = item.links[i];
                            await this.putToS3(logContext, Path.join(sourcePath, link.name), link, item);
                        }
                    };
                    await this.s3.putObjectRaw(`ipfs/${item.cid}`, item.bytes, IPFSUtils.cidToHash(item.cid)); 
                    if (logContext){
                        logContext.uploadItem.applyInsert({
                            cid: item.cid,
                            logGuid: logContext.uploadLog.first?.guid,                       
                            parentCid: parent?parent.cid:null,
                            size: item.size,
                            type: 1
                        });
                    };
                };
            }
            else if (sourcePath){
                await this.s3.putObjectFrom(`ipfs/${item.cid}`, sourcePath);                
                if (logContext){
                    logContext.uploadItem.applyInsert({
                        logGuid: logContext.uploadLog.first.guid,                        
                        cid: item.cid,                        
                        parentCid: parent.cid,
                        size: item.size,
                        type: 2
                    });
                };
            };
        };
    };
    async putGithub(repo: IGithubRepo, to: {ipfs?:boolean, s3?: boolean}, sourceDir?: string): Promise<IPFSUtils.ICidInfo>{
        let id = Crypto.randomUUID();
        let tmpDir = await Fs.mkdtemp(Path.join(Os.tmpdir(), appPrefix));
        let dir = `${tmpDir}/${id}`;
        mkdirSync(dir);        
        try{
            let targetDir = `${dir}/dir`;
            let targetFile = `${dir}/file.zip`;
            let pinDir = `${targetDir}/${repo.repo}-${repo.commit}`;
            if (sourceDir)
                pinDir = Path.join(pinDir, sourceDir);
            let url = `https://github.com/${repo.org}/${repo.repo}/archive/${repo.commit}.zip`;            
            await download(url, targetFile);
            await Extract(targetFile, { dir: targetDir });
            let name = `${repo.org}/${repo.repo}/${repo.commit}`;
            let result = await this.putDir(pinDir, to, name);

            return result;

        }
        finally{
            try{
                Fs.rm(dir, { recursive: true });
            }
            catch(err){
                console.dir(err)
            }
        };
    };
};