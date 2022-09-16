import {promises as Fs, createWriteStream, unlink, mkdirSync} from 'fs';
import Path from 'path';
import Https from 'https';
import Crypto from 'crypto';
import Os from 'os';
import * as IPFSUtils from '@ijstech/ipfs';
import {IS3Options, S3} from './s3';
import Extract from 'extract-zip';
import { Web3Storage, getFilesFromPath} from 'web3.storage';
import {IDbConnectionOptions} from '@ijstech/types';
import Context from './log.pdm';

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
    web3Storage?: {endpoint?: string,token: string};
    localCache?: {path: string};
    log?: IDbConnectionOptions;
};
export class Storage{
    private options: IStorageOptions;
    private s3: S3;
    private web3Storage: Web3Storage;
    private _initDir: boolean;
    private logContext: Context;

    constructor(options: IStorageOptions){
        this.options = options;
        if (this.options.s3)
            this.s3 = new S3(this.options.s3);        
        if (this.options.web3Storage?.token)
            this.web3Storage = new Web3Storage({ token: this.options.web3Storage.token});
        if (this.options.log)
            this.logContext = new Context(this.options.log);
    };
    private async initDir(){
        if (!this._initDir){
            await Fs.mkdir(Path.join(this.options.localCache.path, 'stat'), { recursive: true });
            await Fs.mkdir(Path.join(this.options.localCache.path, 'ipfs'), { recursive: true });
            this._initDir = true;
        };
    };
    private async localCacheExist(key: string): Promise<boolean>{
        if (this.options.localCache?.path){            
            await this.initDir();
            try{
                let filePath = Path.join(this.options.localCache.path, key);
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
    private async getLocalCache(key: string): Promise<string>{
        if (this.options.localCache?.path){            
            await this.initDir();
            let filePath = Path.join(this.options.localCache.path, key);
            let content = await Fs.readFile(filePath, 'utf8');
            return content;
        }
    };
    private async putLocalCache(key: string, content: string){
        if (this.options.localCache?.path){
            await this.initDir();
            let filePath = Path.join(this.options.localCache.path, key);
            await Fs.writeFile(filePath, content);
        };
    };
    async getFileContent(cid: string, filePath: string|string[]): Promise<string>{
        if (typeof(filePath) == 'string' && filePath[0] == '/')
            filePath = filePath.substring(1);
        let key = `stat/${cid}`;
        let paths: string[];
        if (Array.isArray(filePath))
            paths = filePath
        else
            paths = filePath.split('/');
        let item:IPFSUtils.ICidInfo;
        let localCache: boolean;
        if (await this.localCacheExist(key)){
            item = JSON.parse(await this.getLocalCache(key))
            localCache = true;
        }
        else if (this.s3){
            let content = await this.s3.getObject(key)
            item = JSON.parse(content);
            if ((await IPFSUtils.hashItems(item.links)).cid != cid)
                throw new Error('CID not match');
            await this.putLocalCache(key, content);
        }
        
        let path = paths.shift();
        for (let i = 0; i < item.links.length; i++){
            if (item.links[i].name == path){
                if (item.links[i].type == 'dir')
                    return await this.getFileContent(item.links[i].cid, paths)
                else{
                    let content = await this.s3.getObject(`ipfs/${item.links[i].cid}`);
                    let cid = await IPFSUtils.hashContent(content);
                    if (cid != item.links[i].cid)
                        throw new Error('CID not match');
                    await this.putLocalCache(`ipfs/${item.links[i].cid}`, content);
                    return content;
                };
            };
        };
    };
    async syncDirTo(path: string, to: {ipfs?:boolean, s3?: boolean}, name?: string): Promise<IPFSUtils.ICidInfo>{
        let hash = await IPFSUtils.hashDir(path, 1);        
        let cid: string;
        if (to.ipfs && this.web3Storage){
            let items = await Fs.readdir(path);
            for (let i = 0; i < items.length; i ++)
                items[i] = path + '/' + items[i];
            const files = await getFilesFromPath(items);
            cid = await this.web3Storage.put(files, {
                name: name
            });  
            if (cid != hash.cid)
                throw new Error('CID not match');
        };
        if (to.s3){   
            await this.syncItemToS3(path, hash);
        };
        return hash;
    };
    async syncItemToS3(sourcePath: string, item: IPFSUtils.ICidInfo, parent?: IPFSUtils.ICidInfo){
        let key: string;
        if (item.type == 'dir')
            key = `stat/${item.cid}`
        else
            key = `ipfs/${item.cid}`;
        let exists = await this.s3.hasObject(key);
        if (!exists){
            if (item.type == 'dir'){
                if (item.links?.length > 0){
                    for (let i = 0; i < item.links.length; i ++)
                        await this.syncItemToS3(Path.join(sourcePath, item.links[i].name), item.links[i], item);

                    let data: IPFSUtils.ICidInfo = JSON.parse(JSON.stringify(item));
                    for (let i = 0; i < data.links.length; i ++)
                        delete data.links[i].links;
                    await this.s3.putObject(key, JSON.stringify(data)); 
                    if (this.logContext){
                        this.logContext.storageLog.applyInsert({
                            cid: data.cid,
                            createDate: new Date(),
                            parentCid: parent?parent.cid:null,
                            size: data.size,
                            type: 1
                        });
                        await this.logContext.save();
                    }
                }
            }
            else{
                await this.s3.putObjectFrom(key, sourcePath);
                if (this.logContext){
                    this.logContext.storageLog.applyInsert({
                        cid: item.cid,
                        createDate: new Date(),
                        parentCid: parent.cid,
                        size: item.size,
                        type: 2
                    });                
                    await this.logContext.save();
                }
            };
        };
    };
    async syncGithubTo(repo: IGithubRepo, to: {ipfs?:boolean, s3?: boolean}, sourceDir?: string): Promise<IPFSUtils.ICidInfo>{
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
            let result = await this.syncDirTo(pinDir, to, name);

            return result;

        }
        finally{
            try{
                Fs.rm(dir, { recursive: true });
            }
            catch(err){
                console.dir(err)
            }
        }
    };
};