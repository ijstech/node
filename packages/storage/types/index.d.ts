import * as IPFSUtils from '@ijstech/ipfs';
import { IS3Options } from './s3';
export interface IGithubRepo {
    org: string;
    repo: string;
    commit: string;
}
export interface IStorageOptions {
    s3: IS3Options;
    web3Storage: {
        token: string;
    };
    localCache: {
        path: string;
    };
}
export declare class Storage {
    private options;
    private s3;
    private web3Storage;
    constructor(options: IStorageOptions);
    private localCacheExist;
    private getLocalCache;
    private putLocalCache;
    getFileContent(cid: string, filePath: string): Promise<string>;
    syncDirTo(path: string, to: {
        ipfs?: boolean;
        s3?: boolean;
    }, name?: string): Promise<IPFSUtils.ICidInfo>;
    syncGithubTo(repo: IGithubRepo, to: {
        ipfs?: boolean;
        s3?: boolean;
    }, sourceDir?: string): Promise<IPFSUtils.ICidInfo>;
}
