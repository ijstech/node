"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFile = exports.request = exports.get = exports.post = void 0;
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
function post(urlString, data, headers) {
    return request('POST', urlString, data, headers);
}
exports.post = post;
function get(urlString, headers) {
    return request('GET', urlString, undefined, headers);
}
exports.get = get;
function request(method, urlString, data, headers) {
    return new Promise(function (resolve, reject) {
        let url = url_1.default.parse(urlString);
        headers = headers || {};
        if (typeof (data) != 'undefined') {
            if (typeof (data) != 'string') {
                data = JSON.stringify(data);
                if (!headers['Content-Type'])
                    headers['Content-Type'] = 'application/json';
            }
            headers['Content-Length'] = data.length;
        }
        let options = {
            hostname: url.hostname,
            path: url.path,
            method: method,
            headers: headers
        };
        function callback(res) {
            let data = '';
            let contentType = res.headers['content-type'];
            res.on('data', (chunk) => {
                if (res.statusCode == 200)
                    data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }
        let req;
        if (url.protocol == 'https:')
            req = https_1.default.request(options, callback);
        else
            req = http_1.default.request(options, callback);
        req.on('error', (err) => {
            reject(err);
        });
        req.write(data || '');
        req.end();
    });
}
exports.request = request;
;
async function getFile(options) {
    let headers = {
        "User-Agent": 'ijstech_secure_node',
        Accept: 'application/vnd.github.v3.raw'
    };
    if (options.token)
        headers.Authorization = `token ${options.token}`;
    let result = await get(`https://api.github.com/repos/${options.org}/${options.repo}/contents/${options.filePath}`, headers);
    return result;
}
exports.getFile = getFile;
exports.default = {
    getFile
};
