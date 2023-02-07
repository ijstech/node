import { CompleteMultipartUploadCommandOutput, DeleteObjectCommandOutput, ListObjectsV2CommandOutput, PutObjectCommandOutput, HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import { ICidInfo } from '@ijstech/ipfs';
export interface IS3Options {
    region?: string;
    endpoint: string;
    key: string;
    secret: string;
    bucket: string;
}
export declare class S3 {
    private s3;
    private options;
    constructor(options: IS3Options);
    deleteObject(key: string): Promise<DeleteObjectCommandOutput>;
    hasObject(key: string): Promise<boolean>;
    headObject(key: string): Promise<HeadObjectCommandOutput>;
    syncFiles(sourceDir: string, targetDir: string, items: ICidInfo[]): Promise<void>;
    listObjects(params?: {
        prefix?: string;
        maxKeys?: number;
        startAfter?: string;
    }): Promise<ListObjectsV2CommandOutput>;
    getObject(key: string): Promise<string>;
    getObjectSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    putObject(key: string, content: string): Promise<PutObjectCommandOutput>;
    putObjectSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    putObjectFrom(key: string, filePath: string, progressCallback?: any): Promise<CompleteMultipartUploadCommandOutput>;
}
