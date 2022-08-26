"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3 = void 0;
const s3_js_1 = __importDefault(require("aws-sdk/clients/s3.js"));
const fs_1 = require("fs");
const mime_1 = __importDefault(require("@ijstech/mime"));
const path_1 = __importDefault(require("path"));
;
;
class S3 {
    constructor(options) {
        this.options = options;
        this.s3 = new s3_js_1.default({
            endpoint: options.endpoint,
            accessKeyId: options.key,
            secretAccessKey: options.secret
        });
    }
    ;
    async hasObject(key) {
        return new Promise((resolve, reject) => {
            this.s3.headObject({
                Bucket: this.options.bucket,
                Key: key
            }, (err, res) => {
                if (err)
                    return resolve(false);
                else
                    return resolve(true);
            });
        });
    }
    ;
    async syncFiles(sourceDir, targetDir, items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.type == 'dir')
                await this.syncFiles(path_1.default.join(sourceDir, item.name), targetDir, item.links);
            else if (item.type == 'file') {
                let key = `${targetDir}/${item.cid}`;
                let exists = await this.hasObject(key);
                if (!exists)
                    await this.putObjectFrom(key, path_1.default.join(sourceDir, item.name));
            }
            ;
        }
        ;
    }
    ;
    async listObjects(prefix, maxKeys, startAfter) {
        return await this.s3.listObjectsV2({
            Bucket: this.options.bucket,
            MaxKeys: maxKeys || 1000,
            Prefix: prefix || '',
            StartAfter: startAfter || ''
        }).promise().then((data) => {
            return {
                data: data.Contents
            };
        }).catch((err) => {
            return {
                error: err
            };
        });
    }
    ;
    async getObject(key) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({
                Bucket: this.options.bucket,
                Key: key,
            }, (err, res) => {
                if (err)
                    return reject(err.message);
                resolve(res.Body.toString('utf-8'));
            });
        });
    }
    ;
    async putObject(key, content, acl) {
        return new Promise((resolve) => {
            this.s3.putObject({
                Bucket: this.options.bucket,
                Key: key,
                ACL: acl,
                ContentType: mime_1.default.getType(key) || 'application/octet-stream',
                Body: content
            }, (err, res) => {
                resolve(res);
            });
        });
    }
    ;
    async putObjectFrom(key, filePath, acl) {
        return new Promise((resolve, reject) => {
            var fileStream = fs_1.createReadStream(filePath);
            fileStream.on('error', function (err) {
                reject(err);
            });
            let params = { Bucket: this.options.bucket, Key: key, ContentType: mime_1.default.getType(filePath), Body: fileStream };
            let options = { partSize: 1024 * 1024 * 1024, queueSize: 10 };
            this.s3.upload(params, options)
                .on('httpUploadProgress', function (evt) {
            })
                .send(function (err, data) {
                if (err)
                    reject(err);
                else
                    resolve(null);
            });
        });
    }
    ;
}
exports.S3 = S3;
;
