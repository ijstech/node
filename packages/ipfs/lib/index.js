"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashFile = exports.hashContent = exports.hashDir = exports.parse = void 0;
const ipfs_js_1 = __importDefault(require("./ipfs.js"));
const fs_1 = require("fs");
function parse(cid) {
    return ipfs_js_1.default.parse(cid);
}
exports.parse = parse;
async function hashDir(data, version) {
    return await ipfs_js_1.default.hashDir(data, version);
}
exports.hashDir = hashDir;
async function hashContent(content, version) {
    return await ipfs_js_1.default.hashContent(content, version);
}
exports.hashContent = hashContent;
async function hashFile(filePath, version) {
    let content = await fs_1.promises.readFile(filePath);
    return await hashContent(content, version);
}
exports.hashFile = hashFile;
;
