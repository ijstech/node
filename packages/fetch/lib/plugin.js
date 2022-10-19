"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
;
;
;
;
exports.Plugin = {
    async get(url, data) {
        return new Promise(async (resolve) => {
            let plugin = global.$$fetch_plugin;
            let result = await plugin.get(url, data);
            resolve(JSON.parse(result));
        });
    },
    async post(url, data) {
        return new Promise(async (resolve) => {
            let plugin = global.$$fetch_plugin;
            let result = await plugin.post(url, data);
            resolve(JSON.parse(result));
        });
    }
};
exports.default = exports.Plugin;
