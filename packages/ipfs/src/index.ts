/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import IPFS from './ipfs.js';
import {promises as Fs} from 'fs';
import Path from 'path';

export interface ICidInfo {
    cid: string;
    links?: ICidInfo[];
    name: string;
    size: number;
    type?: 'dir'|'file'
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
}{
    return IPFS.parse(cid);
};
export async function hashItems(items?: ICidInfo[], version?: number): Promise<ICidInfo>{    
    return await IPFS.hashItems(items || [], version);
};
export async function hashDir(dirPath: string, version?: number): Promise<ICidInfo>{    
    let files = await Fs.readdir(dirPath);
    let items = [];
    for (let i = 0; i < files.length; i ++){
        let file = files[i];
        let path = Path.join(dirPath, file);
        let stat = await Fs.stat(path)
        if (stat.isDirectory()){
            let result = await hashDir(path, version);
            result.name = file;
            items.push(result);
        }
        else{
            let result = await hashFile(path);
            items.push({
                cid: result.cid,
                name: file,
                size: result.size,
                type: 'file'
            })
        }
    };
    let result = await hashItems(items);    
    return {
        cid: result.cid,        
        name: '',
        size: result.size,
        type: 'dir',
        links: items
    };
};
export async function hashContent(content: string| Buffer, version?: number):Promise<string>{    
    return await IPFS.hashContent(content, version);
}
export async function hashFile(filePath: string, version?: number):Promise<{cid: string, size:number}>{
    let content = await Fs.readFile(filePath);
    return {
        cid: await hashContent(content, version),
        size: content.length
    };
};