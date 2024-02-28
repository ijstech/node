import * as IPFSUtils from '@ijstech/ipfs';
import { IS3Options, S3, IPreSignedUrlOptions } from './s3';
import { IDbConnectionOptions } from '@ijstech/types';
export { S3 };
export interface IGithubRepo {
    org: string;
    repo: string;
    commit: string;
}
export interface IStorageOptions {
    s3?: IS3Options;
    localCache?: {
        path: string;
    };
    log?: IDbConnectionOptions;
}
export declare type IItemType = 'stat' | 'ipfs' | 'tmp';
export declare class Storage {
    private options;
    s3: S3;
    private _initDir;
    constructor(options: IStorageOptions);
    private initDir;
    private localCacheExist;
    private getLocalCachePath;
    private getLocalCache;
    private getLocalCacheRaw;
    private putLocalCache;
    getFile(rootCid: string, filePath?: string | string[]): Promise<string>;
    getFileRaw(rootCid: string, filePath?: string | string[]): Promise<Uint8Array>;
    private moveFile;
    getLocalFilePath(rootCid: string, filePath?: string | string[], returnIndex?: boolean, rawFile?: boolean): Promise<string>;
    getUploadUrl(path: string, options?: IPreSignedUrlOptions): Promise<string>;
    putContent(fileContent: string, to?: {
        ipfs?: boolean;
        s3?: boolean;
    }, source?: string): Promise<IPFSUtils.ICidInfo>;
    putFile(filePath: string, to?: {
        ipfs?: boolean;
        s3?: boolean;
    }, source?: string): Promise<IPFSUtils.ICidInfo>;
    getItemInfo(cid: string): Promise<IPFSUtils.ICidData>;
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
