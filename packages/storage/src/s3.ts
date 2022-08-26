import S3Client from 'aws-sdk/clients/s3.js';
import { createReadStream } from 'fs';
import Mime from '@ijstech/mime';
import Path from 'path';
import {ICidInfo} from '@ijstech/ipfs';

export interface IS3Options {
    endpoint: string;
    key: string;
    secret: string;
    bucket: string;
};
interface IListObjectsResult {
    error?: any;
    data?: S3Client.Object[];
};
export class S3 {
    private s3: S3Client;
    private options: IS3Options;

    constructor(options: IS3Options) {
        this.options = options;
        this.s3 = new S3Client({
            endpoint: options.endpoint,
            accessKeyId: options.key,
            secretAccessKey: options.secret
        });
    };
    async hasObject(key: string): Promise<boolean>{
        return new Promise((resolve, reject)=>{
            this.s3.headObject({
                Bucket: this.options.bucket,
                Key: key
            }, (err, res)=>{
                if (err)
                    return resolve(false)
                else
                    return resolve(true);
            });
        });
    };
    async syncFiles(sourceDir: string, targetDir: string, items: ICidInfo[]){
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
    async listObjects(prefix?: string, maxKeys?: number, startAfter?: string): Promise<IListObjectsResult> {
        return await this.s3.listObjectsV2({
            Bucket: this.options.bucket,
            MaxKeys: maxKeys || 1000,
            Prefix: prefix || '',
            StartAfter: startAfter || ''
        }).promise().then((data) => {
            return {
                data: data.Contents
            }
        }).catch((err) => {
            return {
                error: err
            }
        })
    };
    async getObject(key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.s3.getObject({
                Bucket: this.options.bucket,
                Key: key,
            }, (err, res) => {                
                if (err)
                    return reject(err.message)
                resolve(res.Body.toString('utf-8'));
            })
        })
    };
    async putObject(key: string, content: string, acl?: S3Client.ObjectCannedACL): Promise<S3Client.Types.PutObjectOutput> {
        return new Promise((resolve) => {
            this.s3.putObject({
                Bucket: this.options.bucket,
                Key: key,
                ACL: acl,
                ContentType: Mime.getType(key) || 'application/octet-stream',
                Body: content
            }, (err, res) => {
                resolve(res);
            })
        })
    };
    async putObjectFrom(key: string, filePath: string, acl?: S3Client.ObjectCannedACL) {
        return new Promise((resolve, reject) => {
            var fileStream = createReadStream(filePath);
            fileStream.on('error', function (err) {
                reject(err);
            });
            let params = { Bucket: this.options.bucket, Key: key, ContentType: Mime.getType(filePath), Body: fileStream };
            let options = { partSize: 1024 * 1024 * 1024, queueSize: 10 };
            this.s3.upload(params, options)
                .on('httpUploadProgress', function (evt) {
                    // console.log('Completed ' +
                    //     (evt.loaded * 100 / evt.total).toFixed() +
                    //     '% of upload');
                })
                .send(function (err: any, data: any) {
                    if (err)
                        reject(err)
                    else
                        resolve(null)
                });
        });
    };
};