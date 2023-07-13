/// <amd-module name="@ijstech/eth-contract" />
declare module "@ijstech/eth-contract" {
    /*!-----------------------------------------------------------
    * Copyright (c) IJS Technologies. All rights reserved.
    * Released under dual AGPLv3/commercial license
    * https://ijs.network
    *-----------------------------------------------------------*/
    import { BigNumber } from "bignumber.js";
    export { BigNumber };
    type stringArray = string | _stringArray;
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
        scanEvents(fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string | string[]): Promise<Event[]>;
        scanEvents(params: {
            fromBlock: number;
            toBlock?: number | string;
            topics?: any;
            events?: any;
            address?: string | string[];
        }): Promise<Event[]>;
        _txData(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<string>;
        _txObj(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<TransactionOptions>;
        utils: IWalletUtils;
    }
    export interface Event {
        name: string;
        address: string;
        blockNumber: BigInt;
        logIndex: BigInt;
        topics: string[];
        transactionHash: string;
        transactionIndex: BigInt;
        data: any;
        rawData: any;
    }
    export interface IWalletLog {
        address: string;
        data: string;
        topics: string[];
        logIndex: BigInt;
        transactionIndex: BigInt;
        transactionHash: string;
        blockHash: string;
        blockNumber: BigInt;
        removed: boolean;
        type?: string;
    }
    export interface IWalletEventLog {
        event: string;
        address: string;
        returnValues: any;
        logIndex: BigInt;
        transactionIndex: BigInt;
        transactionHash: string;
        blockHash: string;
        blockNumber: BigInt;
        raw?: {
            data: string;
            topics: string[];
        };
    }
    export interface TransactionReceipt {
        status: BigInt;
        transactionHash: string;
        transactionIndex: BigInt;
        blockHash: string;
        blockNumber: BigInt;
        from: string;
        to: string;
        contractAddress?: string;
        cumulativeGasUsed: BigInt;
        gasUsed: BigInt;
        effectiveGasPrice: BigInt;
        logs: IWalletLog[];
        logsBloom: string;
        events?: {
            [eventName: string]: IWalletEventLog;
        };
    }
    export interface Transaction {
        hash?: string;
        nonce?: BigInt;
        blockHash?: string | null;
        blockNumber?: BigInt | null;
        data?: string;
        transactionIndex?: BigInt | null;
        from?: string;
        to?: string | null;
        value?: BigNumber;
        gasPrice?: BigNumber;
        maxPriorityFeePerGas?: BigInt | string | BigNumber;
        maxFeePerGas?: BigInt | string | BigNumber;
        gas?: BigInt;
        input?: string;
    }
    export interface TransactionOptions {
        from?: string;
        to?: string;
        nonce?: number;
        gas?: number;
        gasLimit?: number;
        gasPrice?: BigNumber | number;
        data?: string;
        value?: BigNumber | number;
    }
    export interface DeployOptions extends TransactionOptions {
        linkReferences?: {
            [file: string]: {
                [contract: string]: {
                    length: number;
                    start: number;
                }[];
            };
        };
        libraries?: {
            [file: string]: {
                [contract: string]: string;
            };
        };
    }
    export interface EventType {
        name: string;
    }
    export const nullAddress = "0x0000000000000000000000000000000000000000";
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
    export class Contract {
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
        scanEvents(fromBlock: number | {
            fromBlock: number;
            toBlock?: number | string;
            eventNames?: string[];
        }, toBlock?: number | string, eventNames?: string[]): Promise<Event[]>;
        batchCall(batchObj: IBatchRequestObj, key: string, methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<void>;
        protected txData(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<string>;
        protected call(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<any>;
        private _send;
        protected __deploy(params?: any[], options?: number | BigNumber | DeployOptions): Promise<string>;
        protected send(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
        protected _deploy(...params: any[]): Promise<string>;
        protected methods(methodName: string, ...params: any[]): Promise<any>;
    }
    export class TAuthContract extends Contract {
        rely(address: string): Promise<any>;
        deny(address: string): Promise<any>;
    }
}
