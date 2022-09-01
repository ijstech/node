"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashFile1 = exports.hashFile = exports.hashContent = exports.hashDir = exports.hashItems = exports.parse = void 0;
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
            let result = await hashFile(path);
            items.push({
                cid: result.cid,
                name: file,
                size: result.size,
                type: 'file'
            });
        }
    }
    ;
    let result = await hashItems(items);
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
    return await ipfs_js_1.default.hashContent(content, version);
}
exports.hashContent = hashContent;
async function hashFile(filePath, version) {
    let content = await fs_1.promises.readFile(filePath);
    return {
        cid: await hashContent(content, version),
        size: content.length
    };
}
exports.hashFile = hashFile;
;
async function hashFile1(content1, options) {
    return ipfs_js_1.default.hashFile1(content1, options);
}
exports.hashFile1 = hashFile1;
