/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import Koa from 'koa';
import { VM } from '@ijstech/vm';
import { IPackageScript, BigNumber, IRouterRequest, IRouterResponse, IWorkerPluginOptions, IRouterPluginOptions, IPluginOptions } from '@ijstech/types';
export { ResponseType } from '@ijstech/types';
export { BigNumber, IRouterRequest, IRouterResponse, IWorkerPluginOptions, IRouterPluginOptions };
export declare namespace Types {
    interface IWalletAccount {
        address: string;
        privateKey?: string;
    }
    interface IWalletLog {
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
    interface IWalletEventLog {
        event: string;
        address: string;
        returnValues: any;
        logIndex: number;
        transactionIndex: number;
        transactionHash: string;
        blockHash: string;
        blockNumber: number;
        raw?: {
            data: string;
            topics: string[];
        };
    }
    interface IWalletEvent {
        name: string;
        address: string;
        blockNumber: number;
        logIndex: number;
        topics: string[];
        transactionHash: string;
        transactionIndex: number;
        data: any;
        rawData: any;
    }
    interface IWalletTransaction {
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
    interface IWalletBlockTransactionObject {
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
    interface IWalletTransactionReceipt {
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
    interface IWalletTokenInfo {
        name: string;
        symbol: string;
        totalSupply: BigNumber;
        decimals: number;
    }
    type stringArray = string | _stringArray;
    interface _stringArray extends Array<stringArray> {
    }
    interface IWalletUtils {
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
    interface IAbiDefinition {
        _abi: any;
    }
    interface IWalletPlugin {
        account: IWalletAccount;
        accounts: Promise<string[]>;
        address: string;
        balance: Promise<BigNumber>;
        balanceOf(address: string): Promise<BigNumber>;
        _call(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<any>;
        chainId: number;
        createAccount(): IWalletAccount;
        decode(abi: any, event: IWalletLog | IWalletEventLog, raw?: {
            data: string;
            topics: string[];
        }): IWalletEvent;
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
        registerAbi(abi: any[] | string, address?: string | string[], handler?: any): string;
        registerAbiContracts(abiHash: string, address: string | string[], handler?: any): any;
        send(to: string, amount: number): Promise<IWalletTransactionReceipt>;
        _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<IWalletTransactionReceipt>;
        scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string | string[]): Promise<IWalletEvent[]>;
        signMessage(msg: string): Promise<string>;
        signTransaction(tx: any, privateKey?: string): Promise<string>;
        tokenInfo(address: string): Promise<IWalletTokenInfo>;
        utils: IWalletUtils;
        verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;
        soliditySha3(...val: any[]): string;
        toChecksumAddress(address: string): string;
        _txObj(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | IWalletTransaction): Promise<IWalletTransaction>;
        _txData(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | IWalletTransaction): Promise<string>;
        multiCall(calls: {
            to: string;
            data: string;
        }[], gasBuffer?: string): Promise<{
            results: string[];
            lastSuccessIndex: BigNumber;
        }>;
        encodeFunctionCall<T extends IAbiDefinition, F extends Extract<keyof T, {
            [K in keyof T]: T[K] extends Function ? K : never;
        }[keyof T]>>(contract: T, methodName: F, params: string[]): string;
    }
    interface ICachePlugin {
        del(key: string): Promise<boolean>;
        get(key: string): Promise<string>;
        getValue(key: string): Promise<any>;
        set(key: string, value: any, expires?: number): Promise<boolean>;
    }
    interface IDBPlugin {
        getConnection(name?: string): IDBClient;
    }
    interface IQueueJob {
        id: string;
        progress: number;
        status: string;
    }
    interface IQueuePlugin {
        createJob(queue: string | number, data: any, waitForResult?: boolean, timeout?: number, retries?: number): Promise<IQueueJob>;
    }
    interface IMessagePlugin {
        publish(channel: string | number, msg: string): void;
        subscribe(channel: string | number, cb?: (error: Error, msg: string) => void): void;
    }
    interface IPlugins {
        cache?: ICachePlugin;
        db?: IDBPlugin;
        queue?: IQueuePlugin;
        message?: IMessagePlugin;
        wallet?: IWalletPlugin;
    }
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
        beginTransaction(): Promise<boolean>;
        checkTableExists(tableName: string): Promise<boolean>;
        commit(): Promise<boolean>;
        query(sql: string, params?: any[]): Promise<any>;
        resolve(table: string, fields: IFields, criteria: any, args: any): Promise<any>;
        rollback(): Promise<boolean>;
        syncTableSchema(tableName: string, fields: IFields): Promise<boolean>;
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
    fetch?: boolean;
}
export declare abstract class IPlugin {
    init?(session: ISession, params?: any): Promise<void>;
}
export interface ISession {
    params?: any;
    plugins: Types.IPlugins;
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
    get id(): string;
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
    process(session: ISession, data?: any): Promise<any>;
}
declare class Plugin {
    protected options: IPluginOptions;
    protected plugin: any;
    protected _session: ISession;
    protected pluginType: string;
    vm: VM;
    data: any;
    constructor(options: IPluginOptions);
    get id(): string;
    addPackage(packName: string, script?: string): Promise<void>;
    createPlugin(): Promise<void>;
    createVM(): any;
    createModule(): Promise<any>;
    init(params?: any): Promise<void>;
    getSession(): Promise<ISession>;
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
