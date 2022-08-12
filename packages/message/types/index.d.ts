/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import * as Types from '@ijstech/types';
import { Worker } from '@ijstech/plugin';
import { RedisClient } from 'redis';
export interface IMessengerConnection {
    redis: Types.IRedisConnection;
}
export interface IMessengerChannelOptions {
    channel: string;
    subscribe?: boolean;
    publish?: boolean;
}
export declare class Message {
    private options;
    private _client;
    private worker;
    constructor(worker: Worker, options: Types.IMessageRequiredPluginOptions);
    get client(): RedisClient;
    subscribe(channel: string): void;
}
export declare function loadPlugin(worker: Worker, options: Types.IMessageRequiredPluginOptions): Types.IMessagePlugin;
