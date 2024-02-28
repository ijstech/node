import {HttpServer} from '@ijstech/http';
import {S3, Storage} from '@ijstech/storage';
import * as IPFSUtils from '@ijstech/ipfs';
import Koa from 'koa';
import Config from './data/config.js';
import Mime from '@ijstech/mime';
import Path from 'path';
import Fs from 'fs';

Config.localCache = {
    path: Path.join(__dirname, 'cache')
};
const s3 = new S3(Config.s3);
const storage = new Storage(Config);

export type IGetUploadUrlResult = {
    [cid: string]: {
        exists?: boolean,
        url?: string,method?: string,
        headers?: {[key: string]: string}
    }
};
export interface ICidInfo{
    cid: string;
    links?: ICidInfo[];
    name?: string;
    size: number;
    type?: 'dir' | 'file';
};
async function getCidUploadUrl(cid: string): Promise<IGetUploadUrlResult>{
    let exists = await s3.hasObject(`ipfs/${cid}`);
    if (exists){
        return {
            [cid]: {
                exists: true
            }
        };
    };
    let sha256 = IPFSUtils.cidToHash(cid);
    let url = await s3.putObjectSignedUrl(`ipfs/${cid}`, {
        sha256: sha256
    });
    return {
        [cid]: {
            exists: exists,
            url: url,
            method: 'PUT',
            headers: {
                "x-amz-checksum-sha256": sha256
            }
        }
    };
};
async function getUploadUrl(cid: ICidInfo): Promise<IGetUploadUrlResult>{
    let url: string;
    let result: IGetUploadUrlResult = {};
    
    let cidUrl = await getCidUploadUrl(cid.cid);
    result[cid.cid] = cidUrl[cid.cid];
    if (cid.links){
        for (let link of cid.links){
            let linkUrl = await getUploadUrl(link);
            result = {...result, ...linkUrl};
        }
    };
    return result;
};
const server = new HttpServer({
    port:8088
});
server.start();
server.use(async (ctx: Koa.Context)=>{
    if (ctx.method == 'GET' && ctx.url.startsWith('/web/')){
        try{
            let fileName = ctx.url.split('/').pop();
            let mimeType = Mime.getType(fileName);
            if (mimeType)
                ctx.res.setHeader('Content-Type', mimeType);
            let path = Path.join(__dirname, ctx.url);
            let stream = Fs.createReadStream(path);
            ctx.body = stream;
        }
        catch(err){
            ctx.status = 404;
        }
    }
    if (ctx.method == 'GET' && ctx.url.startsWith('/stat/')){
        try{
            let cid = ctx.url.substring(6);
            let info = await storage.getItemInfo(cid);
            ctx.res.setHeader('Content-Type', 'application/json');
            ctx.body = info;
        }
        catch(err){
            ctx.status = 404;
        }
    }
    else if (ctx.method == 'POST' && ctx.url == '/api/ipfs/v0/upload'){
        let req = ctx.request.body;
        let result: IGetUploadUrlResult = await getUploadUrl(req.data);
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.body = result;
    };
});