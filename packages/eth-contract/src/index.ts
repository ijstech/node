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
    fromWei(value: any, unit?: string): string;
    hexToUtf8(value: string): string;
    sha3(value: string): string;
    stringToBytes(value: string | stringArray, nByte?: number): string | string[];
    stringToBytes32(value: string | stringArray): string | string[];
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
    // registerEvent(eventMap: {[topics: string]: any;}, address: string, handler: any): void;
    send(to: string, amount: number): Promise<TransactionReceipt>;
    _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<TransactionReceipt>;
    scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string | string[]): Promise<Event[]>;            
    utils: IWalletUtils;
    _txObj(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<Transaction>;
    _txData(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<string>;
};
export interface Event{
    name: string;
    address: string;
    blockNumber: number;
    logIndex: number;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;        
    data: any;
    rawData: any;
};
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
    logs ? : Array <IWalletLog>;
    events ? : {
        [eventName: string]: IWalletEventLog | IWalletEventLog[]
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
    value?: string | number;
    gasPrice?: string | number;
    maxPriorityFeePerGas?: number | string | BigNumber;
    maxFeePerGas?: number | string | BigNumber;
    gas?: number;
    input?: string;
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
                    if (topic0 == event.raw.topics[0] && (this.address && this.address==event.address)) {
                        result.push(this.wallet.decode(eventAbis[topic0], event, event.raw));
                    }
                });
            }
        } else if (receipt.logs) {
            for (let i = 0 ; i < receipt.logs.length ; i++) {
                let log = receipt.logs[i];
                if (topic0 == log.topics[0] && (this.address && this.address==log.address)) {
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
    scanEvents(fromBlock: number, toBlock: number|string, eventNames?: string[]): Promise<Event[]>{
        let topics = this.getAbiTopics(eventNames);
        let events = this.getAbiEvents();
        return this.wallet.scanEvents(fromBlock, toBlock, topics, events, this._address);
    };
    async batchCall(batchObj: IBatchRequestObj, key: string, methodName: string, params?: any[], options?:number|BigNumber|Transaction){
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
    protected async txData(methodName:string, params?:any[], options?:number|BigNumber|Transaction): Promise<string>{
        return await this.wallet._txData(this.abiHash, this._address, methodName, params, options);
    }
    protected async call(methodName:string, params?:any[], options?:number|BigNumber|Transaction): Promise<any>{
        return await this.wallet._call(this.abiHash, this._address, methodName, params, options);
    }
    private async _send(methodName:string, params?:any[], options?:number|BigNumber|Transaction): Promise<TransactionReceipt>{
        params = params || [];         
        if (!methodName)   
            params.unshift(this._bytecode);
        return await this.wallet._send(this.abiHash, this._address, methodName, params, options);
    }
    protected async __deploy(params?:any[], options?:number|BigNumber|Transaction): Promise<string>{                        
        let receipt = await this._send('', params, options);
        this.address = receipt.contractAddress;
        return this.address;
    }
    protected send(methodName:string, params?:any[], options?:number|BigNumber|Transaction): Promise<TransactionReceipt>{
        let receipt = this._send(methodName, params, options);
        return receipt;
    }

    // backward compatability
    protected _deploy(...params:any[]): Promise<string>{            
        return this.__deploy(params);
    }
    protected methods(methodName:string, ...params:any[]) {
        let method = this._abi.find(e=>e.name==methodName);
        if (method.stateMutability == "view" || method.stateMutability == "pure") {
            return this.call(methodName, params);
        } else if (method.stateMutability=='payable') {
            let value = new BigNumber(params.pop()).toString();
            return this.call(methodName, params, {value:value});
        } else {
            return this.send(methodName, params);
        }
    }
};
export class TAuthContract extends Contract {
    rely(address: string): Promise<any>{
        return this.methods('rely', address)
    };
    deny(address: string): Promise<any>{
        return this.methods('deny', address)
    };
};