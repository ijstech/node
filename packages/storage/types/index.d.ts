import * as IPFSUtils from '@ijstech/ipfs';
import { IS3Options } from './s3';
import { IDbConnectionOptions } from '@ijstech/types';
export interface IGithubRepo {
    org: string;
    repo: string;
    commit: string;
}
export interface IStorageOptions {
    s3?: IS3Options;
    web3Storage?: {
        endpoint?: string;
        token: string;
    };
    localCache?: {
        path: string;
    };
    log?: IDbConnectionOptions;
}
export declare type IItemType = 'stat' | 'ipfs' | 'tmp';
export declare class Storage {
    private options;
    private s3;
    private _web3Storage;
    private _initDir;
    constructor(options: IStorageOptions);
    private get web3Storage();
    private initDir;
    private localCacheExist;
    private getLocalCachePath;
    private getLocalCache;
    private putLocalCache;
    getFile(rootCid: string, filePath?: string | string[]): Promise<string>;
    private moveFile;
    getLocalFilePath(rootCid: string, filePath?: string | string[], returnIndex?: boolean): Promise<string>;
    getUploadUrl(path: string, expiresInSeconds?: number): Promise<string>;
    putContent(fileContent: string, to?: {
        ipfs?: boolean;
        s3?: boolean;
    }, source?: string): Promise<IPFSUtils.ICidInfo>;
    putFile(filePath: string, to?: {
        ipfs?: boolean;
        s3?: boolean;
    }, source?: string): Promise<IPFSUtils.ICidInfo>;
    getItem(cid: string): Promise<string>;
    putItems(items: IPFSUtils.ICidInfo[], source?: string): Promise<IPFSUtils.ICidInfo>;
    putDir(path: string, to?: {
        ipfs?: boolean;
        s3?: boolean;
    }, source?: string): Promise<IPFSUtils.ICidInfo>;
    private putToS3;
    putGithub(repo: IGithubRepo, to: {
        ipfs?: boolean;
        s3?: boolean;
    }, sourceDir?: string): Promise<IPFSUtils.ICidInfo>;
}
