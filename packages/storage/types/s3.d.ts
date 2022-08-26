import S3Client from 'aws-sdk/clients/s3.js';
import { ICidInfo } from '@ijstech/ipfs';
export interface IS3Options {
    endpoint: string;
    key: string;
    secret: string;
    bucket: string;
}
interface IListObjectsResult {
    error?: any;
    data?: S3Client.Object[];
}
export declare class S3 {
    private s3;
    private options;
    constructor(options: IS3Options);
    hasObject(key: string): Promise<boolean>;
    syncFiles(sourceDir: string, targetDir: string, items: ICidInfo[]): Promise<void>;
    listObjects(prefix?: string, maxKeys?: number, startAfter?: string): Promise<IListObjectsResult>;
    getObject(key: string): Promise<string>;
    putObject(key: string, content: string, acl?: S3Client.ObjectCannedACL): Promise<S3Client.Types.PutObjectOutput>;
    putObjectFrom(key: string, filePath: string, acl?: S3Client.ObjectCannedACL): Promise<unknown>;
}
export {};
