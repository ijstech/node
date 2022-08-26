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
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("fs");
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const IPFSUtils = __importStar(require("@ijstech/ipfs"));
const s3_1 = require("./s3");
const extract_zip_1 = __importDefault(require("extract-zip"));
const web3_storage_1 = require("web3.storage");
const appPrefix = 'sc';
async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const request = https_1.default.get(url, response => {
            if (response.statusCode === 200) {
                const file = fs_1.default.createWriteStream(dest);
                file.on('finish', () => resolve(''));
                file.on('error', err => {
                    file.close();
                    fs_1.default.unlink(dest, () => reject(err.message));
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
        var _a, _b;
        this.options = options;
        if (this.options.s3)
            this.s3 = new s3_1.S3(this.options.s3);
        if ((_a = this.options.localCache) === null || _a === void 0 ? void 0 : _a.path) {
            fs_1.default.mkdirSync(path_1.default.join(this.options.localCache.path, 'stat'), { recursive: true });
            fs_1.default.mkdirSync(path_1.default.join(this.options.localCache.path, 'ipfs'), { recursive: true });
        }
        ;
        if ((_b = this.options.web3Storage) === null || _b === void 0 ? void 0 : _b.token)
            this.web3Storage = new web3_storage_1.Web3Storage({ token: this.options.web3Storage.token });
    }
    ;
    async localCacheExist(key) {
        var _a;
        if ((_a = this.options.localCache) === null || _a === void 0 ? void 0 : _a.path) {
            try {
                let filePath = path_1.default.join(this.options.localCache.path, key);
                await fs_2.promises.access(filePath);
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
    async getLocalCache(key) {
        var _a;
        if ((_a = this.options.localCache) === null || _a === void 0 ? void 0 : _a.path) {
            let filePath = path_1.default.join(this.options.localCache.path, key);
            let content = await fs_2.promises.readFile(filePath, 'utf8');
            return content;
        }
    }
    ;
    async putLocalCache(key, content) {
        var _a;
        if ((_a = this.options.localCache) === null || _a === void 0 ? void 0 : _a.path) {
            let filePath = path_1.default.join(this.options.localCache.path, key);
            await fs_2.promises.writeFile(filePath, content);
        }
        ;
    }
    ;
    async getFileContent(cid, filePath) {
        if (filePath[0] == '/')
            filePath = filePath.substring(1);
        let key = `stat/${cid}`;
        let paths = filePath.split('/');
        let item;
        let localCache;
        if (await this.localCacheExist(key)) {
            item = JSON.parse(await this.getLocalCache(key));
            localCache = true;
        }
        else {
            let content = await this.s3.getObject(key);
            item = JSON.parse(content);
            await this.putLocalCache(key, content);
        }
        ;
        let items;
        for (let i = 0; i < paths.length; i++) {
            let items = item.links;
            if (!localCache) {
                let cid = (await IPFSUtils.hashItems(items)).cid;
                if (cid != item.cid)
                    throw new Error('CID not match');
            }
            for (let k = 0; k < items.length; k++) {
                if (items[k].name == paths[i]) {
                    if (items[k].type == 'file') {
                        let key = `ipfs/${items[k].cid}`;
                        let content;
                        if (await this.localCacheExist(key))
                            content = await this.getLocalCache(key);
                        else {
                            content = await this.s3.getObject(key);
                            let cid = await IPFSUtils.hashContent(content);
                            if (cid != items[k].cid)
                                throw new Error('CID not match');
                            await this.putLocalCache(key, content);
                        }
                        ;
                        return content;
                    }
                    else {
                        item = items[k];
                        break;
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
    async syncDirTo(path, to, name) {
        let hash = await IPFSUtils.hashDir(path, 1);
        let cid;
        if (to.ipfs && this.web3Storage) {
            let items = await fs_2.promises.readdir(path);
            for (let i = 0; i < items.length; i++)
                items[i] = path + '/' + items[i];
            const files = await web3_storage_1.getFilesFromPath(items);
            cid = await this.web3Storage.put(files, {
                name: name
            });
            if (cid != hash.cid) {
                console.dir('Error: CID not match');
                console.dir(cid);
                console.dir(hash.cid);
            }
        }
        ;
        if (to.s3) {
            await this.putLocalCache('stat/' + hash.cid, JSON.stringify(hash, null, 4));
            let exists = await this.s3.hasObject(`stat/${hash.cid}`);
            if (!exists)
                await this.s3.putObject(`stat/${hash.cid}`, JSON.stringify(hash));
            await this.s3.syncFiles(path, 'ipfs', hash.links);
        }
        ;
        return hash;
    }
    ;
    async syncGithubTo(repo, to, sourceDir) {
        let id = crypto_1.default.randomUUID();
        let tmpDir = await fs_2.promises.mkdtemp(path_1.default.join(os_1.default.tmpdir(), appPrefix));
        let dir = `${tmpDir}/${id}`;
        fs_1.default.mkdirSync(dir);
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
            let result = await this.syncDirTo(pinDir, to, name);
            return result;
        }
        finally {
            fs_1.default.rmSync(dir, { recursive: true });
        }
    }
    ;
}
exports.Storage = Storage;
;
