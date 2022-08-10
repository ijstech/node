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
export declare function hashDir(data: ICidInfo, version?: number): Promise<string>;
export declare function hashContent(content: string | Buffer, version?: number): Promise<string>;
export declare function hashFile(filePath: string, version?: number): Promise<string>;
