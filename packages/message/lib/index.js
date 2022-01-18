"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.Message = void 0;
const redis_1 = require("redis");
let RedisClients = {};
;
function getRedisClient(options) {
    let connection = options.connection.redis;
    let id = connection.host + (connection.db || 0);
    if (!RedisClients[id])
        RedisClients[id] = new redis_1.RedisClient(connection);
    return RedisClients[id];
}
class Message {
    constructor(worker, options) {
        this.worker = worker;
        this.options = options;
        if (options.subscribe) {
            for (let i = 0; i < options.subscribe.length; i++) {
                let channel = options.subscribe[i];
                this.subscribe(channel);
            }
        }
    }
    ;
    get client() {
        ;
        if (!this._client)
            this._client = new redis_1.RedisClient(this.options.connection.redis);
        return this._client;
    }
    ;
    subscribe(channel) {
        this.client.subscribe(channel, (error) => {
            if (error)
                console.dir('Failed to subscribe: ' + channel);
        });
        this.client.on("message", (channel, message) => {
            try {
                this.worker.message(channel, message);
            }
            catch (err) {
                console.dir(err);
            }
        });
    }
    ;
}
exports.Message = Message;
;
function loadPlugin(worker, options) {
    return {
        publish(channel, msg) {
            if (options.publish) {
                if (typeof (channel) == 'number')
                    channel = options.publish[channel];
                if (options.publish.indexOf(channel) > -1) {
                    let client = getRedisClient(options);
                    client.publish(channel, msg);
                }
                ;
            }
            ;
        }
    };
}
exports.loadPlugin = loadPlugin;
;
