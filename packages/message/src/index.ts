/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import * as Types from '@ijstech/types';
import {Worker} from '@ijstech/plugin';
import {RedisClient} from 'redis';

let RedisClients = {};
export interface IMessengerConnection{
    redis: Types.IRedisConnection;
};
export interface IMessengerChannelOptions{
    channel: string;
    subscribe?: boolean;
    publish?: boolean;
}
function getRedisClient(options: Types.IMessageRequiredPluginOptions): RedisClient{
    let connection = options.connection.redis;
    let id = connection.host + (connection.db || 0);
    if (!RedisClients[id])
        RedisClients[id] = new RedisClient(connection);
    return RedisClients[id]
}
export class Message{
    private options: Types.IMessageRequiredPluginOptions;
    private _client: RedisClient;
    private worker: Worker;
    constructor(worker: Worker, options: Types.IMessageRequiredPluginOptions){
        this.worker = worker;
        this.options = options;
        if (options.subscribe){
            for (let i = 0; i < options.subscribe.length; i ++){
                let channel = options.subscribe[i];
                this.subscribe(channel);
            }
        }   
    };
    get client(): RedisClient{;
        if (!this._client)
            this._client = new RedisClient(this.options.connection.redis)
        return this._client;
    };
    subscribe(channel: string){
        this.client.subscribe(channel, (error:any)=>{
            if (error)
                console.dir('Failed to subscribe: ' +  channel)
        });
        this.client.on("message", (channel, message) => {
            try{
                this.worker.message(channel, message)
            }
            catch(err){
                console.dir(err)
            }
        });
    };
};
export function loadPlugin(worker: Worker, options: Types.IMessageRequiredPluginOptions): Types.IMessagePlugin{
    return {
        publish(channel:string|number, msg: string){   
            if (options.publish){
                if (typeof(channel) == 'number')
                    channel = options.publish[channel];
                    
                if (options.publish.indexOf(channel) > -1){
                    let client = getRedisClient(options);
                    client.publish(channel, msg);
                };
            };
        }
    };
};