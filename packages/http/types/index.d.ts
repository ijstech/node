/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
/// <reference types="node" />
import Koa from 'koa';
import Tls from 'tls';
import { IRouterPluginOptions } from '@ijstech/plugin';
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
export interface IHttpServerOptions {
    ciphers?: string;
    certPath?: string;
    port?: number;
    securePort?: number;
    router?: IRouterOptions;
}
export declare class HttpServer {
    private app;
    private options;
    private ciphers;
    private ssl;
    private running;
    private http;
    private https;
    constructor(options: IHttpServerOptions);
    getCert(domain: string): Promise<Tls.SecureContext>;
    getRouter(ctx: Koa.Context): {
        router: IRouterPluginOptions;
        baseUrl: string;
    };
    start(): Promise<void>;
    use(middleware: any): void;
}
