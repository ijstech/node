/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
/// <amd-module name="@ijstech/eth-contract" />
import { BigNumber } from "bignumber.js";
export { BigNumber };
declare type stringArray = string | _stringArray;
interface _stringArray extends Array<stringArray> {
}
export interface IWalletUtils {
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
export interface IBatchRequestResult {
    key: string;
    result: any;
}
export interface IBatchRequestObj {
    batch: any;
    promises: Promise<IBatchRequestResult>[];
    execute: (batch: IBatchRequestObj, promises: Promise<IBatchRequestResult>[]) => Promise<IBatchRequestResult[]>;
}
export interface IWallet {
    address: string;
    balance: Promise<BigNumber>;
    _call(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<any>;
    decode(abi: any, event: IWalletLog | IWalletEventLog, raw?: {
        data: string;
        topics: string[];
    }): Event;
    decodeLog(inputs: any, hexString: string, topics: any): any;
    getAbiEvents(abi: any[]): any;
    getAbiTopics(abi: any[], eventNames: string[]): any[];
    getChainId(): Promise<number>;
    methods(...args: any): Promise<any>;
    registerAbi(abi: any[] | string, address?: string | string[], handler?: any): string;
    send(to: string, amount: number): Promise<TransactionReceipt>;
    _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<TransactionReceipt>;
    scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string | string[]): Promise<Event[]>;
    _txData(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<string>;
    _txObj(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<Transaction>;
    utils: IWalletUtils;
}
export interface Event {
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
export interface IWalletLog {
    address: string;
    data: string;
    topics: Array<string>;
    logIndex: number;
    transactionHash?: string;
    transactionIndex: number;
    blockHash?: string;
    type?: string;
    blockNumber: number;
}
export interface IWalletEventLog {
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
export interface TransactionReceipt {
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    contractAddress?: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    logs?: Array<IWalletLog>;
    events?: {
        [eventName: string]: IWalletEventLog | IWalletEventLog[];
    };
    status: boolean;
}
export interface Transaction {
    hash?: string;
    nonce?: number;
    blockHash?: string | null;
    blockNumber?: number | null;
    data?: string;
    transactionIndex?: number | null;
    from?: string;
    to?: string | null;
    value?: BigNumber;
    gasPrice?: BigNumber;
    maxPriorityFeePerGas?: number | string | BigNumber;
    maxFeePerGas?: number | string | BigNumber;
    gas?: number;
    input?: string;
}
export interface TransactionOptions {
    from?: string;
    nonce?: number;
    gas?: number;
    gasLimit?: number;
    gasPrice?: BigNumber | number;
    data?: string;
    value?: BigNumber | number;
}
export interface EventType {
    name: string;
}
export declare const nullAddress = "0x0000000000000000000000000000000000000000";
export interface IContractMethod {
    call: any;
    estimateGas(...params: any[]): Promise<number>;
    encodeABI(): string;
}
export interface IContract {
    deploy(params: {
        data: string;
        arguments?: any[];
    }): IContractMethod;
    methods: {
        [methodName: string]: (...params: any[]) => IContractMethod;
    };
}
export interface EventType {
    name: string;
}
export declare class Contract {
    wallet: IWallet;
    _abi: any;
    _bytecode: any;
    _address: string;
    private _events;
    privateKey: string;
    private abiHash;
    constructor(wallet: IWallet, address?: string, abi?: any, bytecode?: any);
    at(address: string): Contract;
    set address(value: string);
    get address(): string;
    protected decodeEvents(receipt: TransactionReceipt): any[];
    protected parseEvents(receipt: TransactionReceipt, eventName: string): Event[];
    get events(): EventType[];
    protected getAbiEvents(): any;
    protected getAbiTopics(eventNames?: string[]): any[];
    scanEvents(fromBlock: number, toBlock: number | string, eventNames?: string[]): Promise<Event[]>;
    batchCall(batchObj: IBatchRequestObj, key: string, methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<void>;
    protected txData(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<string>;
    protected call(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<any>;
    private _send;
    protected __deploy(params?: any[], options?: number | BigNumber | TransactionOptions): Promise<string>;
    protected send(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
    protected _deploy(...params: any[]): Promise<string>;
    protected methods(methodName: string, ...params: any[]): Promise<any>;
}
export declare class TAuthContract extends Contract {
    rely(address: string): Promise<any>;
    deny(address: string): Promise<any>;
}
