/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

// @ts-ignore
import IPFS from './ipfs.js';
import { CidCode, ICidData, ICidInfo } from './types';

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
        type: result.type == 'directory'? 'dir' : result.type =='file'?'file': result.code==CidCode.RAW?'file':undefined,
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
export async function hashChunks(chunks: IHashChunk[] | ICidInfo[], version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;
    return IPFS.hashChunks(chunks, version);
};
export async function hashItems(items?: ICidInfo[], version?: number): Promise<ICidData> {
    return await IPFS.hashItems(items || [], version);
};
export async function hashContent(content: string | Uint8Array, version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;  
    if (content.length == 0){
        return {
            cid: version == 1? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku':'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH', 
            type: 'file',
            code: version == 1? 0x55: 0x70,
            size: 0
        };
    }   
    return IPFS.hashContent(content, version);
};
export async function hashFile(file: File | Uint8Array, version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;
    if (file instanceof File){
        if (file.size == 0)
            return await IPFS.hashContent('', version);

        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.addEventListener('error', (event)=>{
                reject('Error occurred reading file');
            });
            reader.addEventListener('load', async (event: any) => {
                const data = new Uint8Array(event.target.result);
                let result = await IPFS.hashContent(data, version);
                resolve(result);
            }); 
        });
    }
    else
        return this.hashContent(file, version);    
};
export function cidToHash(cid: string): string {
    return IPFS.cidToHash(cid);
};