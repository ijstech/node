/// <reference types="node" />
export interface ICidInfo {
    cid: string;
    links?: ICidInfo[];
    name: string;
    size: number;
    type?: 'dir' | 'file';
}
export declare function parse(cid: string): {
    code: number;
    version: number;
    multihash: {
        code: number;
        size: number;
        digest: Uint8Array;
        bytes: Uint8Array;
    };
    bytes: Uint8Array;
};
export declare function hashItems(items?: ICidInfo[], version?: number): Promise<ICidInfo>;
export declare function hashDir(dirPath: string, version?: number): Promise<ICidInfo>;
export declare function hashContent(content: string | Buffer, version?: number): Promise<{
    cid: string;
    size: number;
}>;
export declare function hashFile(filePath: string, version?: number, options?: {
    rawLeaves?: boolean;
    minChunkSize?: number;
    maxChunkSize?: number;
    avgChunkSize?: number;
    maxChildrenPerNode?: number;
}): Promise<{
    cid: string;
    size: number;
}>;
