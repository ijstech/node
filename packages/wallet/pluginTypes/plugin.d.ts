/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
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
export interface IWalletTransactionReceipt {
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
export interface IWalletEvent {
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
export interface IWalletTransaction {
    hash: string;
    nonce: number;
    blockHash: string | null;
    blockNumber: number | null;
    transactionIndex: number | null;
    from: string;
    to: string | null;
    value: string;
    gasPrice: string;
    maxPriorityFeePerGas?: number | string | BigNumber;
    maxFeePerGas?: number | string | BigNumber;
    gas: number;
    input: string;
}
export interface IWalletBlockTransactionObject {
    number: number;
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
    gasLimit: number;
    gasUsed: number;
    timestamp: number | string;
    baseFeePerGas?: number;
    size: number;
    difficulty: number;
    totalDifficulty: number;
    uncles: string[];
    transactions: IWalletTransaction[];
}
export interface IWalletEvent {
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
    fromWei(value: any, unit?: string): string;
    hexToUtf8(value: string): string;
    sha3(value: string): string;
    stringToBytes(value: string | stringArray, nByte?: number): string | string[];
    stringToBytes32(value: string | stringArray): string | string[];
    toString(value: any): string;
    toUtf8(value: any): string;
    toWei(value: string, unit?: string): string;
}
export interface IWalletPlugin {
    account: IWalletAccount;
    accounts: Promise<string[]>;
    address: string;
    balance: Promise<BigNumber>;
    balanceOf(address: string): Promise<BigNumber>;
    chainId: number;
    createAccount(): IWalletAccount;
    decode(abi: any, event: IWalletLog | IWalletEventLog, raw?: {
        data: string;
        topics: string[];
    }): IWalletEvent;
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
    methods(...args: any): Promise<any>;
    set privateKey(value: string);
    recoverSigner(msg: string, signature: string): Promise<string>;
    registerAbi(abi: any[] | string, address?: string | string[], handler?: any): string;
    registerAbiContracts(abiHash: string, address: string | string[], handler?: any): any;
    send(to: string, amount: number): Promise<IWalletTransactionReceipt>;
    scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string | string[]): Promise<IWalletEvent[]>;
    signMessage(msg: string): Promise<string>;
    signTransaction(tx: any, privateKey?: string): Promise<string>;
    tokenInfo(address: string): Promise<IWalletTokenInfo>;
    utils: IWalletUtils;
    verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;
    soliditySha3(...val: any[]): string;
}
declare const Wallet: IWalletPlugin;
export default Wallet;
