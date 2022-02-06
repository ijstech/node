/// <reference types="node" />
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
    routes: IRouterPluginOptions[];
}
export interface IHttpServerOptions {
    ciphers?: string;
    certPath?: string;
    port?: number;
    securePort?: number;
    router: IRouterOptions;
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
    checkBaseUrl(url: string, routerOptions: IRouterPluginOptions): string;
    start(): Promise<void>;
    use(middleware: any): void;
}
