import { CompleteMultipartUploadCommandOutput, ListObjectsV2CommandOutput, PutObjectCommandOutput, HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import * as IPFSUtils from '@ijstech/ipfs';
export interface IS3Options {
    region?: string;
    endpoint: string;
    key: string;
    secret: string;
    bucket: string;
}
export interface IPreSignedUrlOptions {
    expiresInSeconds?: number;
    sha256?: string;
}
export declare class S3 {
    private s3;
    private options;
    constructor(options: IS3Options);
    copyObject(fromKey: string, toKey: string): Promise<boolean>;
    deleteObject(key: string): Promise<boolean>;
    hasObject(key: string): Promise<boolean>;
    headObject(key: string): Promise<HeadObjectCommandOutput>;
    syncFiles(sourceDir: string, targetDir: string, items: IPFSUtils.ICidInfo[]): Promise<void>;
    listObjects(params?: {
        prefix?: string;
        maxKeys?: number;
        startAfter?: string;
    }): Promise<ListObjectsV2CommandOutput>;
    getObject(key: string): Promise<string>;
    downloadObject(key: string, targetFilePath: string): Promise<boolean>;
    getObjectSignedUrl(key: string, options?: IPreSignedUrlOptions): Promise<string>;
    moveObject(fromKey: string, toKey: string): Promise<boolean>;
    putObject(key: string, content: string): Promise<PutObjectCommandOutput>;
    putObjectSignedUrl(key: string, options?: IPreSignedUrlOptions): Promise<string>;
    putObjectFrom(key: string, filePath: string, progressCallback?: any): Promise<CompleteMultipartUploadCommandOutput>;
}
