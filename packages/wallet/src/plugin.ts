/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import BigNumber from 'bignumber.js';
import {IWalletPlugin,IWalletTokenInfo,IWalletTransactionReceipt,IWalletAccount,IWalletLog,IWalletEventLog,IWalletEvent,IWalletBlockTransactionObject} from '@ijstech/types';
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