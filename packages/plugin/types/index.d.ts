import Koa from 'koa';
import { VM } from '@ijstech/vm';
import * as Types from '@ijstech/types';
export declare function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string;
export declare type IPluginScript = any;
export declare function loadModule(script: string, name?: string): IPluginScript;
export interface IWorkerPluginOptions extends Types.IPluginOptions {
    processing?: boolean;
}
export interface IQueuePluginOptions extends IWorkerPluginOptions {
    queue: string;
}
export declare type IRouterPluginMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export interface IRouterPluginOptions extends Types.IPluginOptions {
    form?: {
        host: string;
        token: string;
        package?: string;
        mainForm?: string;
    };
    github?: {
        org: string;
        repo: string;
        token: string;
    };
    baseUrl: string | string[];
    methods: IRouterPluginMethod[];
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
    route(session: ISession, request: Types.IRouterRequest, response: Types.IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin extends IPlugin {
    init?: (params?: any) => Promise<boolean>;
    message?: (session: ISession, channel: string, msg: string) => void;
    process(session: ISession, data: any): Promise<any>;
}
declare class PluginVM {
    protected options: Types.IPluginOptions;
    vm: VM;
    constructor(options: Types.IPluginOptions);
    init(): Promise<boolean>;
    loadDependencies(): Promise<void>;
}
declare class RouterPluginVM extends PluginVM implements IRouterPlugin {
    init(): Promise<boolean>;
    route(session: ISession, request: Types.IRouterRequest, response: Types.IRouterResponse): Promise<boolean>;
}
declare class WorkerPluginVM extends PluginVM implements IWorkerPlugin {
    init(): Promise<boolean>;
    message(session: ISession, channel: string, msg: string): Promise<void>;
    process(session: ISession, data?: any): Promise<boolean>;
}
declare class Plugin {
    protected options: Types.IPluginOptions;
    protected plugin: any;
    protected _session: ISession;
    vm: VM;
    data: any;
    constructor(options: Types.IPluginOptions);
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
    route(ctx: Koa.Context, baseUrl: string): Promise<boolean>;
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
