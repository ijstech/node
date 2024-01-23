"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalCache = void 0;
const DefaultExpires = 3600;
class LocalCache {
    constructor() {
        this.Data = {};
        this.Expires = {};
    }
    async get(key) {
        let expires = this.Expires[key];
        if (expires && expires <= (new Date().getTime() / 1000)) {
            delete this.Data[key];
            throw new Error('$key_not_found');
        }
        ;
        return this.Data[key];
    }
    async getValue(key) {
        let value = await this.get(key);
        try {
            return JSON.parse(value);
        }
        catch (err) {
            return value;
        }
    }
    async set(key, value, expires) {
        if (typeof value !== 'string')
            value = JSON.stringify(value);
        expires = (expires || DefaultExpires) + Math.floor(new Date().getTime() / 1000);
        this.Expires[key] = expires;
        this.Data[key] = value;
        return true;
    }
    async del(key) {
        delete this.Data[key];
        delete this.Expires[key];
        return true;
    }
}
exports.LocalCache = LocalCache;
;
