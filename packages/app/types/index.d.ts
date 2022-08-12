/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IHttpServerOptions, HttpServer } from '@ijstech/http';
import { ISchedulerOptions, Scheduler } from '@ijstech/schedule';
import { IQueueOptions, Queue } from '@ijstech/queue';
export interface IPlugin {
    scriptPath?: string;
    baseUrl?: string;
}
export interface IPlugins {
    [name: string]: IPlugin;
}
export interface IAppServerOptions {
    http?: IHttpServerOptions;
    schedule?: ISchedulerOptions;
    queue?: IQueueOptions;
}
export declare class AppServer {
    private options;
    httpServer: HttpServer;
    scheduler: Scheduler;
    queue: Queue;
    running: boolean;
    constructor(options: IAppServerOptions);
    start(): Promise<void>;
}
