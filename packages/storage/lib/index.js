"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const IPFSUtils = __importStar(require("@ijstech/ipfs"));
const s3_1 = require("./s3");
const extract_zip_1 = __importDefault(require("extract-zip"));
const web3_storage_1 = require("web3.storage");
const db_1 = require("@ijstech/db");
const log_pdm_1 = require("./log.pdm");
const appPrefix = 'sc';
async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const request = https_1.default.get(url, response => {
            if (response.statusCode === 200) {
                const file = fs_1.createWriteStream(dest);
                file.on('finish', () => resolve(''));
                file.on('error', err => {
                    file.close();
                    fs_1.unlink(dest, () => reject(err.message));
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
        var _a;
        this.options = options;
        if (this.options.s3)
            this.s3 = new s3_1.S3(this.options.s3);
        if ((_a = this.options.web3Storage) === null || _a === void 0 ? void 0 : _a.token)
            this.web3Storage = new web3_storage_1.Web3Storage({ token: this.options.web3Storage.token });
    }
    ;
    async initDir() {
        var _a;
        if (!this._initDir) {
            if ((_a = this.options.localCache) === null || _a === void 0 ? void 0 : _a.path) {
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
        var _a;
        if ((_a = this.options.localCache) === null || _a === void 0 ? void 0 : _a.path) {
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
        var _a;
        if ((_a = this.options.localCache) === null || _a === void 0 ? void 0 : _a.path) {
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
    moveFile(sourcePath, destPath) {
        return new Promise((resolve, reject) => {
            const readStream = fs_1.createReadStream(sourcePath);
            const writeStream = fs_1.createWriteStream(destPath);
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
    async getLocalFilePath(rootCid, filePath) {
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
        if (await this.localCacheExist('stat', rootCid)) {
            item = JSON.parse(await this.getLocalCache('stat', rootCid));
        }
        else if (this.s3) {
            let content = await this.s3.getObject(`stat/${rootCid}`);
            item = JSON.parse(content);
            if ((await IPFSUtils.hashItems(item.links)).cid != rootCid)
                throw new Error('CID not match');
            await this.putLocalCache('stat', rootCid, content);
        }
        ;
        if ((paths === null || paths === void 0 ? void 0 : paths.length) > 0) {
            let path = paths.shift();
            for (let i = 0; i < item.links.length; i++) {
                if (item.links[i].name == path) {
                    if (item.links[i].type == 'dir')
                        return await this.getLocalFilePath(item.links[i].cid, paths);
                    else {
                        let targetFilePath = await this.getLocalCachePath('ipfs', item.links[i].cid);
                        if (targetFilePath) {
                            if (await this.localCacheExist('ipfs', item.links[i].cid))
                                return targetFilePath;
                            let tmpFilePath = await this.getLocalCachePath('tmp', item.links[i].cid);
                            let success = await this.s3.downloadObject(`ipfs/${item.links[i].cid}`, tmpFilePath);
                            if (!success)
                                throw new Error('Failed to download file');
                            let { cid } = await IPFSUtils.hashFile(tmpFilePath);
                            if (cid != item.links[i].cid) {
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
        else
            return await this.getLocalCachePath('stat', rootCid);
    }
    ;
    async getUploadUrl(path, expiresInSeconds) {
        return this.s3.putObjectSignedUrl(path, expiresInSeconds);
    }
    ;
    async putContent(fileContent, to, source) {
        let fileItem = await IPFSUtils.hashContent(fileContent);
        fileItem.type = 'file';
        fileItem.name = '';
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
                name: 'file',
                size: fileItem.size,
                type: fileItem.type
            }
        ]);
        if ((!to || to.ipfs != false) && this.web3Storage) {
            const files = [
                new web3_storage_1.File([fileContent], 'file'),
            ];
            let cid = await this.web3Storage.put(files, {
                name: source
            });
            if (cid != folderItem.cid)
                throw new Error('CID not match');
        }
        ;
        if (!to || to.s3 != false) {
            let logContext;
            if (this.options.log) {
                let client = db_1.getClient(this.options.log);
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
        if ((!to || to.ipfs != false) && this.web3Storage) {
            const files = await web3_storage_1.getFilesFromPath(filePath);
            let cid = await this.web3Storage.put(files, {
                name: source
            });
            if (cid != folderItem.cid)
                throw new Error('CID not match');
        }
        ;
        if (!to || to.s3 != false) {
            let logContext;
            if (this.options.log) {
                let client = db_1.getClient(this.options.log);
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
    async getItem(cid) {
        if (await this.localCacheExist('stat', cid)) {
            return await this.getLocalCache('stat', cid);
        }
        else if (await this.localCacheExist('ipfs', cid)) {
            return await this.getLocalCache('ipfs', cid);
        }
        else if (this.s3) {
            let match;
            let content;
            let itemType;
            if (await this.s3.hasObject(`ipfs/${cid}`)) {
                itemType = 'ipfs';
                content = await this.s3.getObject(`ipfs/${cid}`);
            }
            else {
                itemType = 'stat';
                content = await this.s3.getObject(`stat/${cid}`);
            }
            ;
            if (content) {
                try {
                    if ((await IPFSUtils.hashItems(JSON.parse(content).links)).cid == cid)
                        match = true;
                }
                catch (err) { }
                ;
            }
            ;
            if (!match && (await IPFSUtils.hashContent(content)).cid != cid)
                throw new Error('CID not match');
            await this.putLocalCache(itemType, cid, content);
            return content;
        }
        ;
    }
    ;
    async putItems(items, source) {
        let hash = await IPFSUtils.hashItems(items, 1);
        hash.name = '';
        hash.type = 'dir';
        hash.links = items;
        let logContext;
        if (this.options.log) {
            let client = db_1.getClient(this.options.log);
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
        if ((!to || to.ipfs != false) && this.web3Storage) {
            let items = await fs_1.promises.readdir(path);
            for (let i = 0; i < items.length; i++)
                items[i] = path + '/' + items[i];
            const files = await web3_storage_1.getFilesFromPath(items);
            cid = await this.web3Storage.put(files, {
                name: source
            });
            if (cid != hash.cid)
                throw new Error('CID not match');
        }
        ;
        if (!to || to.s3 != false) {
            let logContext;
            if (this.options.log) {
                let client = db_1.getClient(this.options.log);
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
        var _a, _b;
        let itemType;
        if (item.type == 'dir')
            itemType = 'stat';
        else
            itemType = 'ipfs';
        let exists = await this.s3.hasObject(`${itemType}/${item.cid}`);
        if (!exists) {
            if (item.type == 'dir') {
                if (((_a = item.links) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    if (sourcePath) {
                        for (let i = 0; i < item.links.length; i++)
                            await this.putToS3(logContext, path_1.default.join(sourcePath, item.links[i].name), item.links[i], item);
                    }
                    ;
                    let data = JSON.parse(JSON.stringify(item));
                    for (let i = 0; i < data.links.length; i++)
                        delete data.links[i].links;
                    await this.s3.putObject(`stat/${item.cid}`, JSON.stringify(data));
                    if (logContext) {
                        logContext.uploadItem.applyInsert({
                            cid: data.cid,
                            logGuid: (_b = logContext.uploadLog.first) === null || _b === void 0 ? void 0 : _b.guid,
                            parentCid: parent ? parent.cid : null,
                            size: data.size,
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
        fs_1.mkdirSync(dir);
        try {
            let targetDir = `${dir}/dir`;
            let targetFile = `${dir}/file.zip`;
            let pinDir = `${targetDir}/${repo.repo}-${repo.commit}`;
            if (sourceDir)
                pinDir = path_1.default.join(pinDir, sourceDir);
            let url = `https://github.com/${repo.org}/${repo.repo}/archive/${repo.commit}.zip`;
            await download(url, targetFile);
            await extract_zip_1.default(targetFile, { dir: targetDir });
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
