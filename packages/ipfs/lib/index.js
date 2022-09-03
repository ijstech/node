"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashFile = exports.hashContent = exports.hashDir = exports.hashItems = exports.parse = void 0;
const ipfs_js_1 = __importDefault(require("./ipfs.js"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function parse(cid) {
    return ipfs_js_1.default.parse(cid);
}
exports.parse = parse;
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
    let result = await hashItems(items, version);
    return {
        cid: result.cid,
        name: '',
        size: result.size,
        type: 'dir',
        links: items
    };
}
exports.hashDir = hashDir;
;
async function hashContent(content, version) {
    if (version == undefined)
        version = 1;
    if (content.length == 0) {
        return await ipfs_js_1.default.hashContent('', version);
    }
    let result;
    if (version == 1) {
        result = await ipfs_js_1.default.hashFile(content, version, {
            rawLeaves: true,
            maxChunkSize: 1048576,
            maxChildrenPerNode: 1024
        });
    }
    else
        result = await ipfs_js_1.default.hashFile(content, version);
    return result.cid;
}
exports.hashContent = hashContent;
async function hashFile(filePath, version, options) {
    if (version == undefined)
        version = 1;
    let size;
    let stat = await fs_1.promises.stat(filePath);
    size = stat.size;
    let file = fs_1.createReadStream(filePath);
    let cid;
    let result;
    if (size == 0) {
        cid = await ipfs_js_1.default.hashContent('', version);
        return {
            cid,
            size
        };
    }
    else if (version == 1) {
        result = await ipfs_js_1.default.hashFile(file, version, ipfs_js_1.default.mergeOptions({
            rawLeaves: true,
            maxChunkSize: 1048576,
            maxChildrenPerNode: 1024
        }, options || {}));
    }
    else
        result = await ipfs_js_1.default.hashFile(file, version);
    return result;
    return {
        cid: cid,
        size: size
    };
}
exports.hashFile = hashFile;
