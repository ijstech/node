import { IHttpServerOptions } from '@ijstech/http';
import { ISchedulerOptions } from '@ijstech/schedule';
import { IQueueOptions } from '@ijstech/queue';
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
    private httpServer;
    private scheduler;
    private queue;
    private running;
    constructor(options: IAppServerOptions);
    start(): Promise<void>;
}
