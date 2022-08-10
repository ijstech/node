/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import IPFS from './ipfs.js';
import {promises as Fs} from 'fs';

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
}
export async function hashDir(data: ICidInfo, version?: number): Promise<string>{
    return await IPFS.hashDir(data, version)
}
export async function hashContent(content: string| Buffer, version?: number):Promise<string>{    
    return await IPFS.hashContent(content, version);
}
export async function hashFile(filePath: string, version?: number):Promise<string>{
    let content = await Fs.readFile(filePath);
    return await hashContent(content, version);
};