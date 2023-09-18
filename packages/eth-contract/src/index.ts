/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
///<amd-module name="@ijstech/eth-contract"/>

import {BigNumber} from "bignumber.js";
export {BigNumber};
type stringArray = string | _stringArray;
interface _stringArray extends Array<stringArray> { };
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
};
export interface IBatchRequestResult {
    key: string;
    result: any;
};
export interface IBatchRequestObj {
    batch: any;
    promises: Promise<IBatchRequestResult>[];
    execute: (batch: IBatchRequestObj, promises: Promise<IBatchRequestResult>[]) => Promise<IBatchRequestResult[]>;
};
export interface IWallet {		
    address: string;
    balance: Promise<BigNumber>;    
    _call(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<any>;    
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
    scanEvents(params: {fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string | string[]}): Promise<Event[]>;  
    _txData(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<string>;      
    _txObj(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<TransactionOptions>;
    utils: IWalletUtils;
};
export interface Event{
    name: string;
    address: string;
    blockNumber: bigint;
    logIndex: bigint;
    topics: string[];
    transactionHash: string;
    transactionIndex: bigint;        
    data: any;
    rawData: any;
};
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
    logIndex: bigint
    transactionIndex: bigint
    transactionHash: string
    blockHash: string
    blockNumber: bigint
    raw ? : {
        data: string,
        topics: string[]
    }
}
export interface TransactionReceipt {
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
export interface Transaction {
    hash?: string;
    nonce?: bigint;
    blockHash?: string | null;
    blockNumber?: bigint | null;
    data?: string;
    transactionIndex?: bigint | null;
    from?: string;
    to?: string | null;
    value?: BigNumber;
    gasPrice?: BigNumber;
    maxPriorityFeePerGas?: bigint | string | BigNumber;
    maxFeePerGas?: bigint | string | BigNumber;
    gas?: bigint;
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
    linkReferences?: {[file:string]:{[contract:string]:{length:number; start:number;}[]}};
    libraries?: {[file:string]:{[contract:string]:string}};
}
export interface EventType{
    name: string
};
export const nullAddress = "0x0000000000000000000000000000000000000000";

export interface IContractMethod {
    call: any;
    estimateGas(...params:any[]): Promise<number>;
    encodeABI(): string;
};
export interface IContract {
    deploy(params: {data: string, arguments?: any[]}): IContractMethod;
    methods: {[methodName: string]: (...params:any[]) => IContractMethod};
};
export interface EventType{
    name: string
}

    
export class Contract {
    public wallet: IWallet;
    public _abi: any;
    public _bytecode: any;
    public _address: string;
    private _events: any;
    public privateKey: string;
    private abiHash: string;        

    constructor(wallet: IWallet, address?: string, abi?: any, bytecode?: any) {            
        this.wallet = wallet;
        if (abi)
            this.abiHash = this.wallet.registerAbi(abi);
        if (typeof(abi) == 'string')
            this._abi = JSON.parse(abi)
        else
            this._abi = abi            
        this._bytecode = bytecode
        if (address)
            this._address = address;
    }    
    at(address: string): Contract {
        this._address = address;
        return this;
    }
    set address(value: string){
        this._address = value;
    }
    get address(): string{
        return this._address || '';
    }
    protected decodeEvents(receipt: TransactionReceipt): any[]{
        let events = this.getAbiEvents();
        let result = [];
        for (let name in receipt.events){
            let events = <IWalletEventLog[]>( Array.isArray(receipt.events[name]) ? receipt.events[name] : [receipt.events[name]] );
            events.forEach(e=>{
                let data = e.raw;
                let event = events[data.topics[0]];
                result.push(Object.assign({_name:name, _address:this.address},this.wallet.decodeLog(event.inputs, data.data, data.topics.slice(1))));
            });
        }
        return result;
    }
    protected parseEvents(receipt: TransactionReceipt, eventName: string): Event[]{
        let eventAbis = this.getAbiEvents();
        let topic0 = this.getAbiTopics([eventName])[0];

        let result = [];
        if (receipt.events) {
            for (let name in receipt.events){
                let events = <IWalletEventLog[]>( Array.isArray(receipt.events[name]) ? receipt.events[name] : [receipt.events[name]] );
                events.forEach(event=>{
                    if (topic0 == event.raw.topics[0] && this.address && event.address && this.address.toLowerCase() == event.address.toLowerCase()) {
                        result.push(this.wallet.decode(eventAbis[topic0], event, event.raw));
                    }
                });
            }
        } else if (receipt.logs) {
            for (let i = 0 ; i < receipt.logs.length ; i++) {
                let log = receipt.logs[i];
                if (topic0 == log.topics[0] && this.address && log.address && this.address.toLowerCase() == log.address.toLowerCase()) {
                    result.push(this.wallet.decode(eventAbis[topic0], log));
                }
            }

        }
        return result;
    }
    get events(): EventType[]{
        let result = [];
        for (let i = 0; i < this._abi.length; i ++)	{
            if (this._abi[i].type == 'event')
                result.push(this._abi[i])
        }
        return result;
    }
    protected getAbiEvents(){
        if (!this._events){
            this._events = {};
            let events = this._abi.filter(e => e.type=="event");
            for (let i = 0 ; i < events.length ; i++) {
                let topic = this.wallet.utils.sha3(events[i].name + "(" + events[i].inputs.map(e=>e.type=="tuple" ? "("+(e.components.map(f=>f.type)) +")" : e.type).join(",") + ")");
                this._events[topic] = events[i];
            }
        }
        return this._events;
    }
    protected getAbiTopics(eventNames?: string[]): any[]{
        if (!eventNames || eventNames.length == 0)
            eventNames = null;
        let result = [];
        let events = this.getAbiEvents();
        for (let topic in events) {
            if (!eventNames || eventNames.includes(events[topic].name)){
                result.push(topic);
            }
        }
        if (result.length == 0 && eventNames && eventNames.length > 0)
            return ['NULL']
        return [result];
    }
    // registerEvents(handler: any) {
    //     if (this._address)
    //         this.wallet.registerEvent(this.getAbiEvents(), this._address, handler);
    // }
    scanEvents(fromBlock: number | {fromBlock: number, toBlock?: number|string, eventNames?: string[]}, toBlock?: number|string, eventNames?: string[]): Promise<Event[]>{
        if (typeof(fromBlock) == 'number'){
            let topics = this.getAbiTopics(eventNames);
            let events = this.getAbiEvents();
            return this.wallet.scanEvents(fromBlock, toBlock, topics, events, this._address);
        }
        else{
            let params = fromBlock;
            let topics = this.getAbiTopics(params.eventNames);
            let events = this.getAbiEvents();
            return this.wallet.scanEvents(params.fromBlock, params.toBlock, topics, events, this._address);
        };
    };
    async batchCall(batchObj: IBatchRequestObj, key: string, methodName: string, params?: any[], options?:number|BigNumber|TransactionOptions){
        //TODO: implement the batch call

        // let contract = await this.getContract();
        // if (!contract.methods[methodName]) return;
        // let method = <IContractMethod>contract.methods[methodName].apply(this, params);
        // batchObj.promises.push(new Promise((resolve, reject) => {
        //     batchObj.batch.add(method.call.request({from: this.wallet.address, ...options}, 
        //         (e,v) => {
        //             return resolve({
        //                 key:key, 
        //                 result:e ? null : v
        //             });
        //         }
        //     ));
        // }));
    }        
    protected async txData(methodName:string, params?:any[], options?:number|BigNumber|TransactionOptions): Promise<string>{
        return await this.wallet._txData(this.abiHash, this._address, methodName, params, options);
    }
    protected async call(methodName:string, params?:any[], options?:number|BigNumber|TransactionOptions): Promise<any>{
        return await this.wallet._call(this.abiHash, this._address, methodName, params, options);
    }
    private async _send(methodName:string, params?:any[], options?:number|BigNumber|TransactionOptions): Promise<TransactionReceipt>{
        params = params || [];         
        return await this.wallet._send(this.abiHash, this._address, methodName, params, options);
    }
    protected async __deploy(params?:any[], options?:number|BigNumber|DeployOptions): Promise<string>{                        
        let bytecode = this._bytecode;
        let libraries = (<DeployOptions>options)?.libraries;
        let linkReferences = (<DeployOptions>options)?.linkReferences;
        if (libraries && linkReferences){
            for (let file in libraries) {
                for (let contract in libraries[file]) {
                    for (let offset of linkReferences[file][contract]) {
                        bytecode = bytecode.substring(0, offset.start * 2 + 2) + libraries[file][contract].replace("0x","") + bytecode.substring(offset.start * 2 + 2 + offset.length * 2)
                    }
                }
            }
        }
        params = params || [];
        params.unshift(bytecode);
        let receipt = await this._send('', params, options);
        this.address = receipt.contractAddress;
        return this.address;
    }
    protected send(methodName:string, params?:any[], options?:number|BigNumber|TransactionOptions): Promise<TransactionReceipt>{
        let receipt = this._send(methodName, params, options);
        return receipt;
    }

    // backward compatability
    protected _deploy(...params:any[]): Promise<string>{            
        return this.__deploy(params);
    }
    protected async methods(methodName:string, ...params:any[]) {
        let method = this._abi.find(e=>e.name==methodName);
        if (method.stateMutability == "view" || method.stateMutability == "pure") {
            return await this.call(methodName, params);
        } else if (method.stateMutability=='payable') {
            let value = params.pop();
            return await this.send(methodName, params, {value:value});
        } else {
            return await this.send(methodName, params);
        }
    }
};
export class TAuthContract extends Contract {
    async rely(address: string): Promise<any>{
        return await this.methods('rely', address)
    };
    async deny(address: string): Promise<any>{
        return await this.methods('deny', address)
    };
};