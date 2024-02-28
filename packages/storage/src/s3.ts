import {S3Client, CompleteMultipartUploadCommandOutput, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, 
    ListObjectsV2Command, ListObjectsV2CommandOutput, CopyObjectCommand, PutObjectCommand, PutObjectCommandOutput, HeadObjectCommandOutput} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream} from 'fs';
import Mime from '@ijstech/mime';
import Path from 'path';
import * as IPFSUtils from '@ijstech/ipfs';

export interface IS3Options {
    region?: string;
    endpoint: string;
    key: string;
    secret: string;
    bucket: string;
};
export interface IPreSignedUrlOptions {
    expiresInSeconds?: number;
    sha256?: string;
};
export class S3 {
    private s3: S3Client;
    private options: IS3Options;

    constructor(options: IS3Options) {
        this.options = options;
        this.s3 = new S3Client({
            region: options.region || 'auto',
            endpoint: options.endpoint,
            credentials: {
                secretAccessKey: options.secret,
                accessKeyId: options.key
            }
        });
    };
    async copyObject(fromKey: string, toKey: string): Promise<boolean>{
        try{
            let exists = await this.hasObject(toKey);
            if (!exists){
                const command = new CopyObjectCommand({
                    Bucket: this.options.bucket,
                    CopySource: this.options.bucket + '/' + fromKey,
                    Key: toKey
                });
                let result = await this.s3.send(command);
                if (!result.CopyObjectResult.ETag)
                    return false;
            };
            return true;
        }
        catch(err){
            console.dir(err);
            return false;
        };        
    };
    async deleteObject(key: string): Promise<boolean>{
        try{
            const command = new DeleteObjectCommand({
                Bucket: this.options.bucket,
                Key: key
            });
            let result = await this.s3.send(command);
            return true;
        }
        catch(err){
            return false;
        };
    };
    async hasObject(key: string): Promise<boolean>{
        try{
            await this.headObject(key);
            return true;
        }
        catch(err){
            return false;
        };
    };
    headObject(key: string): Promise<HeadObjectCommandOutput>{
        const command = new HeadObjectCommand({
            Bucket: this.options.bucket,
            Key: key
        });
        return this.s3.send(command);
    };
    async syncFiles(sourceDir: string, targetDir: string, items: IPFSUtils.ICidInfo[]){
        for (let i = 0; i < items.length; i ++){
            let item = items[i];
            if (item.type == 'dir')
                await this.syncFiles(Path.join(sourceDir, item.name), targetDir, item.links)
            else if (item.type == 'file'){
                let key = `${targetDir}/${item.cid}`
                let exists = await this.hasObject(key);
                if (!exists)
                    await this.putObjectFrom(key, Path.join(sourceDir, item.name));
            };
        };
    };
    async listObjects(params?: {prefix?: string, maxKeys?: number, startAfter?: string}): Promise<ListObjectsV2CommandOutput> {
        const command = new ListObjectsV2Command({
            Bucket: this.options.bucket,
            MaxKeys: params?.maxKeys || 1000,
            Prefix: params?.prefix || '',
            StartAfter: params?.startAfter || ''
        });
        let result = await this.s3.send(command);
        return result;
    };
    async getObject(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.options.bucket,
            Key: key
        });
        let result = await this.s3.send(command);
        return result.Body.transformToString('utf-8');
    };
    async getObjectRaw(key: string): Promise<Uint8Array> {
        const command = new GetObjectCommand({
            Bucket: this.options.bucket,
            Key: key
        });
        let result = await this.s3.send(command);
        return await result.Body.transformToByteArray();;
    };
    async downloadObject(key: string, targetFilePath: string): Promise<boolean> {
        try{
            const command = new GetObjectCommand({
                Bucket: this.options.bucket,            
                Key: key
            });
            let result = await this.s3.send(command);
            if (result.Body){
                await pipeline(result.Body as Readable, createWriteStream(targetFilePath))
                return true;
            };
            return false;
        }
        catch(err){
            return false
        }        
    };
    getObjectSignedUrl(key: string, options?: IPreSignedUrlOptions): Promise<string>{
        return getSignedUrl(this.s3, new GetObjectCommand({Bucket: this.options.bucket, Key: key}), { expiresIn: options?.expiresInSeconds || 3600 })
    };
    async moveObject(fromKey: string, toKey: string): Promise<boolean>{
        try{
            let result = await this.copyObject(fromKey, toKey);
            if (!result)
                return false;
            return this.deleteObject(fromKey);
        }
        catch(err){
            return false;
        };        
    };
    async putObject(key: string, content: string): Promise<PutObjectCommandOutput> {
        let cid = await IPFSUtils.hashContent(content);
        if (cid.code == IPFSUtils.CidCode.DAG_PB){
            let chunkSize = 1048576;
            let offset = 0  
            const size = Math.ceil(content.length/chunkSize);
            for (let i = 0; i < size; i++) {
                let chunk = cid.links[i];
                let exists = await this.hasObject(`ipfs/${chunk.cid}`);
                if (!exists){
                    let data = content.substr(offset, chunkSize);
                    offset += chunkSize;                    
                    await this.putObjectRaw(`ipfs/${chunk.cid}`, Buffer.from(data), IPFSUtils.cidToHash(chunk.cid));
                };
            };
            let command = new PutObjectCommand({
                Bucket: this.options.bucket,
                Key: key,
                ContentType: 'application/octet-stream',
                ChecksumSHA256: IPFSUtils.cidToHash(cid.cid),
                Body: cid.bytes
            });
            return this.s3.send(command);
        }
        else{
            const command = new PutObjectCommand({
                Bucket: this.options.bucket,
                Key: key,
                ContentType: Mime.getType(key) || 'application/octet-stream',
                ChecksumSHA256: IPFSUtils.cidToHash(cid.cid),
                Body: content
            });
            return this.s3.send(command);
        };
    };
    async putObjectRaw(key: string, content: Uint8Array, hash: string): Promise<PutObjectCommandOutput> {
        const command = new PutObjectCommand({
            Bucket: this.options.bucket,
            Key: key,
            ContentType: Mime.getType(key) || 'application/octet-stream',
            ChecksumSHA256: hash,
            Body: content
        });
        return this.s3.send(command);
    };
    putObjectSignedUrl(key: string, options?: IPreSignedUrlOptions): Promise<string>{
        return getSignedUrl(this.s3, new PutObjectCommand({
                Bucket: this.options.bucket, 
                Key: key,
                ContentType: Mime.getType(key) || 'application/octet-stream',                
                // ContentLength: options?.size?options.size:undefined,
                ChecksumSHA256: options?.sha256?options.sha256:undefined                
            }), { 
                unhoistableHeaders: new Set(['x-amz-checksum-sha256','content-length']),
                expiresIn: options?.expiresInSeconds || 3600
        })
    };
    putObjectFrom(key: string, filePath: string, progressCallback?: any): Promise<CompleteMultipartUploadCommandOutput> {
        let fileStream = createReadStream(filePath);
        let params = { Bucket: this.options.bucket, Key: key, ContentType: Mime.getType(filePath), Body: fileStream };
        let upload = new Upload({
            client: this.s3,
            partSize: 1024 * 1024 * 1024,
            queueSize: 10,
            params: params
        });
        upload.on("httpUploadProgress", (progress) => {
            if (progressCallback)
                progressCallback(progress);
        });        
        return upload.done();
    };
};