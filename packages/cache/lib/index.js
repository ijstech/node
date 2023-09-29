"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.getClient = void 0;
const local_1 = require("./local");
const redis_1 = require("./redis");
let Clients = {};
function getClient(options) {
    if (options && options.redis) {
        let id = options.redis.host + (options.redis.db || 0);
        if (!Clients[id])
            Clients[id] = new redis_1.RedisCache(options.redis);
        return Clients[id];
    }
    else {
        let id = '$$local';
        if (!Clients[id])
            Clients[id] = new local_1.LocalCache();
        return Clients[id];
    }
}
exports.getClient = getClient;
;
function loadPlugin(plugin, options, vm) {
    const resolveKey = (key) => {
        if (key.startsWith('$g:'))
            return key;
        else if (key.startsWith('$d:'))
            return `${plugin.domain || ''}:${key.substring(3)}`;
        else
            return `${plugin.id || ''}:${key}`;
    };
    return {
        async get(key) {
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            return await client.get(resolvedKey);
        },
        async set(key, value, expires) {
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            return await client.set(resolvedKey, value, expires);
        },
        async del(key) {
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            return await client.del(resolvedKey);
        },
        async getValue(key) {
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            let value = await client.get(resolvedKey);
            if (vm)
                return value;
            try {
                return JSON.parse(value);
            }
            catch (err) {
                return value;
            }
        }
    };
}
exports.loadPlugin = loadPlugin;
;
exports.default = loadPlugin;
