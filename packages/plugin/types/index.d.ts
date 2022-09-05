/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import Koa from 'koa';
import { VM } from '@ijstech/vm';
import * as Types from '@ijstech/types';
export { ResponseType } from '@ijstech/types';
export { BigNumber, IRouterRequest, IRouterResponse, IWorkerPluginOptions, IRouterPluginOptions } from '@ijstech/types';
export declare function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string;
export declare function getPackageScript(packName: string, pack?: Types.IPackageScript): Promise<string>;
export declare type IPluginScript = any;
export declare function loadModule(script: string, name?: string): IPluginScript;
export interface ICookie {
    [name: string]: {
        value: string;
        option: any;
    };
}
export interface IHeader {
    [name: string]: {
        value: string;
        option: any;
    };
}
export interface ParsedUrlQuery {
    [key: string]: string | string[];
}
export interface IRouterRequestData {
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
    cookies?: {
        [key: string]: any;
    };
    headers?: {
        [key: string]: any;
    };
}
export interface IRouterResponseData {
    body?: any;
    cookies?: ICookie;
    contentType?: string;
    statusCode?: number;
    header?: IHeader;
}
export declare type QueueName = string;
export interface IRequiredPlugins {
    queue?: QueueName[];
    cache?: boolean;
    db?: boolean;
}
export declare abstract class IPlugin {
    init?(session: ISession, params?: any): Promise<void>;
}
export interface ISession {
    params?: any;
    plugins: Types.IPlugins;
}
export declare abstract class IRouterPlugin extends IPlugin {
    route(session: ISession, request: Types.IRouterRequest, response: Types.IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin extends IPlugin {
    process(session: ISession, data: any): Promise<any>;
}
declare class PluginVM {
    protected options: Types.IPluginOptions;
    vm: VM;
    constructor(options: Types.IPluginOptions);
    setup(): Promise<boolean>;
    private loadPackage;
    loadDependencies(): Promise<void>;
}
declare class RouterPluginVM extends PluginVM implements IRouterPlugin {
    setup(): Promise<boolean>;
    init(session: ISession, params?: any): Promise<void>;
    route(session: ISession, request: Types.IRouterRequest, response: Types.IRouterResponse): Promise<boolean>;
}
declare class WorkerPluginVM extends PluginVM implements IWorkerPlugin {
    setup(): Promise<boolean>;
    init(session: ISession, params?: any): Promise<void>;
    message(session: ISession, channel: string, msg: string): Promise<any>;
    process(session: ISession, data?: any): Promise<boolean>;
}
declare class Plugin {
    protected options: Types.IPluginOptions;
    protected plugin: any;
    protected _session: ISession;
    protected pluginType: string;
    vm: VM;
    data: any;
    constructor(options: Types.IPluginOptions);
    addPackage(packName: string, script?: string): Promise<void>;
    createPlugin(): Promise<void>;
    createVM(): any;
    createModule(): Promise<any>;
    init(params?: any): Promise<void>;
    get session(): ISession;
}
export declare class Router extends Plugin {
    protected plugin: IRouterPlugin;
    protected options: Types.IRouterPluginOptions;
    constructor(options: Types.IRouterPluginOptions);
    createVM(): Promise<RouterPluginVM>;
    route(ctx: Koa.Context, baseUrl: string): Promise<boolean>;
}
export declare class Worker extends Plugin {
    protected plugin: IWorkerPlugin;
    protected options: Types.IWorkerPluginOptions;
    constructor(options: Types.IWorkerPluginOptions);
    createVM(): Promise<WorkerPluginVM>;
    message(channel: string, msg: string): Promise<void>;
    process(data?: any): Promise<any>;
}
