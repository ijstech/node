import {promises as Fs, createWriteStream, unlink, mkdirSync} from 'fs';
import Path from 'path';
import Https from 'https';
import Crypto from 'crypto';
import Os from 'os';
import * as IPFSUtils from '@ijstech/ipfs';
import {IS3Options, S3} from './s3';
import Extract from 'extract-zip';
import { Web3Storage, getFilesFromPath} from 'web3.storage';
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
};
export class Storage{
    private options: IStorageOptions;
    private s3: S3;
    private web3Storage: Web3Storage;
    private _initDir: boolean;

    constructor(options: IStorageOptions){
        this.options = options;
        if (this.options.s3)
            this.s3 = new S3(this.options.s3);        
        if (this.options.web3Storage?.token)
            this.web3Storage = new Web3Storage({ token: this.options.web3Storage.token});
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
    async getFileContent(cid: string, filePath: string): Promise<string>{
        if (filePath[0] == '/')
            filePath = filePath.substring(1);
        let key = `stat/${cid}`;
        let paths = filePath.split('/');
        let item:IPFSUtils.ICidInfo;
        let localCache: boolean;
        if (await this.localCacheExist(key)){
            item = JSON.parse(await this.getLocalCache(key))
            localCache = true;
        }
        else if (this.s3){
            let content = await this.s3.getObject(key)
            item = JSON.parse(content);
            await this.putLocalCache(key, content);
        }
        let items: IPFSUtils.ICidInfo[];
        for (let i = 0; i < paths.length; i ++){
            let items = item.links;     
            if (!localCache){
                let cid = (await IPFSUtils.hashItems(items)).cid;
                if (cid != item.cid)
                    throw new Error('CID not match');
            }
            for (let k = 0; k < items.length; k ++){
                if (items[k].name == paths[i]){
                    if (items[k].type == 'file'){
                        let key = `ipfs/${items[k].cid}`;
                        let content: string;
                        if (await this.localCacheExist(key))
                            content = await this.getLocalCache(key)
                        else{
                            content = await this.s3.getObject(key);
                            let cid = await IPFSUtils.hashContent(content);
                            if (cid != items[k].cid)
                                throw new Error('CID not match');
                            await this.putLocalCache(key, content);
                        };
                        return content;
                    }
                    else{
                        item = items[k];
                        break;
                    };
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
            if (cid != hash.cid){                
                console.dir('Error: CID not match');
                console.dir(cid);
                console.dir(hash.cid);
                // throw new Error('CID not match');
            }
        };
        if (to.s3){
            await this.putLocalCache('stat/' + hash.cid, JSON.stringify(hash, null, 4));
            let exists = await this.s3.hasObject(`stat/${hash.cid}`,);
            if (!exists)
                await this.s3.putObject(`stat/${hash.cid}`, JSON.stringify(hash));
            await this.s3.syncFiles(path, 'ipfs', hash.links);
        };
        return hash;
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