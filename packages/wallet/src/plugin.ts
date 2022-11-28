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
    hash?: string;
    nonce: number;
    blockHash?: string | null;
    blockNumber?: number | null;
    transactionIndex?: number | null;
    from?: string;
    to: string | null;
    value?: string | number;
    gasPrice: string | number;
    maxPriorityFeePerGas?: number | string | BigNumber;
    maxFeePerGas?: number | string | BigNumber;
    gas: number;
    input?: string;
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
export interface IWallet {
    account: IWalletAccount;
    accounts: Promise<string[]>;
    address: string;
    balance: Promise<BigNumber>;
    balanceOf(address: string): Promise<BigNumber>;    
    _call(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<any>;    
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
export interface IWalletPluginObject{
    balanceOf(address: string): Promise<string>;
    _call(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<any>;    
    createAccount(): string;
    decode(abi:any, event:IWalletLog|IWalletEventLog, raw?:{data: string,topics: string[]}): string;
    decodeEventData(data: IWalletLog, events?: any): Promise<string>;
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
    getChainId():number;
    getTransaction(transactionHash: string): Promise<string>;
    setPrivateKey(value: string): void;
    recoverSigner(msg: string, signature: string): Promise<string>;
    registerAbi(abi: any[] | string, address?: string|string[]): string;
    registerAbiContracts(abiHash: string, address: string|string[]): void;
    setChainId(value: number): void;
    setDefaultAccount(value: string): void;
    send(to: string, amount: number): Promise<string>;
    _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<string>;
    scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<string>;
    setAccount(value: IWalletAccount):void;    
    signMessage(msg: string): Promise<string>;
    signTransaction(tx: any, privateKey?: string): Promise<string>;    
    tokenInfo(address: string): Promise<string>;
    utils_fromWei(value: any, unit?: any): string;
    utils_hexToUtf8(value: string): string;
    utils_sha3(value: string): string;
    utils_stringToBytes(value: string|stringArray, nByte?: number): string;
    utils_stringToBytes32(value: string|stringArray): string;
    utils_toString(value: any): string;
    utils_toUtf8(value: any): string;
    utils_toWei(value: string, unit?: any): string;
    verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;
    soliditySha3(...val: any[]): string;
    toChecksumAddress(address: string): string;	
}
const Wallet: IWallet = {
    get account(): IWalletAccount{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return {
            address: wallet.getAddress()
        }
    },    
    set account(value: IWalletAccount){
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        wallet.setAccount(value);
    },
    get accounts(): Promise<string[]>{
        return new Promise(async (resolve)=>{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            let result = await wallet.getAccounts()                   
            resolve(JSON.parse(result));
        });
    },
    get address(): string{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return wallet.getAddress();
    },
    get balance(): Promise<BigNumber>{
        return new Promise(async (resolve)=>{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            let result = await wallet.getBalance();                    
            resolve(new BigNumber(result));
        })
    },
    balanceOf(address: string):Promise<BigNumber>{
        return new Promise(async (resolve)=>{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            let result = await wallet.balanceOf(address)
            resolve(new BigNumber(result));
        })
    },    
    _call(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<any>{
        return new Promise(async (resolve)=>{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            let result = await wallet._call(abiHash, address, methodName, params, options)
            resolve(JSON.parse(result));
        })
    },
    get chainId(): number{    
        let wallet: IWalletPluginObject = global.$$wallet_plugin;            
        return wallet.getChainId();
    },
    set chainId(value: number){
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        wallet.setChainId(value);
    },
    createAccount(): IWalletAccount{        
        let wallet: IWalletPluginObject = global.$$wallet_plugin;        
        let result = wallet.createAccount()
        return JSON.parse(result);
    },
    decode(abi:any, event:IWalletLog|IWalletEventLog, raw?:{data: string,topics: string[]}): IWalletEvent{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(wallet.decode(abi, event, raw))
    },
    async decodeEventData(data: IWalletLog, events?: any): Promise<IWalletEvent>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(await wallet.decodeEventData(data, events))
    },
    decodeLog(inputs: any, hexString: string, topics: any): any{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(wallet.decodeLog(inputs, hexString, topics));
    },
    get defaultAccount(): string{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return wallet.getDefaultAccount();
    },
    set defaultAccount(value: string){
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        wallet.setDefaultAccount(value);
    },
    getAbiEvents(abi: any[]): any{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(wallet.getAbiEvents(abi));
    },
    getAbiTopics(abi: any[], eventNames: string[]): any[]{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(wallet.getAbiTopics(abi, eventNames));
    },
    async getBlock(...args): Promise<IWalletBlockTransactionObject>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(await wallet.getBlock.apply(this, args));
    },
    async getBlockNumber(): Promise<number>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return await wallet.getBlockNumber();
    },
    async getBlockTimestamp(blockHashOrBlockNumber?: number | string): Promise<number>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return await wallet.getBlockTimestamp(blockHashOrBlockNumber);
    },
    async getChainId(): Promise<number>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return await wallet.getChainId();
    },
    getContractAbi(address: string): any{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return _abiAddressDict[address];
    },
    getContractAbiEvents(address: string): any{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        let events = _abiEventDict[address];
        if (events)
            return events;			
        let abi = _abiHashDict[_abiAddressDict[address]];
        if (abi){
            events = JSON.parse(wallet.getAbiEvents(abi))
            _abiEventDict[address] = events;
            return events;
        };
    },
    async getTransaction(transactionHash: string): Promise<IWalletTransaction>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        let result = await wallet.getTransaction(transactionHash);
        return JSON.parse(result);
    },
    async methods(...args){
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(await wallet.methods.apply(this, args));
    },
    set privateKey(value: string){
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        wallet.setPrivateKey(value);
    },
    async recoverSigner(msg: string, signature: string): Promise<string>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return await wallet.recoverSigner(msg, signature);
    },
    registerAbi(abi: any[] | string, address?: string|string[], handler?: any): string{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        let hash = wallet.registerAbi(abi, address);
        if (address && handler)
            _registerAbiContracts(hash, address, handler);
        return hash;
    },
    registerAbiContracts(abiHash: string, address: string|string[], handler?: any){
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        wallet.registerAbiContracts(abiHash, address);
        if (address && handler)
            _registerAbiContracts(abiHash, address, handler);
    },
    async send(to: string, amount: number): Promise<IWalletTransactionReceipt>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(await wallet.send(to, amount));
    },
    async _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<IWalletTransactionReceipt>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return JSON.parse(await wallet._send(abiHash, address, methodName, params, options));
    },
    async scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<IWalletEvent[]>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        let result:IWalletEvent[] = JSON.parse(await wallet.scanEvents(fromBlock, toBlock, topics, events, address));
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
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return await wallet.signMessage(msg);
    },
    async signTransaction(tx: any, privateKey?: string): Promise<string>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return await wallet.signTransaction(tx, privateKey);
    },
    async tokenInfo(address: string): Promise<IWalletTokenInfo>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        let result = JSON.parse(await wallet.tokenInfo(address))        
        if (result.totalSupply)
            result.totalSupply = new BigNumber(result.totalSupply);        
        return result;
    },
    utils: {
        fromWei(value: any, unit?: string): string{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return wallet.utils_fromWei(value, unit);
        },
        hexToUtf8(value: string): string{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return wallet.utils_hexToUtf8(value);
        },
        sha3(value: string): string{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return wallet.utils_sha3(value);
        },
        stringToBytes(value: string | stringArray, nByte?: number): string | string[]{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return JSON.parse(wallet.utils_stringToBytes(JSON.stringify(value), nByte));
        },
        stringToBytes32(value: string | stringArray): string | string[]{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return wallet.utils_stringToBytes32(value);
        },
        toString(value: any): string{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return wallet.utils_toString(value);
        },
        toUtf8(value: any): string{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return wallet.utils_toUtf8(value);
        },
        toWei(value: string, unit?: string): string{
            let wallet: IWalletPluginObject = global.$$wallet_plugin;
            return wallet.utils_toWei(value, unit);
        }
    },
    async verifyMessage(account: string, msg: string, signature: string): Promise<boolean>{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return await wallet.verifyMessage(account, msg, signature);
    },
    soliditySha3(...val: any[]): string{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return wallet.soliditySha3(...val);
    },
    toChecksumAddress(address: string): string{
        let wallet: IWalletPluginObject = global.$$wallet_plugin;
        return wallet.toChecksumAddress(address);   
    }
};
export default Wallet;