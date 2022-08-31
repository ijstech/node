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
export declare function hashContent(content: string | Buffer, version?: number): Promise<string>;
export declare function hashFile(filePath: string, version?: number): Promise<{
    cid: string;
    size: number;
}>;
export declare function hashFile1(content1: any, options?: any): Promise<any>;
