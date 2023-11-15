/// <reference types="node" />
export declare const DAG_PB = 112;
export interface ICidData {
    cid: string;
    links?: ICidInfo[];
    name?: string;
    size?: number;
    type?: 'dir' | 'file';
    code?: number;
    multihash?: any;
    bytes?: Uint8Array;
}
export interface ICidInfo {
    cid: string;
    links?: ICidInfo[];
    name?: string;
    size?: number;
    type?: 'dir' | 'file';
}
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
