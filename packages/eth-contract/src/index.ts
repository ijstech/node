/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {BigNumber} from "bignumber.js";
export {BigNumber};
export interface IWalletUtils{    
    fromWei(value: any, unit?: string): string;
    hexToUtf8(value: string): string;
    toUtf8(value: any): string;		
    toWei(value: string, unit?: string): string;
};
export interface IWallet {		
    address: string;
    balance: Promise<BigNumber>;
    decode(abi:any, event:Log|EventLog, raw?:{data: string,topics: string[]}): Event;
    decodeLog(inputs: any, hexString: string, topics: any): any;
    getAbiEvents(abi: any[]): any;
    getAbiTopics(abi: any[], eventNames: string[]): any[];
    methods(...args: any): Promise<any>;
    send(to: string, amount: number): Promise<TransactionReceipt>;
    scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<Event[]>;
    utils: IWalletUtils;
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
}
export interface Log {
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
export interface EventLog {
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
    logs?: Array<Log>;
    events?: {
        [eventName: string]: EventLog | EventLog[];
    };
    status: boolean;
}
export interface Transaction{
    to: string;
    gas: number,
    data: string;
}
export interface EventType{
    name: string
}
export class Utils {
    private wallet: IWallet;
    public nullAddress = "0x0000000000000000000000000000000000000000";
    constructor(wallet: IWallet){
        this.wallet = wallet;
    };
    asciiToHex(str: string): string{
        if(!str)
            return "0x00";
        var hex = "";
        for(var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            var n = code.toString(16);
            hex += n.length < 2 ? '0' + n : n;
        };
        return "0x" + hex;
    };
    sleep(millisecond: number){
        return new Promise(function(resolve){
            setTimeout(function(){
                resolve(null);
            },millisecond);
        });
    };
    numberToBytes32(value: number|BigNumber, prefix?:boolean) {
        let v = new BigNumber(value).toString(16)
        v = v.replace("0x", "");
        v = this.padLeft(v, 64);
        if (prefix)
            v = '0x' + v
        return v;
    };
    padLeft(string: string, chars: number, sign?: string): string{
        return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
    };
    padRight(string: string, chars: number, sign?: string): string{
        return string + new Array(chars - string.length + 1).join(sign ? sign : "0");
    };
    stringToBytes32(value: string|string[]): string|string[]{
        if (Array.isArray(value)){
            let result = [];
            for (let i = 0; i < value.length; i ++){
                result.push(this.stringToBytes32(value[i]));
            }
            return result;
        }
        else{
            if (value.length == 66 && value.startsWith('0x'))
                return value;
            return this.padRight(this.asciiToHex(value),64)
        }
    }
    addressToBytes32(value: string, prefix?: boolean): string{
        let v = value
        v = v.replace("0x", "");
        v = this.padLeft(v, 64);
        if (prefix)
            v = '0x' + v;
        return v;
    };
    bytes32ToAddress(value: string): string{
        return '0x' + value.replace('0x000000000000000000000000','');
    };
    bytes32ToString(value: string): string{
        return this.wallet.utils.hexToUtf8(value);
    };
    addressToBytes32Right(value: string, prefix?: boolean): string{
        let v = value
        v = v.replace("0x", "");
        v = this.padRight(v, 64);
        if (prefix)
            v = '0x' + v;
        return v;
    };
    toNumber(value: string|number|BigNumber): number{
        if (typeof(value) == 'number')
            return value
        else if (typeof(value) == 'string')
            return new BigNumber(value).toNumber()
        else
            return value.toNumber()
    };
    toDecimals(value: BigNumber|number|string, decimals?: number): BigNumber{    
        decimals = decimals || 18;
        return new BigNumber(value).shiftedBy(decimals);
    };
    fromDecimals(value: BigNumber|number|string, decimals?: number): BigNumber{
        decimals = decimals || 18;
        return new BigNumber(value).shiftedBy(-decimals);
    };
    toString(value:any){
        if (Array.isArray(value)){
            let result = [];
            for (let i = 0; i < value.length; i ++){
                if (typeof value[i] === "number" || BigNumber.isBigNumber(value[i]))
                    result.push(value[i].toString(10))
                else
                    result.push(value[i]);
            }
            return result;
        }
        else if (typeof value === "number" || BigNumber.isBigNumber(value))
            return value.toString(10);
        else
            return value;
    };
};
export class Contract {
    public wallet: IWallet;
    public _abi: any;
    public _bytecode: any;
    public _address: string;
    private _events: any;
    private _utils: Utils;
    public privateKey: string;
    
    constructor(wallet: IWallet, address?: string, abi?: any, bytecode?: any) {            
        this.wallet = wallet;                        
        if (typeof(abi) == 'string')
            this._abi = JSON.parse(abi)
        else
            this._abi = abi
        this._bytecode = bytecode
        let self = this;
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
            let events = <EventLog[]>( Array.isArray(receipt.events[name]) ? receipt.events[name] : [receipt.events[name]] );
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
                let events = <EventLog[]>( Array.isArray(receipt.events[name]) ? receipt.events[name] : [receipt.events[name]] );
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
    protected methodsToUtf8(...args): Promise<string>{
        let self = this;            
        return new Promise<string>(async function(resolve, reject){
            let result = await self.methods.apply(self, args);
            resolve(self.wallet.utils.toUtf8(result));
        })
    }
    protected methodsToUtf8Array(...args): Promise<string[]>{
        let self = this;            
        return new Promise<string[]>(async function(resolve, reject){
            let result = await self.methods.apply(self, args);
            let arr = [];
            for (let i = 0; i < result.length; i ++){
                arr.push(self.wallet.utils.toUtf8(result[i]))
            }
            resolve(arr);
        })
    }
    protected methodsFromWeiArray(...args): Promise<BigNumber[]>{            
        let self = this;            
        return new Promise<BigNumber[]>(async function(resolve, reject){
            let result = await self.methods.apply(self, args)
            let arr = [];
            for (let i = 0; i < result.length; i ++){
                arr.push(new BigNumber(self.wallet.utils.fromWei(result[i])))
            }
            resolve(arr);
        })
    }
    protected methodsFromWei(...args): Promise<BigNumber>{            
        let self = this;
        return new Promise<BigNumber>(async function(resolve, reject){
            let result = await self.methods.apply(self, args);
            return resolve(new BigNumber(self.wallet.utils.fromWei(result)));
        })
    }
    protected methods(...args): Promise<any>{
        args.unshift(this._address);
        args.unshift(this._abi);
        return this.wallet.methods.apply(this.wallet, args);
    }
    protected getAbiTopics(eventNames?: string[]){
        return this.wallet.getAbiTopics(this._abi, eventNames);
    }
    protected getAbiEvents(){
        if (!this._events)
            this._events = this.wallet.getAbiEvents(this._abi);
        return this._events;
    }
    scanEvents(fromBlock: number, toBlock: number|string, eventNames?: string[]): Promise<Event[]>{
        let topics = this.getAbiTopics(eventNames);
        let events = this.getAbiEvents();
        return this.wallet.scanEvents(fromBlock, toBlock, topics, events, this._address);
    };
    async _deploy(...args): Promise<string>{
        if (typeof(args[args.length-1]) == 'undefined')
            args.pop();
        args.unshift(this._bytecode);
        args.unshift('deploy');
        args.unshift(null);
        args.unshift(this._abi);
        this._address = await this.wallet.methods.apply(this.wallet, args);
        return this._address;
    };
    get utils(): Utils{
        if (!this._utils)
            this._utils = new Utils(this.wallet);
        return this._utils;
    }
};
export class TAuthContract extends Contract {
    rely(address: string): Promise<any>{
        return this.methods('rely', address)
    }
    deny(address: string): Promise<any>{
        return this.methods('deny', address)
    }
};