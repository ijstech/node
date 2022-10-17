/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import Koa from 'koa';
import { VM } from '@ijstech/vm';
import { IPackageScript, BigNumber, IRouterRequest, IRouterResponse, IWorkerPluginOptions, IRouterPluginOptions, IPlugins, IPluginOptions } from '@ijstech/types';
export { ResponseType } from '@ijstech/types';
export { BigNumber, IRouterRequest, IRouterResponse, IWorkerPluginOptions, IRouterPluginOptions };
export declare namespace Types {
    interface IField {
        prop?: string;
        field?: string;
        record?: string;
        size?: number;
        details?: any;
        table?: string;
        dataType?: 'key' | 'ref' | '1toM' | 'char' | 'varchar' | 'boolean' | 'integer' | 'decimal' | 'date' | 'dateTime' | 'time' | 'blob' | 'text' | 'mediumText' | 'longText';
    }
    interface IFields {
        [name: string]: IField;
    }
    interface IQueryData {
        [prop: string]: any;
    }
    interface IQueryRecord {
        a: 'i' | 'd' | 'u';
        k: string;
        d: IQueryData;
    }
    interface IQuery {
        id: number;
        table: string;
        fields: IFields;
        queries?: any[];
        records?: IQueryRecord[];
    }
    interface IQueryResult {
        id?: number;
        result?: any;
        error?: string;
    }
    interface IDBClient {
        applyQueries(queries: IQuery[]): Promise<IQueryResult[]>;
        query(sql: string, params?: any[]): Promise<any>;
        resolve(table: string, fields: IFields, criteria: any, args: any): Promise<any>;
        beginTransaction(): Promise<boolean>;
        checkTableExists(tableName: string): Promise<boolean>;
        commit(): Promise<boolean>;
        rollback(): Promise<boolean>;
    }
}
export declare function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string;
export declare function getPackageScript(packName: string, pack?: IPackageScript): Promise<string>;
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
    method?: string;
    hostname?: string;
    path?: string;
    url?: string;
    origUrl?: string;
    ip?: string;
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
export declare function RouterRequest(ctx: Koa.Context | IRouterRequestData): IRouterRequest;
export interface IRouterResponseData {
    body?: any;
    cookies?: ICookie;
    contentType?: string;
    statusCode?: number;
    header?: IHeader;
}
export declare function RouterResponse(ctx: Koa.Context | IRouterResponseData): IRouterResponse;
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
    plugins: IPlugins;
}
export declare abstract class IRouterPlugin extends IPlugin {
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin extends IPlugin {
    process(session: ISession, data: any): Promise<any>;
}
declare class PluginVM {
    protected options: IPluginOptions;
    vm: VM;
    constructor(options: IPluginOptions);
    setup(): Promise<boolean>;
    private loadPackage;
    loadDependencies(): Promise<void>;
}
declare class RouterPluginVM extends PluginVM implements IRouterPlugin {
    setup(): Promise<boolean>;
    init(session: ISession, params?: any): Promise<void>;
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
declare class WorkerPluginVM extends PluginVM implements IWorkerPlugin {
    setup(): Promise<boolean>;
    init(session: ISession, params?: any): Promise<void>;
    message(session: ISession, channel: string, msg: string): Promise<any>;
    process(session: ISession, data?: any): Promise<boolean>;
}
declare class Plugin {
    protected options: IPluginOptions;
    protected plugin: any;
    protected _session: ISession;
    protected pluginType: string;
    vm: VM;
    data: any;
    constructor(options: IPluginOptions);
    addPackage(packName: string, script?: string): Promise<void>;
    createPlugin(): Promise<void>;
    createVM(): any;
    createModule(): Promise<any>;
    init(params?: any): Promise<void>;
    get session(): ISession;
}
export declare class Router extends Plugin {
    protected plugin: IRouterPlugin;
    protected options: IRouterPluginOptions;
    constructor(options: IRouterPluginOptions);
    createVM(): Promise<RouterPluginVM>;
    route(ctx: Koa.Context, request?: IRouterRequest, response?: IRouterResponse): Promise<boolean>;
}
export declare class Worker extends Plugin {
    protected plugin: IWorkerPlugin;
    protected options: IWorkerPluginOptions;
    constructor(options: IWorkerPluginOptions);
    createVM(): Promise<WorkerPluginVM>;
    message(channel: string, msg: string): Promise<void>;
    process(data?: any): Promise<any>;
}
