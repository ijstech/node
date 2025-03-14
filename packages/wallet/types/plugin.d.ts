/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import BigNumber from 'bignumber.js';
export declare type stringArray = string | _stringArray;
export interface _stringArray extends Array<stringArray> {
}
export interface IWalletNetwork {
    chainName?: string;
    provider?: any;
}
export interface IWalletNetworks {
    [chainId: number]: IWalletNetwork;
}
export interface IWalletTokenInfo {
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: number;
}
export interface IWalletAccount {
    address: string;
    privateKey?: string;
}
export interface IWalletRequiredPluginOptions {
    chainId: number;
    networks: IWalletNetworks;
    accounts: IWalletAccount[];
}
export interface IWalletEventLog {
    event: string;
    address: string;
    returnValues: any;
    logIndex: bigint;
    transactionIndex: bigint;
    transactionHash: string;
    blockHash: string;
    blockNumber: bigint;
    raw?: {
        data: string;
        topics: string[];
    };
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
export interface IWalletTransactionReceipt {
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
export interface IWalletEvent {
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
export interface IWalletTransactionOptions {
    from?: string;
    to?: string;
    nonce?: number;
    gas?: number;
    gasLimit?: number;
    gasPrice?: BigNumber | number;
    data?: string;
    value?: BigNumber | number;
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
export interface IWalletEvent {
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
export interface IWalletTokenInfo {
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: number;
}
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
export interface IAbiDefinition {
    _abi: any;
}
export interface IMulticallContractCall {
    to: string;
    contract: IAbiDefinition;
    methodName: string;
    params: any[];
}
export interface IWallet {
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
    decodeEventData(data: IWalletLog, events?: any): Promise<IWalletEvent>;
    decodeErrorMessage(msg: string): any;
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
    scanEvents(fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string | string[]): Promise<IWalletEvent[]>;
    scanEvents(params: {
        fromBlock: number;
        toBlock?: number | string;
        topics?: any;
        events?: any;
        address?: string | string[];
    }): Promise<IWalletEvent[]>;
    signMessage(msg: string): Promise<string>;
    signTransaction(tx: any, privateKey?: string): Promise<string>;
    tokenInfo(address: string): Promise<IWalletTokenInfo>;
    utils: IWalletUtils;
    verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;
    soliditySha3(...val: any[]): string;
    toChecksumAddress(address: string): string;
    isAddress(address: string): boolean;
    _txObj(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | IWalletTransactionOptions): Promise<IWalletTransactionOptions>;
    _txData(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | IWalletTransactionOptions): Promise<string>;
    multiCall(calls: {
        to: string;
        data: string;
    }[], gasBuffer?: string): Promise<{
        results: string[];
        lastSuccessIndex: BigNumber;
    }>;
    doMulticall(contracts: IMulticallContractCall[], gasBuffer?: string): Promise<any[]>;
    encodeFunctionCall<T extends IAbiDefinition, F extends Extract<keyof T, {
        [K in keyof T]: T[K] extends Function ? K : never;
    }[keyof T]>>(contract: T, methodName: F, params: string[]): string;
    decodeAbiEncodedParameters<T extends IAbiDefinition, F extends Extract<keyof T, {
        [K in keyof T]: T[K] extends Function ? K : never;
    }[keyof T]>>(contract: T, methodName: F, hexString: string): any;
}
export interface IWalletPluginObject {
    balanceOf(address: string): Promise<string>;
    _call(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<any>;
    createAccount(): string;
    decode(abi: any, event: IWalletLog | IWalletEventLog, raw?: {
        data: string;
        topics: string[];
    }): string;
    decodeEventData(data: IWalletLog, events?: any): Promise<string>;
    decodeErrorMessage(msg: string): any;
    decodeLog(inputs: any, hexString: string, topics: any): string;
    getAbiEvents(abi: any[]): string;
    getAbiTopics(abi: any[], eventNames: string[]): string;
    getAccounts(): Promise<string>;
    getAddress(): string;
    getBalance(): Promise<string>;
    getBlock(blockHashOrBlockNumber?: number | string, returnTransactionObjects?: boolean): Promise<string>;
    getDefaultAccount(): string;
    methods(...args: any[]): Promise<string>;
    getBlockNumber(): Promise<number>;
    getBlockTimestamp(blockHashOrBlockNumber?: number | string): Promise<number>;
    getChainId(): number;
    getTransaction(transactionHash: string): Promise<string>;
    setPrivateKey(value: string): void;
    recoverSigner(msg: string, signature: string): Promise<string>;
    registerAbi(abi: any[] | string, address?: string | string[]): string;
    registerAbiContracts(abiHash: string, address: string | string[]): void;
    setChainId(value: number): void;
    setDefaultAccount(value: string): void;
    send(to: string, amount: number): Promise<string>;
    _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<string>;
    scanEvents(fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string | string[]): Promise<string>;
    scanEvents(params: {
        fromBlock: number;
        toBlock?: number | string;
        topics?: any;
        events?: any;
        address?: string | string[];
    }): Promise<string>;
    setAccount(value: IWalletAccount): void;
    signMessage(msg: string): Promise<string>;
    signTransaction(tx: any, privateKey?: string): Promise<string>;
    tokenInfo(address: string): Promise<string>;
    utils_fromWei(value: any, unit?: any): string;
    utils_hexToUtf8(value: string): string;
    utils_sha3(value: string): string;
    utils_stringToBytes(value: string | stringArray, nByte?: number): string;
    utils_stringToBytes32(value: string | stringArray): string;
    utils_toString(value: any): string;
    utils_toUtf8(value: any): string;
    utils_toWei(value: string, unit?: any): string;
    verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;
    soliditySha3(...val: any[]): string;
    toChecksumAddress(address: string): string;
    isAddress(address: string): boolean;
    multiCall(calls: {
        to: string;
        data: string;
    }[], gasBuffer?: string): Promise<{
        results: string[];
        lastSuccessIndex: BigNumber;
    }>;
    doMulticall(contracts: IMulticallContractCall[], gasBuffer?: string): Promise<any[]>;
    encodeFunctionCall<T extends IAbiDefinition, F extends Extract<keyof T, {
        [K in keyof T]: T[K] extends Function ? K : never;
    }[keyof T]>>(contract: T, methodName: F, params: string[]): string;
    decodeAbiEncodedParameters<T extends IAbiDefinition, F extends Extract<keyof T, {
        [K in keyof T]: T[K] extends Function ? K : never;
    }[keyof T]>>(contract: T, methodName: F, hexString: string): any;
}
declare const Wallet: IWallet;
export default Wallet;
