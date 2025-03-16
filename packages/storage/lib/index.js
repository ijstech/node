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
exports.Storage = exports.S3 = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const IPFSUtils = __importStar(require("@ijstech/ipfs"));
const s3_1 = require("./s3");
Object.defineProperty(exports, "S3", { enumerable: true, get: function () { return s3_1.S3; } });
const extract_zip_1 = __importDefault(require("extract-zip"));
const db_1 = require("@ijstech/db");
const log_pdm_1 = require("./log.pdm");
let getFilesFromPath;
let File;
const appPrefix = 'sc';
async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const request = https_1.default.get(url, response => {
            if (response.statusCode === 200) {
                const file = (0, fs_1.createWriteStream)(dest);
                file.on('finish', () => resolve(''));
                file.on('error', err => {
                    file.close();
                    (0, fs_1.unlink)(dest, () => reject(err.message));
                });
                response.pipe(file);
            }
            else if (response.statusCode === 302 || response.statusCode === 301) {
                download(response.headers.location, dest).then(() => resolve(''));
            }
            else {
                reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        });
        request.on('error', err => {
            reject(err.message);
        });
    });
}
;
;
;
class Storage {
    constructor(options) {
        this.options = options;
        if (this.options.s3)
            this.s3 = new s3_1.S3(this.options.s3);
    }
    ;
    async initDir() {
        if (!this._initDir) {
            if (this.options.localCache?.path) {
                await fs_1.promises.mkdir(path_1.default.join(this.options.localCache.path, 'stat'), { recursive: true });
                await fs_1.promises.mkdir(path_1.default.join(this.options.localCache.path, 'ipfs'), { recursive: true });
                await fs_1.promises.mkdir(path_1.default.join(this.options.localCache.path, 'tmp'), { recursive: true });
            }
            ;
            this._initDir = true;
        }
        ;
    }
    ;
    async localCacheExist(type, key) {
        if (this.options.localCache?.path) {
            await this.initDir();
            try {
                let filePath = path_1.default.join(this.options.localCache.path, type, key);
                await fs_1.promises.access(filePath);
                return true;
            }
            catch (err) {
                return false;
            }
        }
        else
            return false;
    }
    ;
    async getLocalCachePath(type, key) {
        if (this.options.localCache?.path) {
            await this.initDir();
            return path_1.default.join(this.options.localCache.path, type, key);
        }
        ;
    }
    ;
    async getLocalCache(type, key) {
        let filePath = await this.getLocalCachePath(type, key);
        if (filePath) {
            let content = await fs_1.promises.readFile(filePath, 'utf8');
            return content;
        }
        ;
    }
    ;
    async getLocalCacheRaw(type, key) {
        let filePath = await this.getLocalCachePath(type, key);
        if (filePath) {
            let content = await fs_1.promises.readFile(filePath);
            return content;
        }
        ;
    }
    ;
    async putLocalCache(type, key, content) {
        let filePath = await this.getLocalCachePath(type, key);
        if (filePath) {
            await fs_1.promises.writeFile(filePath, content);
        }
        ;
    }
    ;
    async getFile(rootCid, filePath) {
        let path = await this.getLocalFilePath(rootCid, filePath);
        if (path)
            return await fs_1.promises.readFile(path, 'utf8');
    }
    ;
    async getFileRaw(rootCid, filePath) {
        let path = await this.getLocalFilePath(rootCid, filePath, false, true);
        if (path)
            return await fs_1.promises.readFile(path);
    }
    ;
    moveFile(sourcePath, destPath) {
        return new Promise((resolve, reject) => {
            const readStream = (0, fs_1.createReadStream)(sourcePath);
            const writeStream = (0, fs_1.createWriteStream)(destPath);
            readStream.on('error', err => {
                reject(err);
            });
            writeStream.on('error', err => {
                reject(err);
            });
            writeStream.on('finish', () => {
                fs_1.promises.rm(sourcePath);
                resolve(true);
            });
            readStream.pipe(writeStream);
        });
    }
    ;
    async getLocalFilePath(rootCid, filePath, returnIndex, rawFile) {
        if (rootCid.startsWith('/') && typeof (filePath) == 'string')
            return path_1.default.join(rootCid, filePath);
        if (typeof (filePath) == 'string' && filePath[0] == '/')
            filePath = filePath.substring(1);
        let paths;
        if (filePath) {
            if (Array.isArray(filePath))
                paths = filePath;
            else
                paths = filePath.split('/');
        }
        ;
        let item;
        if (filePath && await this.localCacheExist('stat', rootCid)) {
            item = JSON.parse(await this.getLocalCache('stat', rootCid));
        }
        else if (!filePath && await this.localCacheExist('ipfs', rootCid)) {
            return await this.getLocalCachePath('ipfs', rootCid);
        }
        else if (this.s3) {
            if (!filePath && await this.s3.hasObject(`ipfs/${rootCid}`)) {
                let info = await this.getItemInfo(rootCid);
                if (!rawFile && info.code == IPFSUtils.CidCode.DAG_PB && await this.localCacheExist('stat', rootCid)) {
                    return await this.getLocalCachePath('stat', rootCid);
                }
                else {
                    let targetFilePath = await this.getLocalCachePath('ipfs', rootCid);
                    if (targetFilePath) {
                        let tmpFilePath = await this.getLocalCachePath('tmp', rootCid);
                        let success = await this.s3.downloadObject(`ipfs/${rootCid}`, tmpFilePath);
                        if (!success)
                            throw new Error('Failed to download file');
                        if (info.code == IPFSUtils.CidCode.DAG_PB) {
                            let cidInfo = await this.getItemInfo(rootCid);
                            if (cidInfo.cid != rootCid) {
                                await fs_1.promises.rm(tmpFilePath);
                                throw new Error('CID not match');
                            }
                        }
                        else {
                            let cid = (await IPFSUtils.hashFile(tmpFilePath)).cid;
                            if (cid != rootCid) {
                                await fs_1.promises.rm(tmpFilePath);
                                throw new Error('CID not match');
                            }
                            ;
                        }
                        await this.moveFile(tmpFilePath, targetFilePath);
                        return targetFilePath;
                    }
                    ;
                }
            }
            else {
                item = await this.getItemInfo(rootCid);
                if (item.type != 'dir') {
                    throw new Error('Invalid directory');
                }
                ;
            }
        }
        ;
        if (paths?.length > 0) {
            let path = paths.shift();
            for (let i = 0; i < item.links.length; i++) {
                let link = item.links[i];
                if (link.name == path) {
                    let info = await this.getItemInfo(link.cid);
                    if (info.type == 'dir')
                        return await this.getLocalFilePath(link.cid, paths, returnIndex);
                    else {
                        let info = await this.getItemInfo(link.cid);
                        if (info.code == IPFSUtils.CidCode.DAG_PB) {
                            return await this.getLocalFilePath(link.cid);
                        }
                        else {
                            let targetFilePath = await this.getLocalCachePath('ipfs', link.cid);
                            if (targetFilePath) {
                                if (await this.localCacheExist('ipfs', link.cid))
                                    return targetFilePath;
                                let tmpFilePath = await this.getLocalCachePath('tmp', link.cid);
                                let success = await this.s3.downloadObject(`ipfs/${link.cid}`, tmpFilePath);
                                if (!success)
                                    throw new Error('Failed to download file');
                                let { cid } = await IPFSUtils.hashFile(tmpFilePath);
                                if (cid != link.cid) {
                                    await fs_1.promises.rm(tmpFilePath);
                                    throw new Error('CID not match');
                                }
                                ;
                                await this.moveFile(tmpFilePath, targetFilePath);
                                return targetFilePath;
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                ;
            }
            ;
        }
        else {
            if (returnIndex && item.type == 'dir')
                return await this.getLocalFilePath(item.cid, ['index.html']);
            return await this.getLocalCachePath('stat', rootCid);
        }
    }
    ;
    async getUploadUrl(path, options) {
        return this.s3.putObjectSignedUrl(path, options);
    }
    ;
    async putContent(fileContent, to, source) {
        let fileItem = await IPFSUtils.hashContent(fileContent);
        fileItem.type = 'file';
        fileItem.name = '';
        if (this.s3) {
            let exists = await this.s3.hasObject(`ipfs/${fileItem.cid}`);
            if (exists)
                return fileItem;
        }
        ;
        if (!to || to.s3 != false) {
            let logContext;
            if (this.options.log) {
                let client = (0, db_1.getClient)(this.options.log);
                logContext = new log_pdm_1.Context(client);
                let log = logContext.uploadLog.add();
                log.source = source;
                log.uploadDate = new Date();
                log.size = fileItem.size;
                logContext.uploadItem.applyInsert({
                    cid: fileItem.cid,
                    logGuid: log.guid,
                    size: fileItem.size,
                    type: 2
                });
            }
            await this.s3.putObject(`ipfs/${fileItem.cid}`, fileContent);
            if (logContext)
                await logContext.save();
        }
        ;
        return fileItem;
    }
    ;
    async putFile(filePath, to, source) {
        let fileItem = await IPFSUtils.hashFile(filePath);
        fileItem.name = filePath.split('/').pop() || filePath;
        fileItem.type = 'file';
        let exists;
        if (this.s3) {
            exists = await this.s3.hasObject(`ipfs/${fileItem.cid}`);
            if (exists)
                return fileItem;
        }
        ;
        let folderItem = await IPFSUtils.hashItems([
            {
                cid: fileItem.cid,
                name: fileItem.name,
                size: fileItem.size,
                links: [],
                type: 'file'
            }
        ]);
        if (!to || to.s3 != false) {
            let logContext;
            if (this.options.log) {
                let client = (0, db_1.getClient)(this.options.log);
                logContext = new log_pdm_1.Context(client);
                let log = logContext.uploadLog.add();
                log.source = source;
                log.uploadDate = new Date();
                log.size = fileItem.size;
            }
            await this.putToS3(logContext, filePath, fileItem, folderItem);
            if (logContext)
                await logContext.save();
        }
        ;
        return fileItem;
    }
    ;
    async getItemInfo(cid) {
        let parsed = IPFSUtils.parse(cid);
        if (parsed.code == IPFSUtils.CidCode.DAG_PB) {
            parsed = JSON.parse(await this.getItem(cid));
            return {
                cid: cid,
                size: parsed.size,
                code: IPFSUtils.CidCode.DAG_PB,
                type: parsed.type,
                name: parsed.name,
                links: parsed.links
            };
        }
        else
            return {
                cid: cid,
                size: parsed.size,
                code: IPFSUtils.CidCode.RAW,
                type: 'file'
            };
    }
    ;
    async getItem(cid) {
        if (await this.localCacheExist('stat', cid)) {
            return await this.getLocalCache('stat', cid);
        }
        else if (await this.localCacheExist('ipfs', cid)) {
            return await this.getLocalCache('ipfs', cid);
        }
        else if (this.s3) {
            let match;
            let itemType;
            let content;
            let result;
            if (await this.s3.hasObject(`ipfs/${cid}`)) {
                let parsed = IPFSUtils.parse(cid);
                if (parsed.code == IPFSUtils.CidCode.DAG_PB) {
                    itemType = 'stat';
                    content = await this.s3.getObjectRaw(`ipfs/${cid}`);
                    parsed = IPFSUtils.parse(cid, content);
                    let links = [];
                    for (let i = 0; i < parsed.links.length; i++) {
                        let link = parsed.links[i];
                        links.push({
                            cid: link.cid,
                            name: link.name,
                            size: link.size
                        });
                    }
                    ;
                    if (parsed.type == 'dir') {
                        match = (await IPFSUtils.hashItems(parsed.links)).cid == cid;
                    }
                    else
                        match = (await IPFSUtils.hashChunks(parsed.links)).cid == cid;
                    result = JSON.stringify({
                        cid: cid,
                        name: parsed.name || '',
                        size: parsed.size,
                        type: parsed.type,
                        links: links
                    });
                }
                else {
                    itemType = 'ipfs';
                    result = await this.s3.getObject(`ipfs/${cid}`);
                    match = (await IPFSUtils.hashContent(result)).cid == cid;
                }
                ;
            }
            else {
                itemType = 'stat';
                content = await this.s3.getObject(`stat/${cid}`);
                result = content;
                try {
                    if ((await IPFSUtils.hashItems(JSON.parse(content).links)).cid == cid)
                        match = true;
                }
                catch (err) { }
                ;
            }
            ;
            if (!match)
                throw new Error('CID not match');
            await this.putLocalCache(itemType, cid, result);
            return result;
        }
        ;
    }
    ;
    async putItems(items, source) {
        let hash = await IPFSUtils.hashItems(items, 1);
        hash.name = '';
        hash.type = 'dir';
        hash.links = [];
        items.forEach(item => {
            hash.links?.push({
                cid: item.cid,
                name: item.name,
                size: item.size,
                type: item.type
            });
        });
        let logContext;
        if (this.options.log) {
            let client = (0, db_1.getClient)(this.options.log);
            logContext = new log_pdm_1.Context(client);
            let log = logContext.uploadLog.add();
            log.source = source;
            log.uploadDate = new Date();
            log.size = hash.size;
        }
        ;
        await this.putToS3(logContext, null, hash);
        if (logContext) {
            await logContext.save();
        }
        ;
        return {
            cid: hash.cid,
            name: '',
            size: hash.size,
            type: 'dir',
            links: items
        };
    }
    ;
    async putDir(path, to, source) {
        let hash = await IPFSUtils.hashDir(path, 1);
        hash.name = path.split('/').pop() || path;
        hash.type = 'dir';
        let cid;
        if (!to || to.s3 != false) {
            let logContext;
            if (this.options.log) {
                let client = (0, db_1.getClient)(this.options.log);
                logContext = new log_pdm_1.Context(client);
                let log = logContext.uploadLog.add();
                log.source = source;
                log.uploadDate = new Date();
                log.size = hash.size;
            }
            ;
            await this.putToS3(logContext, path, hash);
            if (logContext) {
                await logContext.save();
            }
        }
        return hash;
    }
    ;
    async putToS3(logContext, sourcePath, item, parent) {
        let exists = await this.s3.hasObject(`ipfs/${item.cid}`);
        if (!exists) {
            if (item.code == IPFSUtils.CidCode.DAG_PB) {
                if (item.type == 'file') {
                    let fileStream = (0, fs_1.createReadStream)(sourcePath, { highWaterMark: 1048576 });
                    let idx = 0;
                    for await (const data of fileStream) {
                        let chunk = item.links[idx];
                        idx++;
                        let exists = await this.s3.hasObject(`ipfs/${chunk.cid}`);
                        if (!exists)
                            await this.s3.putObjectRaw(`ipfs/${chunk.cid}`, data, IPFSUtils.cidToHash(chunk.cid));
                    }
                    ;
                    await this.s3.putObjectRaw(`ipfs/${item.cid}`, item.bytes, IPFSUtils.cidToHash(item.cid));
                }
                else if (item.links?.length > 0) {
                    if (sourcePath) {
                        for (let i = 0; i < item.links.length; i++) {
                            let link = item.links[i];
                            await this.putToS3(logContext, path_1.default.join(sourcePath, link.name), link, item);
                        }
                    }
                    ;
                    await this.s3.putObjectRaw(`ipfs/${item.cid}`, item.bytes, IPFSUtils.cidToHash(item.cid));
                    if (logContext) {
                        logContext.uploadItem.applyInsert({
                            cid: item.cid,
                            logGuid: logContext.uploadLog.first?.guid,
                            parentCid: parent ? parent.cid : null,
                            size: item.size,
                            type: 1
                        });
                    }
                    ;
                }
                ;
            }
            else if (sourcePath) {
                await this.s3.putObjectFrom(`ipfs/${item.cid}`, sourcePath);
                if (logContext) {
                    logContext.uploadItem.applyInsert({
                        logGuid: logContext.uploadLog.first.guid,
                        cid: item.cid,
                        parentCid: parent.cid,
                        size: item.size,
                        type: 2
                    });
                }
                ;
            }
            ;
        }
        ;
    }
    ;
    async putGithub(repo, to, sourceDir) {
        let id = crypto_1.default.randomUUID();
        let tmpDir = await fs_1.promises.mkdtemp(path_1.default.join(os_1.default.tmpdir(), appPrefix));
        let dir = `${tmpDir}/${id}`;
        (0, fs_1.mkdirSync)(dir);
        try {
            let targetDir = `${dir}/dir`;
            let targetFile = `${dir}/file.zip`;
            let pinDir = `${targetDir}/${repo.repo}-${repo.commit}`;
            if (sourceDir)
                pinDir = path_1.default.join(pinDir, sourceDir);
            let url = `https://github.com/${repo.org}/${repo.repo}/archive/${repo.commit}.zip`;
            await download(url, targetFile);
            await (0, extract_zip_1.default)(targetFile, { dir: targetDir });
            let name = `${repo.org}/${repo.repo}/${repo.commit}`;
            let result = await this.putDir(pinDir, to, name);
            return result;
        }
        finally {
            try {
                fs_1.promises.rm(dir, { recursive: true });
            }
            catch (err) {
                console.dir(err);
            }
        }
        ;
    }
    ;
}
exports.Storage = Storage;
;
