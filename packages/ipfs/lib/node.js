"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashDir = exports.hashFile = void 0;
const ipfs_js_1 = __importDefault(require("./ipfs.js"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
async function hashFile(file, options) {
    let version = 1;
    if (options?.version === 0)
        version = 0;
    if (file instanceof Uint8Array) {
        return utils_1.hashContent(file, version);
    }
    else {
        let size;
        let stat = await fs_1.promises.stat(file);
        let fileStream;
        size = stat.size;
        if (size == 0) {
            return {
                cid: version == 1 ? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku' : 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH',
                type: 'file',
                code: version == 1 ? 0x55 : 0x70,
                size: 0
            };
        }
        ;
        if (version == 1) {
            let chunkSize = options?.chunkSize || 1048576;
            fileStream = fs_1.createReadStream(file, { highWaterMark: chunkSize });
        }
        else
            fileStream = fs_1.createReadStream(file, { highWaterMark: 262144 });
        return ipfs_js_1.default.hashContent(fileStream, version);
    }
    ;
}
exports.hashFile = hashFile;
;
async function hashDir(dirPath, version) {
    if (version == undefined)
        version = 1;
    let files = await fs_1.promises.readdir(dirPath);
    let items = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let path = path_1.default.join(dirPath, file);
        let stat = await fs_1.promises.stat(path);
        if (stat.isDirectory()) {
            let result = await hashDir(path, version);
            result.name = file;
            result.type = 'dir';
            items.push(result);
        }
        else {
            try {
                let result = await hashFile(path, { version: version });
                result.name = file;
                items.push(result);
            }
            catch (err) {
                console.dir(path);
            }
        }
    }
    ;
    return await utils_1.hashItems(items, version);
}
exports.hashDir = hashDir;
;
