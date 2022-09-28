/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
/// <reference types="node" />
import Koa from 'koa';
import Tls from 'tls';
import { IRouterPluginOptions } from '@ijstech/plugin';
import { IDomainOptions } from '@ijstech/package';
import { IJobQueueConnectionOptions } from '@ijstech/types';
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
    workerOptions?: IWorkerOptions;
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
    addDomainPackage(domain: string, baseUrl: string, packagePath: string, options?: IDomainOptions): Promise<void>;
    getCert(domain: string): Promise<Tls.SecureContext>;
    getRouter(ctx: Koa.Context): Promise<{
        router: IRouterPluginOptions;
        baseUrl: string;
    }>;
    stop(): Promise<void>;
    start(): Promise<void>;
    use(middleware: any): void;
}
