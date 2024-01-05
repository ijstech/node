/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import IPFS from './ipfs.js';
import { promises as Fs, createReadStream} from 'fs';
import Path from 'path';
import { ICidData, ICidInfo } from './types';

export const CODE_DAG_PB = 0X70;
export const CODE_RAW = 0X55;

export function parse(cid: string, bytes?: Uint8Array): ICidData {
    let result = IPFS.parse(cid, bytes);
    let links: ICidInfo[] = [];
    if (result.links){
        for (let i = 0; i < result.links.length; i++) {
            let link = result.links[i];
            links.push({
                cid: link.Hash.toString(),
                name: link.Name,
                size: link.Tsize
            });
        }
    };
    return {
        cid: cid,
        size: result.size,
        code: result.code,
        type: result.type == 'directory'? 'dir' : result.type =='file'?'file': undefined,
        multihash: result.multihash,
        links: links,
        bytes: result.bytes
    };
};
export interface IHashChunk {
    size: number,
    dataSize: number,
    cid: {
        toString: () => string
    }
};
export async function hashChunk(data: Buffer, version?: number): Promise<IHashChunk> {
    if (version == undefined)
        version = 1;
    return IPFS.hashChunk(data, version);
};
export async function hashChunks(chunks: IHashChunk[], version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;
    return IPFS.hashChunks(chunks, version);
};
export async function hashItems(items?: ICidInfo[], version?: number): Promise<ICidData> {
    return await IPFS.hashItems(items || [], version);
};
export async function hashDir(dirPath: string, version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;
    let files = await Fs.readdir(dirPath);
    let items: ICidInfo[] = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let path = Path.join(dirPath, file);
        let stat = await Fs.stat(path)
        if (stat.isDirectory()) {
            let result = await hashDir(path, version);
            result.name = file;
            result.type = 'dir';
            items.push(result);
        }
        else {
            try{
                let result = await hashFile(path, version);
                items.push({
                    cid: result.cid,
                    name: file,
                    size: result.size,
                    type: 'file'
                })
            }
            catch(err){
                console.dir(path)
            }
        }
    };
    return await hashItems(items, version);
    // return {
    //     cid: result.cid,
    //     name: '',
    //     size: result.size,
    //     type: 'dir',
    //     links: items,
    //     code: result.code,

    // };
};
export async function hashContent(content: string | Buffer, version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;  
    if (content.length == 0){
        return {
            cid: version == 1? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku':'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH', 
            size: 0
        };
    }   
    return IPFS.hashFile(content, version);
};
export async function hashFile(filePath: string, version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;
    let size: number;
    let stat = await Fs.stat(filePath);
    let file: any;
    size = stat.size;   
    if (size == 0){
        return {
            cid: version == 1? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku':'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH', 
            size: 0
        };
    };
    if (version == 1)
        file = createReadStream(filePath, {highWaterMark: 1048576})
    else
        file = createReadStream(filePath, {highWaterMark: 262144});
    return IPFS.hashFile(file, version);
};
export function cidToHash(cid: string): string {
    return IPFS.cidToHash(cid);
};