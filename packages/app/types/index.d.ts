import { IHttpServerOptions, HttpServer } from '@ijstech/http';
import { ISchedulerOptions, Scheduler } from '@ijstech/schedule';
import { IQueueOptions, Queue } from '@ijstech/queue';
import { PackageManager, IPackageOptions } from '@ijstech/package';
import { ICacheClientOptions, IDbConnectionOptions, IJobQueueConnectionOptions, IMessageConnection, IWalletAccount, IWalletNetworks } from '@ijstech/types';
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
    package?: IPackageOptions;
}
export interface IDomainOptions {
    cache?: ICacheClientOptions;
    db?: IDbConnectionOptions;
    queue?: IJobQueueConnectionOptions;
    message?: IMessageConnection;
    wallet?: {
        networks: IWalletNetworks;
        accounts?: IWalletAccount[];
    };
}
export declare class AppServer {
    private options;
    httpServer: HttpServer;
    scheduler: Scheduler;
    queue: Queue;
    running: boolean;
    private _packageManager;
    constructor(options: IAppServerOptions);
    get packageManager(): PackageManager;
    start(): Promise<void>;
    stop(): Promise<void>;
}
