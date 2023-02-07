"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs_1 = require("fs");
const mime_1 = __importDefault(require("@ijstech/mime"));
const path_1 = __importDefault(require("path"));
;
class S3 {
    constructor(options) {
        this.options = options;
        this.s3 = new client_s3_1.S3Client({
            region: options.region || 'auto',
            endpoint: options.endpoint,
            credentials: {
                secretAccessKey: options.secret,
                accessKeyId: options.key
            }
        });
    }
    ;
    deleteObject(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.options.bucket,
            Key: key
        });
        return this.s3.send(command);
    }
    ;
    async hasObject(key) {
        try {
            await this.headObject(key);
            return true;
        }
        catch (err) {
            return false;
        }
        ;
    }
    ;
    headObject(key) {
        const command = new client_s3_1.HeadObjectCommand({
            Bucket: this.options.bucket,
            Key: key
        });
        return this.s3.send(command);
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
    async listObjects(params) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: this.options.bucket,
            MaxKeys: (params === null || params === void 0 ? void 0 : params.maxKeys) || 1000,
            Prefix: (params === null || params === void 0 ? void 0 : params.prefix) || '',
            StartAfter: (params === null || params === void 0 ? void 0 : params.startAfter) || ''
        });
        let result = await this.s3.send(command);
        return result;
    }
    ;
    async getObject(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.options.bucket,
            Key: key
        });
        let result = await this.s3.send(command);
        return result.Body.transformToString('utf-8');
    }
    ;
    getObjectSignedUrl(key, expiresInSeconds) {
        return s3_request_presigner_1.getSignedUrl(this.s3, new client_s3_1.GetObjectCommand({ Bucket: this.options.bucket, Key: key }), { expiresIn: expiresInSeconds || 3600 });
    }
    ;
    putObject(key, content) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.options.bucket,
            Key: key,
            ContentType: mime_1.default.getType(key) || 'application/octet-stream',
            Body: content
        });
        return this.s3.send(command);
    }
    ;
    putObjectSignedUrl(key, expiresInSeconds) {
        return s3_request_presigner_1.getSignedUrl(this.s3, new client_s3_1.PutObjectCommand({ Bucket: this.options.bucket, Key: key }), { expiresIn: expiresInSeconds || 3600 });
    }
    ;
    putObjectFrom(key, filePath, progressCallback) {
        let fileStream = fs_1.createReadStream(filePath);
        let params = { Bucket: this.options.bucket, Key: key, ContentType: mime_1.default.getType(filePath), Body: fileStream };
        let upload = new lib_storage_1.Upload({
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
    }
    ;
}
exports.S3 = S3;
;
