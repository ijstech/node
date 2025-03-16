"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = loadPlugin;
const crypto_1 = require("./crypto");
exports.default = { hashPassword: crypto_1.hashPassword, randomBytes: crypto_1.randomBytes, randomUUID: crypto_1.randomUUID, verifyPassword: crypto_1.verifyPassword };
function loadPlugin(worker, options) {
    const plugin = {
        async hashPassword(password, salt, iterations, keylen, digest) {
            let result = await (0, crypto_1.hashPassword)(password, salt, iterations, keylen, digest);
            return JSON.stringify(result);
        },
        async verifyPassword(password, hash) {
            return await (0, crypto_1.verifyPassword)(password, hash);
        },
        async randomBytes(length, encoding) {
            return await (0, crypto_1.randomBytes)(length, encoding);
        },
        async randomUUID() {
            return await (0, crypto_1.randomUUID)();
        }
    };
    if (worker.vm) {
        worker.vm.injectGlobalObject('$$crypto_plugin', plugin);
    }
    else
        global['$$crypto_plugin'] = plugin;
}
;
