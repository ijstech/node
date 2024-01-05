export declare enum CidCode {
    DAG_PB = 112,
    RAW = 85
}
export interface ICidData {
    cid: string;
    links?: ICidInfo[];
    name?: string;
    size?: number;
    type?: 'dir' | 'file';
    code?: CidCode;
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
