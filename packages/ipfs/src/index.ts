/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import IPFS from './ipfs.js';
import { promises as Fs, createReadStream} from 'fs';
import Path from 'path';

export interface ICidInfo {
    cid: string;
    links?: ICidInfo[];
    name: string;
    size: number;
    type?: 'dir' | 'file'
}
export function parse(cid: string): {
    code: number,
    version: number,
    multihash: {
        code: number,
        size: number,
        digest: Uint8Array,
        bytes: Uint8Array
    },
    bytes: Uint8Array
} {
    return IPFS.parse(cid);
};
export async function hashItems(items?: ICidInfo[], version?: number): Promise<ICidInfo> {
    return await IPFS.hashItems(items || [], version);
};
export async function hashDir(dirPath: string, version?: number): Promise<ICidInfo> {
    if (version == undefined)
        version = 1;
    let files = await Fs.readdir(dirPath);
    let items = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let path = Path.join(dirPath, file);
        let stat = await Fs.stat(path)
        if (stat.isDirectory()) {
            let result = await hashDir(path, version);
            result.name = file;
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
    let result = await hashItems(items, version);
    return {
        cid: result.cid,
        name: '',
        size: result.size,
        type: 'dir',
        links: items
    };
};
export async function hashContent(content: string | Buffer, version?: number): Promise<string> {
    if (version == undefined)
        version = 1;
    // return await IPFS.hashContent(content, version);
    let cid: string;
    if (content.length == 0){
        return await IPFS.hashContent('', version);  
    }
    if (version == 1){
        cid = await IPFS.hashFile(content, version, { //match web3.storage default parameters, https://github.com/web3-storage/web3.storage/blob/3f6b6d38de796e4758f1dffffe8cde948d2bb4ac/packages/client/src/lib.js#L113
            rawLeaves: true,
            maxChunkSize: 1048576,
            maxChildrenPerNode: 1024
        })
    }
    else
        cid = await IPFS.hashFile(content, version);
    return cid;
}
// test start from here
export async function hashFile(filePath: string, version?: number, options?: {
    rawLeaves?: boolean,
    minChunkSize?: number,
    maxChunkSize?: number,
    avgChunkSize?: number,
    maxChildrenPerNode?: number
}): Promise<{cid: string, size: number}> {
    if (version == undefined)
        version = 1;
    let size: number;
    let stat = await Fs.stat(filePath);
    size = stat.size;    
    let file = createReadStream(filePath);
    let cid: string;
    if (size == 0)
        cid = await IPFS.hashContent('', version);    
    else if (version == 1){
        cid = await IPFS.hashFile(file, version, IPFS.mergeOptions({ //match web3.storage default parameters, https://github.com/web3-storage/web3.storage/blob/3f6b6d38de796e4758f1dffffe8cde948d2bb4ac/packages/client/src/lib.js#L113
            rawLeaves: true,
            maxChunkSize: 1048576,
            maxChildrenPerNode: 1024
        }, options || {}))
    }
    else
        cid = await IPFS.hashFile(file, version);
    return {
        cid: cid,
        size: size
    };
}