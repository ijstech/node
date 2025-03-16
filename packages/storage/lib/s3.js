"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const promises_1 = require("node:stream/promises");
const fs_1 = require("fs");
const mime_1 = __importDefault(require("@ijstech/mime"));
const path_1 = __importDefault(require("path"));
const IPFSUtils = __importStar(require("@ijstech/ipfs"));
;
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
    async copyObject(fromKey, toKey) {
        try {
            let exists = await this.hasObject(toKey);
            if (!exists) {
                const command = new client_s3_1.CopyObjectCommand({
                    Bucket: this.options.bucket,
                    CopySource: this.options.bucket + '/' + fromKey,
                    Key: toKey
                });
                let result = await this.s3.send(command);
                if (!result.CopyObjectResult.ETag)
                    return false;
            }
            ;
            return true;
        }
        catch (err) {
            console.dir(err);
            return false;
        }
        ;
    }
    ;
    async deleteObject(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.options.bucket,
                Key: key
            });
            let result = await this.s3.send(command);
            return true;
        }
        catch (err) {
            return false;
        }
        ;
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
            MaxKeys: params?.maxKeys || 1000,
            Prefix: params?.prefix || '',
            StartAfter: params?.startAfter || ''
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
    async getObjectRaw(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.options.bucket,
            Key: key
        });
        let result = await this.s3.send(command);
        return await result.Body.transformToByteArray();
        ;
    }
    ;
    async downloadObject(key, targetFilePath) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.options.bucket,
                Key: key
            });
            let result = await this.s3.send(command);
            if (result.Body) {
                await (0, promises_1.pipeline)(result.Body, (0, fs_1.createWriteStream)(targetFilePath));
                return true;
            }
            ;
            return false;
        }
        catch (err) {
            return false;
        }
    }
    ;
    getObjectSignedUrl(key, options) {
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, new client_s3_1.GetObjectCommand({ Bucket: this.options.bucket, Key: key }), { expiresIn: options?.expiresInSeconds || 3600 });
    }
    ;
    async moveObject(fromKey, toKey) {
        try {
            let result = await this.copyObject(fromKey, toKey);
            if (!result)
                return false;
            return this.deleteObject(fromKey);
        }
        catch (err) {
            return false;
        }
        ;
    }
    ;
    async putObject(key, content) {
        let cid = await IPFSUtils.hashContent(content);
        if (cid.code == IPFSUtils.CidCode.DAG_PB) {
            let chunkSize = 1048576;
            let offset = 0;
            const size = Math.ceil(content.length / chunkSize);
            for (let i = 0; i < size; i++) {
                let chunk = cid.links[i];
                let exists = await this.hasObject(`ipfs/${chunk.cid}`);
                if (!exists) {
                    let data = content.substr(offset, chunkSize);
                    offset += chunkSize;
                    await this.putObjectRaw(`ipfs/${chunk.cid}`, Buffer.from(data), IPFSUtils.cidToHash(chunk.cid));
                }
                ;
            }
            ;
            let command = new client_s3_1.PutObjectCommand({
                Bucket: this.options.bucket,
                Key: key,
                ContentType: 'application/octet-stream',
                ChecksumSHA256: IPFSUtils.cidToHash(cid.cid),
                Body: cid.bytes
            });
            return this.s3.send(command);
        }
        else {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.options.bucket,
                Key: key,
                ContentType: mime_1.default.getType(key) || 'application/octet-stream',
                ChecksumSHA256: IPFSUtils.cidToHash(cid.cid),
                Body: content
            });
            return this.s3.send(command);
        }
        ;
    }
    ;
    async putObjectRaw(key, content, hash) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.options.bucket,
            Key: key,
            ContentType: mime_1.default.getType(key) || 'application/octet-stream',
            ChecksumSHA256: hash,
            Body: content
        });
        return this.s3.send(command);
    }
    ;
    putObjectSignedUrl(key, options) {
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, new client_s3_1.PutObjectCommand({
            Bucket: this.options.bucket,
            Key: key,
            ContentType: mime_1.default.getType(key) || 'application/octet-stream',
            ChecksumSHA256: options?.sha256 ? options.sha256 : undefined
        }), {
            unhoistableHeaders: new Set(['x-amz-checksum-sha256', 'content-length']),
            expiresIn: options?.expiresInSeconds || 3600
        });
    }
    ;
    putObjectFrom(key, filePath, progressCallback) {
        let fileStream = (0, fs_1.createReadStream)(filePath);
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
