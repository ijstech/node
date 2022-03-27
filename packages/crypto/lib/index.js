"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.verifyPassword = exports.hashPassword = void 0;
const crypto_1 = require("./crypto");
Object.defineProperty(exports, "hashPassword", { enumerable: true, get: function () { return crypto_1.hashPassword; } });
Object.defineProperty(exports, "verifyPassword", { enumerable: true, get: function () { return crypto_1.verifyPassword; } });
function loadPlugin(worker, options) {
    const plugin = {
        async hashPassword(password, salt, iterations, keylen, digest) {
            let result = await crypto_1.hashPassword(password, salt, iterations, keylen, digest);
            return JSON.stringify(result);
        },
        async verifyPassword(password, hash) {
            return await crypto_1.verifyPassword(password, hash);
        }
    };
    if (worker.vm) {
        worker.vm.injectGlobalObject('$$crypto_plugin', plugin);
    }
    else
        global['$$crypto_plugin'] = plugin;
}
exports.loadPlugin = loadPlugin;
;
