/// <reference types="node" />
import { ICidData, ICidInfo } from './types';
export declare const CODE_DAG_PB = 112;
export declare const CODE_RAW = 85;
export declare function parse(cid: string, bytes?: Uint8Array): ICidData;
export interface IHashChunk {
    size: number;
    dataSize: number;
    cid: {
        toString: () => string;
    };
}
export declare function hashChunk(data: Buffer, version?: number): Promise<IHashChunk>;
export declare function hashChunks(chunks: IHashChunk[], version?: number): Promise<ICidData>;
export declare function hashItems(items?: ICidInfo[], version?: number): Promise<ICidData>;
export declare function hashDir(dirPath: string, version?: number): Promise<ICidData>;
export declare function hashContent(content: string | Buffer, version?: number): Promise<ICidData>;
export declare function hashFile(filePath: string, version?: number): Promise<ICidData>;
export declare function cidToHash(cid: string): string;
