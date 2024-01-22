export enum CidCode {
    DAG_PB = 0X70,
    RAW = 0X55
};
export interface ICidData {
    cid: string;
    links?: ICidInfo[];
    name?: string;
    size: number;
    type?: 'dir' | 'file';
    code?: CidCode; //'raw' | 'dag-pb'
    multihash?: any;
    bytes?: Uint8Array;
};
export interface ICidInfo{
    cid: string;
    links?: ICidInfo[];
    name?: string;
    size: number;
    type?: 'dir' | 'file';
};