/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Fs from 'fs';
import Path from 'path';
import Koa from 'koa';
import {VM} from '@ijstech/vm';
import {ITaskManager, IStepConfig, ITaskOptions, IPackageScript, BigNumber, IRouterRequest, IRouterResponse, IWorker, IWorkerPluginOptions, IRouterPluginOptions, ResponseType, IPlugins, IPluginOptions} from '@ijstech/types';
export {ResponseType, IRequiredPlugins} from '@ijstech/types';
export {BigNumber, IRouterRequest, IRouterResponse, IWorkerPluginOptions, IRouterPluginOptions};
import {PluginCompiler, PluginScript} from '@ijstech/tsc';
export {LocalTaskManager} from './localTaskManager';

export declare function step(config?: IStepConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function task(options?: ITaskOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

export declare namespace Types{
    export interface IWalletAccount {
        address: string;
        privateKey?: string;
    }
    export interface IWalletLog {
        address: string;
        data: string;
        topics: string[];
        logIndex: bigint;
        transactionIndex: bigint;
        transactionHash: string;
        blockHash: string;
        blockNumber: bigint;
        removed: boolean;
        type?: string;
    }
    export interface IWalletEventLog {
        event: string
        address: string
        returnValues: any
        logIndex: number
        transactionIndex: number
        transactionHash: string
        blockHash: string
        blockNumber: number
        raw ? : {
            data: string,
            topics: string[]
        }
    }
    export interface IWalletEvent{
        name: string;
        address: string;
        blockNumber: bigint;
        logIndex: bigint;
        topics: string[];
        transactionHash: string;
        transactionIndex: bigint;        
        data: any;
        rawData: any;
    }
    export interface IWalletTransaction {
        hash: string;
        nonce: bigint;
        blockHash: string | null;
        blockNumber: bigint | null;
        transactionIndex: bigint | null;
        from: string;
        to: string | null;
        value: BigNumber;
        gasPrice: BigNumber;
        maxPriorityFeePerGas?: bigint | string | BigNumber;
        maxFeePerGas?: bigint | string | BigNumber;
        gas: bigint;
        input: string;
    }
    export interface IWalletBlockTransactionObject {
        number: bigint;
        hash: string;
        parentHash: string;
        nonce: string;
        sha3Uncles: string;
        logsBloom: string;
        transactionRoot: string;
        stateRoot: string;
        receiptsRoot: string;
        miner: string;
        extraData: string;
        gasLimit: bigint;
        gasUsed: bigint;
        timestamp: bigint | string;
        baseFeePerGas?: bigint;
        size: bigint;
        difficulty: bigint;
        totalDifficulty: bigint;
        uncles: string[];
        transactions: IWalletTransaction[];
    }
    export interface IWalletTransactionReceipt{
        status: bigint;
        transactionHash: string;
        transactionIndex: bigint;
        blockHash: string;
        blockNumber: bigint;
        from: string;
        to: string;
        contractAddress?: string;
        cumulativeGasUsed: bigint;
        gasUsed: bigint;
        effectiveGasPrice: bigint;
        logs: IWalletLog[];
        logsBloom: string;
        events?: {
            [eventName: string]: IWalletEventLog;
        };
    }
    export interface IWalletTokenInfo{
        name: string;
        symbol: string;
        totalSupply: BigNumber;
        decimals: number;	
    }
    type stringArray = string | _stringArray
    interface _stringArray extends Array<stringArray> { }
    export interface IWalletUtils{
        fromDecimals(value: BigNumber | number | string, decimals?: number): BigNumber;
        fromWei(value: any, unit?: string): string;
        hexToUtf8(value: string): string;
        sha3(value: string): string;
        stringToBytes(value: string | stringArray, nByte?: number): string | string[];
        stringToBytes32(value: string | stringArray): string | string[];
        toDecimals(value: BigNumber | number | string, decimals?: number): BigNumber;
        toString(value: any): string;
        toUtf8(value: any): string;		
        toWei(value: string, unit?: string): string;
    }
    export interface IAbiDefinition {
        _abi: any;
    }
    export interface IMulticallContractCall {
        to: string;
        contract: IAbiDefinition;
        methodName: string;
        params: any[];
    }
    export interface IWalletPlugin {
        account: IWalletAccount;
        accounts: Promise<string[]>;
        address: string;
        balance: Promise<BigNumber>;
        balanceOf(address: string): Promise<BigNumber>;    
        _call(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<any>;    
        chainId: number;
        createAccount(): IWalletAccount;
        decode(abi:any, event:IWalletLog|IWalletEventLog, raw?:{data: string,topics: string[]}): IWalletEvent;  
        decodeErrorMessage(msg: string): any;  
        decodeEventData(data: IWalletLog, events?: any): Promise<IWalletEvent>;
        decodeLog(inputs: any, hexString: string, topics: any): any;
        defaultAccount: string;
        getAbiEvents(abi: any[]): any;
        getAbiTopics(abi: any[], eventNames: string[]): any[];
        getBlock(blockHashOrBlockNumber?: number | string, returnTransactionObjects?: boolean): Promise<IWalletBlockTransactionObject>;
        getBlockNumber(): Promise<number>;
        getBlockTimestamp(blockHashOrBlockNumber?: number | string): Promise<number>;
        getChainId(): Promise<number>;
        getContractAbi(address: string): any;
        getContractAbiEvents(address: string): any;
        getTransaction(transactionHash: string): Promise<IWalletTransaction>;
        methods(...args: any): Promise<any>;
        set privateKey(value: string);
        recoverSigner(msg: string, signature: string): Promise<string>;		
        registerAbi(abi: any[] | string, address?: string|string[], handler?: any): string;
        registerAbiContracts(abiHash: string, address: string|string[], handler?: any): any;
        send(to: string, amount: number): Promise<IWalletTransactionReceipt>;		
        _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<IWalletTransactionReceipt>;
        scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<IWalletEvent[]>;		
        signMessage(msg: string): Promise<string>;
        signTransaction(tx: any, privateKey?: string): Promise<string>;
        tokenInfo(address: string): Promise<IWalletTokenInfo>;
        utils: IWalletUtils;
        verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;	
        soliditySha3(...val: any[]): string;	
        toChecksumAddress(address: string): string;
        isAddress(address: string): boolean;	
        _txObj(abiHash: string, address: string, methodName:string, params?:any[], options?:number|BigNumber|IWalletTransaction): Promise<IWalletTransaction>;
        _txData(abiHash: string, address: string, methodName:string, params?:any[], options?:number|BigNumber|IWalletTransaction): Promise<string>;
        multiCall(calls: {to: string; data: string}[], gasBuffer?: string): Promise<{results: string[]; lastSuccessIndex: BigNumber}>;
        doMulticall(
            contracts: IMulticallContractCall[], 
            gasBuffer?: string
        ): Promise<any[]>;
        encodeFunctionCall<T extends IAbiDefinition, F extends Extract<keyof T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>>(
            contract: T, 
            methodName: F, 
            params: string[]
        ): string;
        decodeAbiEncodedParameters<T extends IAbiDefinition, F extends Extract<keyof T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>>(
			contract: T, 
			methodName: F, 
			hexString: string
		): any;
    }
    export interface ICachePlugin{
        del(key: string): Promise<boolean>;
        get(key: string): Promise<string>;
        getValue(key: string): Promise<any>;
        set(key: string, value: any, expires?: number): Promise<boolean>;
    }
    export interface IDBPlugin{
        getConnection(name?: string): IDBClient;
    }
    export interface IQueueJob{
        id: string;
        progress: number;
        status: string;
    }
    export interface IQueuePlugin {
        createJob(queue: string|number, data:any, waitForResult?: boolean, timeout?: number, retries?: number): Promise<IQueueJob>
    }
    export interface IMessagePlugin {
        publish(channel: string|number, msg: string):void;
        subscribe(channel: string|number, cb?: (error: Error, msg: string) => void):void;
    }
    export interface IPlugins{
        cache?: ICachePlugin;
        db?: IDBPlugin;
        queue?: IQueuePlugin;
        message?: IMessagePlugin;
        wallet?: IWalletPlugin;
    }
    interface IField{
        prop?: string;
        field?: string;
        record?: string;
        size?: number;
        details?: any;
        table?: string;
        dataType?: 'key'|'ref'|'1toM'|'char'|'varchar'|'boolean'|'integer'|'decimal'|'date'|'dateTime'|'time'|'blob'|'text'|'mediumText'|'longText';
        notNull?: boolean;
        default?: any;
    }
    interface IFields{[name: string]: IField}    
    interface IQueryData{[prop: string]: any}
    export interface IQueryRecord{
        a: 'i'|'d'|'u', //insert, delete/ update
        k: string;
        d: IQueryData;
    }
    export interface IQuery{
        id: number;
        table: string;
        fields: IFields;
        queries?: any[];
        records?: IQueryRecord[];
    }
    export interface IQueryResult {
        id?: number;
        result?: any;
        error?: string;
    }
    export type TableIndexType = 'UNIQUE'|'NON_UNIQUE';
    export interface ITableIndexProps{
        name: string;
        columns: string[]; 
        type?: TableIndexType;
    }
    export interface IDBClient{
        applyQueries(queries: IQuery[]): Promise<IQueryResult[]>;
        beginTransaction():Promise<boolean>;
        checkTableExists(tableName: string): Promise<boolean>;
        commit():Promise<boolean>;
        query(sql: string, params?: any[]): Promise<any>;
        resolve(table: string, fields: IFields, criteria: any, args: any): Promise<any>;
        rollback(): Promise<boolean>;
        syncTableSchema(tableName: string, fields: IFields): Promise<boolean>;
        syncTableIndexes(tableName: string, indexes: ITableIndexProps[]): Promise<boolean>;
    }
};

const RootPath = process.cwd();
let Modules = {};
let LoadingPackageName: string = '';
let LastDefineModule: any;
global.define = function(id: string, deps: string[], callback: Function){
    if (typeof (id) == 'function') {
        callback = id;
        Modules[LoadingPackageName] = callback();
    }
    else{
        let result = [];
        let exports = {};
        for (let i = 0; i < deps.length; i ++){
            let dep = deps[i];
            if (dep == 'require')
                result.push(null)
            else if (dep == 'exports'){
                result.push(exports);
            }
            else{
                result.push(Modules[dep]);
            }
        };
        if (callback)
            callback.apply(this, result);
        LastDefineModule = exports;
        if (id == 'index' || id == 'plugin')
            Modules[LoadingPackageName || 'index'] = exports
        else
            Modules[id] = exports;
    };
};
// global.define.amd = true;

export function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string{    
    let rootPath = Path.resolve(...rootPaths);    
    let result = Path.join(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    return result.startsWith(rootPath) ? result : undefined;
};
function getScript(filePath: string, modulePath?: string): Promise<string>{
    return new Promise(async (resolve)=>{
        try{
            if (modulePath)
                filePath = Path.join(modulePath, filePath);
            if (!filePath.startsWith('/'))
                filePath = resolveFilePath([RootPath], filePath, true);
            let isDir = (await Fs.promises.lstat(filePath)).isDirectory();
            if (isDir){
                let pack = await getPackage(filePath);
                if (pack.directories && pack.directories.bin){
                    let compiler = new PluginCompiler();
                    compiler.addDirectory(resolveFilePath([filePath], pack.directories.bin))
                    let result = await compiler.compile();
                    return resolve(result.script)
                }
                resolve('');
            }
            else{
                Fs.readFile(filePath, 'utf8', (err, result)=>{
                    if (err)
                        resolve('')
                    else
                        resolve(result);
                });
            }
        }
        catch(err){
            resolve('')
        }
    });
};
async function getPackage(filePath: string): Promise<any>{
    try{
        let text = await getScript(filePath + '/package.json');
        if (text)
            return JSON.parse(text);
    }
    catch(err){
        return {};
    }
};
function getPackageDir(pack: string): string{
    if (pack[0] != '/')
    pack = require.resolve(pack);
    let dir = Path.dirname(pack);
    if (Fs.existsSync(Path.resolve(dir, 'package.json')))
        return dir
    else
        return getPackageDir(dir);
};
export async function getPackageScript(packName: string, pack?: IPackageScript): Promise<string>{
    let result: string;
    let packPath = '';
    if (!pack){
        pack = {};
        if (packName.startsWith('@ijstech/')){
            packName = packName.slice(9)
            packPath = resolveFilePath([__dirname, '../..'], packName, true);
        };
        if (!packPath)
            packPath = getPackageDir(packName);
    }
    else if (pack){
        if (pack.script && pack.script.startsWith('file:'))
            packPath = resolveFilePath([RootPath], pack.script.substring(5), true)
        else if (pack.script)
            return pack.script
        else if (!pack.dts)
            packPath = getPackageDir(packName);
    };
    if (packPath){
        let p = await getPackage(packPath);
        if (p){
            let libPath = resolveFilePath([packPath], p.plugin || p.browser || p.main || 'index.js');
            if (libPath){
                let script = await getScript(libPath);
                pack.script = script;
                return script;
            }
        };
    };  
};
export type IPluginScript = any;
export function loadModule(script: string, name?: string): IPluginScript{
    global.define.amd = true;
    try{
        LoadingPackageName = name;
        LastDefineModule = null;
        var m = new (<any>module).constructor();
        m.filename = name;
        m._compile(script, name || 'index');
        LoadingPackageName = '';
    }
    finally{
        global.define.amd = undefined;
    };
    return Modules[name || 'index'] || LastDefineModule;
};
function cloneObject(value: any): any{
    if (value)
        return JSON.parse(JSON.stringify(value))
    else
        return;
};
export interface ICookie {
    [name: string]: {value:string,option:any};
}
export interface IHeader {
    [name: string]: {value:string,option:any};
}
export interface ParsedUrlQuery {[key: string]: string | string[]};
export interface IRouterRequestData{
    method?: string,
    hostname?: string,
    path?: string;
    url?: string;
    origUrl?: string;
    ip?: string;
    query?: ParsedUrlQuery;
    params?: any;
    body?: any;
    type?: string;
    cookies?: {[key: string]: any};
    headers?: {[key: string]: any};

}
export function RouterRequest(ctx: Koa.Context | IRouterRequestData): IRouterRequest{
    if (isContext(ctx)){
        return {
            method: ctx.method,
            hostname: ctx.hostname || '',
            path: ctx.path || '/',
            url: ctx.url || '/',
            origUrl: ctx.origUrl || ctx.url || '/',
            ip: ctx.ip || '',
            type: ctx.request.type,
            query: cloneObject(ctx.request.query),
            params: cloneObject(ctx.params),
            body: cloneObject((<any>ctx.request).body),
            cookie: function(name: string){
                return ctx.cookies.get(name);
            },
            header: function(name: string){
                return ctx.get(name);
            }
        }
    }
    else if (ctx){
        return {
            method: ctx.method || 'GET',
            hostname: ctx.hostname || '',
            path: ctx.path || '/',
            url: ctx.url || '/',
            origUrl: ctx.origUrl || ctx.url || '/',
            ip: ctx.ip || '',
            type: ctx.type,
            query: ctx.query,
            params: ctx.params,
            body: ctx.body,
            cookie: function(name: string){
                return ctx.cookies?ctx.cookies[name]:null;
            },
            header: function(name: string){
                return ctx.headers?ctx.headers[name]:null;
            }
        };
    }
};
export interface IRouterResponseData{
    body?: any;
    cookies?: ICookie;
    contentType?: string;
    statusCode?: number;
    header?: IHeader;
}
function isContext(object: any): object is Koa.Context {
    return typeof(object.cookies?.set) == 'function';
}
export function RouterResponse(ctx: Koa.Context | IRouterResponseData): IRouterResponse{    
    if (isContext(ctx)){
        ctx.statusCode = 200;
        return {
            statusCode: function(value){
                ctx.statusCode = value
            },
            cookie: function(name: string, value: string, option?: any){
                ctx.cookies.set(name, value, option)
            },
            end: function(value: any, contentType?: ResponseType){       
                if (!contentType && typeof(value) == 'object')
                    contentType = 'application/json';
                ctx.response.set('Content-Type', contentType || 'text/plain');
                ctx.body = value;
            },
            header: function(name: string, value: any){
                ctx.set(name, value);
            }
        };
    }
    else if (ctx){    
        ctx.statusCode = 200;            
        return {  
            statusCode: function(value){
                ctx.statusCode = value
            },
            cookie: function(name: string, value: string, option?: any){
                ctx.cookies = ctx.cookies || {};
                ctx.cookies[name] = {
                    value,
                    option
                }
            },
            end: function(value: any, contentType?: ResponseType){       
                ctx.contentType = contentType || 'application/json';
                ctx.body = value;
            },
            header: function(name: string, value: any){
                ctx.header = ctx.header || {};
                ctx.header[name] = value;
            }
        };
    }
};
export type QueueName = string;
// export interface IRequiredPlugins{
//     queue?: QueueName[];
//     cache?: boolean;
//     db?: boolean;
//     fetch?: boolean;
// };
export declare abstract class IPlugin {    
    init?(session: ISession, params?: any):Promise<void>;
};
export interface ISession{
    taskId?: string;
    params?: any;
    plugins: Types.IPlugins;
};
export declare abstract class IRouterPlugin extends IPlugin{
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;    
};
export declare abstract class IWorkerPlugin extends IPlugin{    
    process(session: ISession, data: any): Promise<any>;
};
function getTaskManagerPlugin(taskManager: ITaskManager){
    let plugin: ITaskManager = {
        completeStep: async function(taskId: string, stepName: string){
            return await taskManager.completeStep(taskId, stepName);
        },
        completeTask: async function(taskId: string){
            return await taskManager.completeTask(taskId);
        },
        loadTask: async function(taskId: string) {
            let result = await taskManager.loadTask(taskId);
            return JSON.stringify(result) as any;
        },
        resumeTask: async function(taskId: string){
            return await taskManager.resumeTask(taskId);
        },
        startTask: async function(options: ITaskOptions, id?: string){
            return await taskManager.startTask(JSON.stringify(options), id);
        }        
    }
    return plugin;
};
class PluginVM{
    protected options: IPluginOptions;
    public vm: VM;        
    constructor(options: IPluginOptions){
        this.options = options;        
        this.vm = new VM({
            logging: true,
            memoryLimit: options.memoryLimit,
            timeLimit: options.timeLimit
        });
    };
    get id(): string{
        return this.options.id;
    };
    async setup(): Promise<boolean>{
        if (this.options.taskManager){
            this.vm.injectGlobalObject('$$taskManager', getTaskManagerPlugin(this.options.taskManager), '');
        }
        this.vm.injectGlobalScript(`
define("@ijstech/plugin", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.task = exports.step = void 0;

//copy from lib/decorators.js ==>
exports.step = step;
exports.task = task;
function step(config) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor?.value;
        let stepName = propertyKey.toString();
        descriptor.value = async function (...args) {
            let taskManager = global['$$taskManager'];
            const taskId = this.taskId;
            if (taskManager) {
                if (!taskId) {
                    throw new Error('Task ID is not set.');
                }
                ;
                if (taskManager) {
                    let taskdata = await taskManager.loadTask(taskId);
                    const task = JSON.parse(taskdata);
                    if (task?.completedSteps.includes(stepName)) {
                        return;
                    }
                    ;
                }
                ;
            }
            ;
            let attempt = 0;
            let delay = config?.delay || 1000;
            let retryOnFailure;
            let delayMultiplier = config?.delayMultiplier || 2;
            if (config?.retryOnFailure !== false && config?.maxAttempts)
                retryOnFailure = true;
            else
                retryOnFailure = config?.retryOnFailure || false;
            let maxAttempts = config?.maxAttempts || 3;
            while (attempt < maxAttempts) {
                try {
                    let result = await originalMethod.apply(this, args);
                    if (taskManager)
                        await taskManager.completeStep(taskId, stepName);
                    return result;
                }
                catch (error) {
                    if (!retryOnFailure) {
                        throw error;
                    }
                    ;
                    attempt++;
                    if (attempt < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= delayMultiplier;
                    }
                    else {
                        throw error;
                    }
                    ;
                }
                ;
            }
            ;
        };
        return descriptor;
    };
}
;
function task(options) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (taskId) {
            let taskManager = global.$$taskManager;
            if (taskManager) {
                let task;
                if (taskId) {
                    let data = await taskManager.loadTask(taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data);
                    else
                        task = data;
                }
                if (!task) {
                    const data = await taskManager.startTask(options, taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data);
                    else
                        task = data;
                    taskId = task.id;
                    this.taskId = task.id;
                }
                else {
                    this.taskId = task.id;
                    await taskManager.resumeTask(task.id);
                }
                ;
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    await taskManager.completeTask(this.taskId);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
            else {
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
        };
        return descriptor;
    };
};
//<<===   
    
});`)
        await this.loadDependencies();
        this.vm.injectGlobalScript(this.options.script);     
        return;
    };
    private async loadPackage(name: string, pack?: IPackageScript){
        let script = await getPackageScript(name, pack);
        if (script)
            this.vm.injectGlobalPackage(name, script)
        else
            throw new Error('#Failed to load package: ' + name)
    };
    async loadDependencies(){
        if (this.options.plugins){
            if (this.options.plugins.db)
                await this.loadPackage('@ijstech/pdm');
            if (this.options.plugins.wallet){
                await this.loadPackage('bignumber.js');
                await this.loadPackage('@ijstech/wallet');
                await this.loadPackage('@ijstech/eth-contract');
            };  
            if (this.options.plugins.fetch){
                await this.loadPackage('@ijstech/fetch');
            }
        };         
        if (this.options.dependencies){
            for (let packname in this.options.dependencies){
                if (packname != '@ijstech/plugin'){
                    let pack = this.options.dependencies[packname];
                    await this.loadPackage(packname, pack)
                };
            };
        };
    };
};
class RouterPluginVM extends PluginVM implements IRouterPlugin{
    async setup(): Promise<boolean>{        
        await super.setup();
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'] || global._$$currModule;   
            let fn = module.default['router'] || module.default;
            global.$$router = new fn();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$init){
                        if (global.$$router.init){
                            let data = global.$$data;
                            if (data)
                                data = JSON.parse(data);
                            try{
                                global.$$router.init(global.$$session, data);
                            }
                            catch(err){}
                        }
                    }
                    else{
                        let result = await global.$$router.route(global.$$session, global.$$request, global.$$response);
                        return result;
                    }
                }
                finally{
                    delete global.$$data;
                    delete global.$$init;
                }
            }
            catch(err){
                return false;
            };
        `;
        return;
    };
    async init(session: ISession, params?: any): Promise<void>{
        let globalValues: any = {
            '$$init': true
        };
        if (params != null)
           globalValues['$$data'] = JSON.stringify(params);
        await this.vm.execute(globalValues);
    };
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>{
        try{
            let result = await this.vm.execute({
                '$$request': request,
                '$$response': response
            });
            if (result === false){
                response.statusCode(500);
                return false;
            };
            return true;
        }
        catch(err){
            console.dir('RouterPluginVM exception')
            console.dir(err)
            response.statusCode(500)
            return false;
        };
    };
};
class WorkerPluginVM extends PluginVM implements IWorkerPlugin{
    async setup(): Promise<boolean>{
        await super.setup();
        this.vm.injectGlobalScript(`            
            let module = global._$$modules['index'] || global._$$currModule
            let fn = module.default['worker'] || module.default;
            global.$$worker = new fn();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$init){
                        if (global.$$worker.init){
                            let data = global.$$data;
                            if (data)
                                data = JSON.parse(data);
                            try{
                                global.$$worker.init(global.$$session, data);
                            }
                            catch(err){}
                        }
                    }
                    else{
                        let data = global.$$data;
                        if (data)
                            data = JSON.parse(data);
                        let result = await global.$$worker.process(global.$$session, data);
                        return result;
                    }
                }
                finally{
                    delete global.$$init;
                    delete global.$$data;
                }
            }
            catch(err){
                return false;
            };
        `;
        return true;
    };
    async init(session: ISession, params?: any): Promise<void>{
        let globalValues: any = {
            '$$init': true
        };
        if (params != null)
            globalValues['$$data'] = JSON.stringify(params);
        await this.vm.execute(globalValues);
    };
    async message(session: ISession, channel: string, msg: string){
        let result = await this.vm.execute({
            '$$data': JSON.stringify({channel, msg})
        });
        return result;
    };
    async process(session: ISession, data?: any): Promise<any>{
        try{
            let globalValues: any;
            if (data != null){
                globalValues = {
                    '$$data': JSON.stringify(data)
                };
            };
            let result = await this.vm.execute(globalValues);
            return result;
        }
        catch(err){
            console.dir('WorkerPluginVM exception')
            console.dir(err);
        };
    };
};
function Session(options: IPluginOptions): ISession{
    return {
        params: options.params,
        plugins: {}
    };
};
class Plugin{
    protected options: IPluginOptions;
    protected plugin: any;
    protected _session: ISession;
    protected pluginType: string;
    public vm: VM;
    public data: any;

    constructor(options: IPluginOptions){
        this.options = options;   
    }
    get id(): string{
        return this.options.id;
    }
    get domain() {
        return this.options.domain;
    }
    async addPackage(packName: string, script?: string){
        await this.createPlugin();
        if (!script){
            script = await getPackageScript(packName); 
        }
        loadModule(script, packName);
    }
    async createPlugin(){   
        if (!this.plugin){
            if (!this.options.script && this.options.scriptPath){
                // if (this.options.github){
                //     this.options.script = await Github.getFile({
                //         org: this.options.github.org,
                //         repo: this.options.github.repo,
                //         token: this.options.github.token,
                //         filePath: 'lib/index.js'
                //     })                
                // }
                // else 
                if (this.options.scriptPath.endsWith('.js'))
                    this.options.script = await getScript(this.options.scriptPath, this.options.modulePath);
                else{
                    let result = await PluginScript(this.options);
                    this.options.dependencies = this.options.dependencies || {};
                    for (let n in result.dependencies){
                        if (result.dependencies[n].script)
                            this.options.dependencies[n] = result.dependencies[n];
                    }
                    this.options.script = result.script;
                }
            }
            if (this.options.isolated === false)
                this.plugin = await this.createModule();            
            else{
                this.plugin = await this.createVM();            
                this.vm = this.plugin.vm;
            };    
            for (let v in this.options.plugins){  
                if (v == 'db'){
                    let m = require('@ijstech/pdm');
                    await m.loadPlugin(this, this.options.plugins.db);                    
                    break;
                };
            };
            for (let v in this.options.dependencies) {                
                if (['@ijstech/crypto'].indexOf(v) > -1){
                    let m = require(v);
                    await m.loadPlugin(this);
                }
            };
        };
    };
    createVM(): any{
        return;
    };    
    async loadDependenceModule(name: string){
        if (!Modules[name]){
            let script = await getPackageScript(name);
            if (script)
                loadModule(script, name);
        };
    };
    async createModule(): Promise<any>{
        if (this.options.plugins?.db){
            await this.loadDependenceModule('@ijstech/pdm');
        };
        if (this.options.plugins?.wallet){
            await this.loadDependenceModule('bignumber.js');
            await this.loadDependenceModule('@ijstech/wallet');
            await this.loadDependenceModule('@ijstech/eth-contract');
        };
        if (this.options.plugins?.fetch){
            await this.loadDependenceModule('@ijstech/fetch');
        };
        if (this.options.dependencies){
            for (let packname in this.options.dependencies){
                let pack = this.options.dependencies[packname];
                let script = await getPackageScript(packname, pack);
                if (script)
                    loadModule(script, packname);
            };
        };
        let script = this.options.script;        
        if (script){
            let module = loadModule(script);
            if (module){
                if (module.default)
                    module = module.default[this.pluginType] || module.default;
                return new module(this.options);
            };   
        };
    };
    async init(params?: any){
        try{
            await this.createPlugin();
            await this.plugin.init(await this.getSession(), params);
        }
        catch(err){
            console.dir(err)
        }
    };
    async getSession(taskId?: string): Promise<ISession>{
        if (this._session)
            return this._session;
        let result = Session(this.options);        
        if (taskId)
            result.taskId = taskId;
        let script = '';      
        this._session = result;
        if (this.options.plugins){
            for (let v in this.options.plugins){      
                try{
                    let m = require('@ijstech/' + v);
                    let plugin = await m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                    if (typeof(plugin) == 'string')
                        script += plugin
                    else if (plugin)
                        result.plugins[v] = plugin;
                    if (v == 'db'){
                        let m = require('@ijstech/pdm');
                        let plugin = await m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                        if (typeof(plugin) == 'string')
                            script += plugin;
                    };
                }
                catch(err){
                    console.dir(err);
                };
            };
        };
        if (this.plugin.vm)
            this.plugin.vm.injectGlobalValue('$$session', result, script);
        return result;
    };
};
export class Router extends Plugin{    
    protected plugin: IRouterPlugin;
    protected options: IRouterPluginOptions;    
    constructor(options: IRouterPluginOptions){
        super(options);
        this.pluginType = 'worker';
    };
    async createVM(): Promise<RouterPluginVM>{        
        super.createVM();
        let result = new RouterPluginVM(this.options);
        await result.setup();
        return result;
    };
    async route(ctx: Koa.Context, request?: IRouterRequest, response?: IRouterResponse): Promise<boolean>{
        if (ctx){
            ctx.origUrl = ctx.url;
            ctx.url = ctx.url.slice(this.options.baseUrl.length);        
            if (!ctx.url.startsWith('/'))
                ctx.url = '/' + ctx.url;
        }
        let result: boolean;
        await this.createPlugin();
        if (this.plugin){
            request = request || RouterRequest(ctx)
            response = response || RouterResponse(ctx)
            if (request && response)
                result = await this.plugin.route(await this.getSession(), request, response);
            return result;
        }
    };
};
export class Worker extends Plugin{
    protected plugin: IWorkerPlugin;
    protected options: IWorkerPluginOptions;    
    constructor(options: IWorkerPluginOptions){
        super(options);
        this.pluginType = 'worker';
    };
    async createVM(): Promise<WorkerPluginVM>{
        super.createVM();
        let result = new WorkerPluginVM(this.options);
        await result.setup();
        return result;
    };
    async message(channel: string, msg: string){
        try{
            await this.createPlugin();
            await this.plugin.process(await this.getSession(), {channel, msg});
        }
        catch(err){
            console.dir(err)
        }
    }
    async process(data?: any, taskId?: string): Promise<any>{
        let result: any;
        this.options.processing = true;
        try{    
            await this.createPlugin();
            let session = await this.getSession(taskId);
            result = await this.plugin.process(session, data);
        }
        catch(err){
            console.dir(err)
        }
        finally{
            this.options.processing = false;
        };
        return result;
    };
};