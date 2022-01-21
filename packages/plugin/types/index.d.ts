import Koa from 'koa';
import { VM } from '@ijstech/vm';
import * as Types from '@ijstech/types';
export declare function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string;
export declare type IPluginScript = any;
export declare function loadModule(script: string, name?: string): IPluginScript;
export declare type IPackageVersion = string;
export interface IDependencies {
    [packageName: string]: IPackageVersion;
}
export interface IPluginOptions {
    memoryLimit?: number;
    timeLimit?: number;
    isolated?: boolean;
    script?: string;
    scriptPath?: string;
    params?: any;
    dependencies?: IDependencies;
    plugins?: Types.IRequiredPlugins;
}
export interface IWorkerPluginOptions extends IPluginOptions {
    processing?: boolean;
}
export interface IQueuePluginOptions extends IWorkerPluginOptions {
    queue: string;
}
export declare type IRouterPluginMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export interface IRouterPluginOptions extends IPluginOptions {
    baseUrl: string;
    methods: IRouterPluginMethod[];
}
interface ParsedUrlQuery {
    [key: string]: string | string[];
}
export interface IRouterRequest {
    method: string;
    hostname: string;
    path: string;
    url: string;
    origUrl: string;
    ip: string;
    query?: ParsedUrlQuery;
    params?: any;
    body?: any;
    type?: string;
    cookie: (name: string) => string;
    header: (name: string) => string;
}
declare type ResponseType = 'application/json' | 'image/gif' | 'image/jpeg' | 'image/png' | 'image/svg+xml' | 'text/plain' | 'text/html';
export interface IRouterResponse {
    statusCode: number;
    cookie: (name: string, value: string, option: any) => void;
    end: (value: any, contentType?: ResponseType) => void;
    header: (name: string, value: string) => void;
}
export declare type QueueName = string;
export interface IRequiredPlugins {
    queue?: QueueName[];
    cache?: boolean;
    db?: boolean;
}
export declare abstract class IPlugin {
}
export interface ISession {
    params?: any;
    plugins: Types.IPlugins;
}
export declare abstract class IRouterPlugin extends IPlugin {
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin extends IPlugin {
    init?: (params?: any) => Promise<boolean>;
    message?: (session: ISession, channel: string, msg: string) => void;
    process(session: ISession, data: any): Promise<any>;
}
declare class PluginVM {
    protected options: IPluginOptions;
    vm: VM;
    constructor(options: IPluginOptions);
    init(): Promise<boolean>;
    loadDependencies(): Promise<void>;
}
declare class RouterPluginVM extends PluginVM implements IRouterPlugin {
    init(): Promise<boolean>;
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
declare class WorkerPluginVM extends PluginVM implements IWorkerPlugin {
    init(): Promise<boolean>;
    message(session: ISession, channel: string, msg: string): Promise<void>;
    process(session: ISession, data?: any): Promise<boolean>;
}
declare class Plugin {
    protected options: IPluginOptions;
    protected plugin: any;
    protected _session: ISession;
    constructor(options: IPluginOptions);
    createPlugin(): Promise<void>;
    createVM(): any;
    createModule(): Promise<any>;
    get session(): ISession;
}
export declare class Router extends Plugin {
    protected plugin: IRouterPlugin;
    protected options: IRouterPluginOptions;
    constructor(options: IRouterPluginOptions);
    createVM(): Promise<RouterPluginVM>;
    route(ctx: Koa.Context): Promise<boolean>;
}
export declare class Worker extends Plugin {
    protected plugin: IWorkerPlugin;
    protected options: IWorkerPluginOptions;
    constructor(options: IWorkerPluginOptions);
    createVM(): Promise<WorkerPluginVM>;
    message(channel: string, msg: string): Promise<void>;
    process(data?: any): Promise<any>;
}
export {};
