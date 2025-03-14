/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
/// <reference types="node" />
import Koa from 'koa';
import Tls from 'tls';
import { IRouterPluginOptions } from '@ijstech/plugin';
import { PackageManager, IDomainRouterPackage } from '@ijstech/package';
import { IJobQueueConnectionOptions } from '@ijstech/types';
import { IStorageOptions } from '@ijstech/storage';
export interface IPlugin {
    scriptPath?: string;
    baseUrl?: string;
}
export interface IPlugins {
    [name: string]: IPlugin;
}
export interface IRouterOptions {
    module?: string;
    routes?: IRouterPluginOptions[];
}
export interface IWorkerOptions {
    enabled: boolean;
    jobQueue: string;
    connection: IJobQueueConnectionOptions;
}
export interface IHttpServerOptions {
    certPath?: string;
    ciphers?: string;
    cors?: boolean;
    port?: number;
    router?: IRouterOptions;
    securePort?: number;
    worker?: IWorkerOptions;
    storage?: IStorageOptions;
    domains?: {
        [domainName: string]: IDomainRouterPackage[];
    };
    packageManager?: PackageManager;
}
export declare class HttpServer {
    private app;
    private options;
    private ciphers;
    private ssl;
    private running;
    private http;
    private https;
    private withDefaultMiddleware;
    private packageManager;
    private queue;
    constructor(options: IHttpServerOptions);
    addDomainPackage(domain: string, pack: IDomainRouterPackage): Promise<void>;
    getCert(domain: string): Promise<Tls.SecureContext>;
    getRouter(ctx: Koa.Context): Promise<{
        router: IRouterPluginOptions;
        baseUrl: string;
    }>;
    stop(): Promise<unknown>;
    start(): Promise<void>;
    use(middleware: (ctx: Koa.Context, next: Koa.Next) => void): void;
}
