/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import BigNumber from 'bignumber.js';
export type stringArray = string | _stringArray;
export interface _stringArray extends Array<stringArray> { }
export interface IWalletNetwork{
    chainName?: string;
    provider?: any;
}
export interface IWalletNetworks {
    [chainId: number]: IWalletNetwork;
}
export interface IWalletTokenInfo{
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: number;	
}
export interface IWalletAccount {
    address: string;
    privateKey?: string;
}
export interface IWalletRequiredPluginOptions{
    chainId: number;
    networks: IWalletNetworks;
    accounts: IWalletAccount[];
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
export interface IWalletLog {
    address: string;
    data: string;
    topics: Array <string>;
    logIndex: number;
    transactionHash?: string;
    transactionIndex: number;
    blockHash?: string;
    type?: string;
    blockNumber: number;
}
export interface IWalletTransactionReceipt{
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    contractAddress?: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    logs ? : Array <IWalletLog>;
    events ? : {
        [eventName: string]: IWalletEventLog | IWalletEventLog[]
    };
    status: boolean;
}
export interface IWalletEvent{
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
export interface IWalletBlockTransactionObject{
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
export interface IWalletTokenInfo{
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: number;	
}
export interface IContractMethod {
    call: any;
    estimateGas(...params:any[]): Promise<number>;
    encodeABI(): string;
}
export interface IContract {
    deploy(params: {data: string, arguments?: any[]}): IContractMethod;
    methods: {[methodName: string]: (...params:any[]) => IContractMethod};
}
export interface IWalletUtils{
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
    decode(abi:any, event:IWalletLog|IWalletEventLog, raw?:{data: string,topics: string[]}): IWalletEvent;    
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
    registerAbi(abi: any[] | string, address?: string|string[], handler?: any): string;
    registerAbiContracts(abiHash: string, address: string|string[], handler?: any): any;
    send(to: string, amount: number): Promise<IWalletTransactionReceipt>;		
    scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<IWalletEvent[]>;		
    signMessage(msg: string): Promise<string>;
    signTransaction(tx: any, privateKey?: string): Promise<string>;
    tokenInfo(address: string): Promise<IWalletTokenInfo>;
    utils: IWalletUtils;
    verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;	
    soliditySha3(...val: any[]): string;	
}
interface IDictionary {
    [index: string]: any;
};
let _abiAddressDict: IDictionary = {};
let _abiEventDict: IDictionary = {};
let _abiHashDict: IDictionary = {};
let _eventHandler: IDictionary;

function _registerAbiContracts(abiHash: string, address: string|string[], handler?: any){			
    if (address){
        _eventHandler = _eventHandler || {};
        if (!Array.isArray(address))
            address = [address];
        for (let i = 0; i < address.length; i ++){
            _abiAddressDict[address[i]] = abiHash;
            if (handler)
                _eventHandler[address[i]] = handler;
        }
    }
};
const Wallet: IWalletPlugin = {
    get account(): IWalletAccount{
        return {
            address: global.$$wallet_plugin.getAddress()
        }
    },    
    set account(value: IWalletAccount){
        global.$$wallet_plugin.setAccount(value);
    },
    get accounts(): Promise<string[]>{
        return new Promise(async (resolve)=>{
            let result = await global.$$wallet_plugin.getAccounts()                   
            resolve(JSON.parse(result));
        });
    },
    get address(): string{
        return global.$$wallet_plugin.getAddress();
    },
    get balance(): Promise<BigNumber>{
        return new Promise(async (resolve)=>{
            let result = await global.$$wallet_plugin.getBalance();                    
            resolve(new BigNumber(result));
        })
    },
    balanceOf(address: string):Promise<BigNumber>{
        return new Promise(async (resolve)=>{
            let result = await global.$$wallet_plugin.balanceOf(address)
            resolve(new BigNumber(result));
        })
    },    
    get chainId(): number{                
        return global.$$wallet_plugin.getChainId();
    },
    set chainId(value: number){
        global.$$wallet_plugin.setChainId(value);
    },
    createAccount(): IWalletAccount{                
        let result = global.$$wallet_plugin.createAccount()
        return JSON.parse(result);
    },
    decode(abi:any, event:IWalletLog|IWalletEventLog, raw?:{data: string,topics: string[]}): IWalletEvent{
        return JSON.parse(global.$$wallet_plugin.decode(abi, event, raw))
    },
    async decodeEventData(data: IWalletLog, events?: any): Promise<IWalletEvent>{
        return JSON.parse(await global.$$wallet_plugin.decodeEventData(data, events))
    },
    decodeLog(inputs: any, hexString: string, topics: any): any{
        return JSON.parse(global.$$wallet_plugin.decodeLog(inputs, hexString, topics));
    },
    get defaultAccount(): string{
        return global.$$wallet_plugin.getDefaultAccount();
    },
    set defaultAccount(value: string){
        global.$$wallet_plugin.setDefaultAccount(value);
    },
    getAbiEvents(abi: any[]): any{
        return JSON.parse(global.$$wallet_plugin.getAbiEvents(abi));
    },
    getAbiTopics(abi: any[], eventNames: string[]): any[]{
        return JSON.parse(global.$$wallet_plugin.getAbiTopics(abi, eventNames));
    },
    async getBlock(...args): Promise<IWalletBlockTransactionObject>{
        return JSON.parse(await global.$$wallet_plugin.getBlock.apply(this, args));
    },
    async getBlockNumber(): Promise<number>{
        return await global.$$wallet_plugin.getBlockNumber();
    },
    async getBlockTimestamp(blockHashOrBlockNumber?: number | string): Promise<number>{
        return await global.$$wallet_plugin.getBlockTimestamp(blockHashOrBlockNumber);
    },
    async getChainId(): Promise<number>{
        return await global.$$wallet_plugin.getChainId();
    },
    getContractAbi(address: string): any{
        return _abiAddressDict[address];
    },
    getContractAbiEvents(address: string): any{
        let events = _abiEventDict[address];
        if (events)
            return events;			
        let abi = _abiHashDict[_abiAddressDict[address]];
        if (abi){
            events = JSON.parse(global.$$wallet_plugin.getAbiEvents(abi))
            _abiEventDict[address] = events;
            return events;
        };
    },
    async methods(...args){
        return JSON.parse(await global.$$wallet_plugin.methods.apply(this, args));
    },
    set privateKey(value: string){
        global.$$wallet_plugin.privateKey = value;
    },
    async recoverSigner(msg: string, signature: string): Promise<string>{
        return await global.$$wallet_plugin.recoverSigner(msg, signature);
    },
    registerAbi(abi: any[] | string, address?: string|string[], handler?: any): string{
        let hash = global.$$wallet_plugin.registerAbi(abi, address);
        if (address && handler)
            _registerAbiContracts(hash, address, handler);
        return hash;
    },
    registerAbiContracts(abiHash: string, address: string|string[], handler?: any){
        global.$$wallet_plugin.registerAbiContracts(abiHash, address);
        if (address && handler)
            _registerAbiContracts(abiHash, address, handler);
    },
    async send(to: string, amount: number): Promise<IWalletTransactionReceipt>{
        return JSON.parse(await global.$$wallet_plugin.send(to, amount));
    },
    async scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<IWalletEvent[]>{
        let result:IWalletEvent[] = JSON.parse(await global.$$wallet_plugin.scanEvents(fromBlock, toBlock, topics, events, address));
        if (_eventHandler){
            for (let i = 0; i < result.length; i ++){
                let event = result[i];
                let handler = _eventHandler[event.address];
                if (handler)
                    await handler(event);
            }
        }
        return result;
    },
    async signMessage(msg: string): Promise<string>{
        return await global.$$wallet_plugin.signMessage(msg);
    },
    async signTransaction(tx: any, privateKey?: string): Promise<string>{
        return await global.$$wallet_plugin.signTransaction(tx, privateKey);
    },
    async tokenInfo(address: string): Promise<IWalletTokenInfo>{
        let result = JSON.parse(await global.$$wallet_plugin.tokenInfo(address))        
        if (result.totalSupply)
            result.totalSupply = new BigNumber(result.totalSupply);        
        return result;
    },
    utils: {
        fromWei(value: any, unit?: string): string{
            return global.$$wallet_plugin.utils_fromWei(value, unit);
        },
        hexToUtf8(value: string): string{
            return global.$$wallet_plugin.utils_hexToUtf8(value);
        },
        sha3(value: string): string{
            return global.$$wallet_plugin.sha3(value);
        },
        stringToBytes(value: string | stringArray, nByte?: number): string | string[]{
            return global.$$wallet_plugin.stringToBytes(value, nByte);
        },
        stringToBytes32(value: string | stringArray): string | string[]{
            return global.$$wallet_plugin.stringToBytes32(value);
        },
        toString(value: any): string{
            return global.$$wallet_plugin.toString(value);
        },
        toUtf8(value: any): string{
            return global.$$wallet_plugin.utils_toUtf8(value);
        },
        toWei(value: string, unit?: string): string{
            return global.$$wallet_plugin.utils_toWei(value, unit);
        }
    },
    async verifyMessage(account: string, msg: string, signature: string): Promise<boolean>{
        return await global.$$wallet_plugin.verifyMessage(account, msg, signature);
    },
    soliditySha3(...val: any[]): string{
        return global.$$wallet_plugin.soliditySha3(...val);
    }
};
export default Wallet;