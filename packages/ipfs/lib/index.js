"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cidToHash = exports.hashFile = exports.hashContent = exports.hashDir = exports.hashItems = exports.hashChunks = exports.hashChunk = exports.parse = exports.DAG_PB = void 0;
const ipfs_js_1 = __importDefault(require("./ipfs.js"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
exports.DAG_PB = 0X70;
;
;
function parse(cid, bytes) {
    let result = ipfs_js_1.default.parse(cid, bytes);
    let links = [];
    if (result.links) {
        for (let i = 0; i < result.links.length; i++) {
            let link = result.links[i];
            links.push({
                cid: link.Hash.toString(),
                name: link.Name,
                size: link.Tsize
            });
        }
    }
    ;
    return {
        cid: cid,
        size: result.size,
        code: result.code,
        type: result.type == 'directory' ? 'dir' : result.type == 'file' ? 'file' : undefined,
        multihash: result.multihash,
        links: links,
        bytes: result.bytes
    };
}
exports.parse = parse;
;
;
async function hashChunk(data, version) {
    if (version == undefined)
        version = 1;
    return ipfs_js_1.default.hashChunk(data, version);
}
exports.hashChunk = hashChunk;
;
async function hashChunks(chunks, version) {
    if (version == undefined)
        version = 1;
    return ipfs_js_1.default.hashChunks(chunks, version);
}
exports.hashChunks = hashChunks;
;
async function hashItems(items, version) {
    return await ipfs_js_1.default.hashItems(items || [], version);
}
exports.hashItems = hashItems;
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
                let result = await hashFile(path, version);
                items.push({
                    cid: result.cid,
                    name: file,
                    size: result.size,
                    type: 'file'
                });
            }
            catch (err) {
                console.dir(path);
            }
        }
    }
    ;
    return await hashItems(items, version);
}
exports.hashDir = hashDir;
;
async function hashContent(content, version) {
    if (version == undefined)
        version = 1;
    if (content.length == 0) {
        return {
            cid: version == 1 ? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku' : 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH',
            size: 0
        };
    }
    return ipfs_js_1.default.hashFile(content, version);
}
exports.hashContent = hashContent;
;
async function hashFile(filePath, version) {
    if (version == undefined)
        version = 1;
    let size;
    let stat = await fs_1.promises.stat(filePath);
    let file;
    size = stat.size;
    if (size == 0) {
        return {
            cid: version == 1 ? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku' : 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH',
            size: 0
        };
    }
    ;
    if (version == 1)
        file = fs_1.createReadStream(filePath, { highWaterMark: 1048576 });
    else
        file = fs_1.createReadStream(filePath, { highWaterMark: 262144 });
    return ipfs_js_1.default.hashFile(file, version);
}
exports.hashFile = hashFile;
;
function cidToHash(cid) {
    return ipfs_js_1.default.cidToHash(cid);
}
exports.cidToHash = cidToHash;
;
