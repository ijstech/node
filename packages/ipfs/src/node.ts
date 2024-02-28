/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import IPFS from './ipfs.js';
import { promises as Fs, createReadStream} from 'fs';
import Path from 'path';
import { ICidData, ICidInfo} from './types';
import { hashItems, hashContent} from './utils';

export async function hashFile(file: string | Uint8Array, options?:{version?: number, chunkSize?: number}): Promise<ICidData> {
    let version = 1;
    if (options?.version === 0)
        version = 0;
    if (file instanceof Uint8Array){
        return hashContent(file, version);    
    }
    else{
        let size: number;
        let stat = await Fs.stat(file);
        let fileStream: any;
        size = stat.size;   
        if (size == 0){
            return {
                cid: version == 1? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku':'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH', 
                type: 'file',
                code: version == 1? 0x55: 0x70,
                size: 0
            };
        };
        if (version == 1){
            let chunkSize = options?.chunkSize || 1048576;
            fileStream = createReadStream(file, {highWaterMark: chunkSize})
        }
        else
            fileStream = createReadStream(file, {highWaterMark: 262144});
        
        return IPFS.hashContent(fileStream, version);
    };    
};
export async function hashDir(dirPath: string, version?: number): Promise<ICidData> {
    if (version == undefined)
        version = 1;
    let files = await Fs.readdir(dirPath);
    let items: ICidData[] = [];
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
                let result = await hashFile(path, {version: version});
                result.name = file;
                items.push(result)
            }
            catch(err){
                console.dir(path)
            }
        }
    };
    return await hashItems(items, version);
};