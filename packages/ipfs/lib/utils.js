"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cidToHash = exports.hashFile = exports.hashContent = exports.hashItems = exports.hashChunks = exports.hashChunk = exports.parse = void 0;
const ipfs_js_1 = __importDefault(require("./ipfs.js"));
const types_1 = require("./types");
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
        type: result.type == 'directory' ? 'dir' : result.type == 'file' ? 'file' : result.code == types_1.CidCode.RAW ? 'file' : undefined,
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
async function hashContent(content, version) {
    if (version == undefined)
        version = 1;
    if (content.length == 0) {
        return {
            cid: version == 1 ? 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku' : 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH',
            type: 'file',
            code: version == 1 ? 0x55 : 0x70,
            size: 0
        };
    }
    return ipfs_js_1.default.hashContent(content, version);
}
exports.hashContent = hashContent;
;
async function hashFile(file, version) {
    if (version == undefined)
        version = 1;
    if (file instanceof File) {
        if (file.size == 0)
            return await ipfs_js_1.default.hashContent('', version);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.addEventListener('error', (event) => {
                reject('Error occurred reading file');
            });
            reader.addEventListener('load', async (event) => {
                const data = new Uint8Array(event.target.result);
                let result = await ipfs_js_1.default.hashContent(data, version);
                resolve(result);
            });
        });
    }
    else
        return this.hashContent(file, version);
}
exports.hashFile = hashFile;
;
function cidToHash(cid) {
    return ipfs_js_1.default.cidToHash(cid);
}
exports.cidToHash = cidToHash;
;
