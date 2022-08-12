"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const redis_1 = require("redis");
const DefaultExpires = 3600;
class RedisCache {
    constructor(options) {
        this.redisClient = new redis_1.RedisClient(options);
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this.redisClient.get(key, (err, value) => {
                if (err)
                    reject(err);
                else
                    resolve(value);
            });
        });
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
    set(key, value, expires) {
        return new Promise((resolve, reject) => {
            if (typeof value !== 'string')
                value = JSON.stringify(value);
            expires = expires || DefaultExpires;
            this.redisClient.set(key, value, 'EX', expires, err => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
    del(key) {
        return new Promise((resolve, reject) => {
            this.redisClient.del(key, err => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
}
exports.RedisCache = RedisCache;
;
