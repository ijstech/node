/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { ICidData, ICidInfo } from './types';
export declare function parse(cid: string, bytes?: Uint8Array): ICidData;
export interface IHashChunk {
    size: number;
    dataSize: number;
    cid: {
        toString: () => string;
    };
}
export declare function hashChunk(data: Buffer, version?: number): Promise<IHashChunk>;
export declare function hashChunks(chunks: IHashChunk[] | ICidInfo[], version?: number): Promise<ICidData>;
export declare function hashItems(items?: ICidInfo[], version?: number): Promise<ICidData>;
export declare function hashContent(content: string | Uint8Array, version?: number): Promise<ICidData>;
export declare function hashFile(file: File | Uint8Array, version?: number): Promise<ICidData>;
export declare function cidToHash(cid: string): string;
