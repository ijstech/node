/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {Wallet, IAccount, IWallet} from '@ijstech/eth-wallet';
import {IWorker} from '@ijstech/types';
import {IWalletLog, IWalletRequiredPluginOptions, IWalletEventLog} from '@ijstech/types';
import {IWalletPluginObject, IWalletTransaction} from './plugin';
function getWalletPlugin(): IWallet{
    return global.$$wallet_plugin;
}
export default getWalletPlugin();
export type stringArray = string | _stringArray;
export interface _stringArray extends Array<stringArray> { };
export async function loadPlugin(worker: IWorker, options: IWalletRequiredPluginOptions): Promise<string | IWallet>{
    worker.data = worker.data || {};
    let network = options.networks[options.chainId];    
    let wallet = new Wallet(network.provider, options.accounts);
    worker.data.wallet = wallet;
    wallet.chainId = options.chainId;
    if (!wallet.defaultAccount){
        let accounts = await wallet.accounts;
        wallet.defaultAccount = accounts[0];
    };
    if (worker.vm){
        let plugin: IWalletPluginObject = {            
            async balanceOf(address: string): Promise<string>{
                let result = await wallet.balanceOf(address);
                return result.toString();
            },
            async _call(abiHash: string, address: string, methodName:string, params?:any[], options?:any): Promise<any>{
                let result = await wallet._call(abiHash, address, methodName, params, options);
                return JSON.stringify(result);
            },
            createAccount(): string{
                let result = wallet.createAccount();
                return JSON.stringify(result);
            },
            decode(abi:any, event:IWalletEventLog, raw?:{data: string,topics: string[]}): string{
                return JSON.stringify(wallet.decode(abi, event, raw))
            },
            async decodeEventData(data: IWalletLog, events?: any): Promise<string>{
                return JSON.stringify(await wallet.decodeEventData(data, events))
            },
            decodeLog(inputs: any, hexString: string, topics: any): string{
                return JSON.stringify(wallet.decodeLog(inputs, hexString, topics));
            },
            getAbiEvents(abi: any[]): string{
                return JSON.stringify(wallet.getAbiEvents(abi));
            },
            getAbiTopics(abi: any[], eventNames: string[]): string{
                return JSON.stringify(wallet.getAbiTopics(abi, eventNames));
            },
            async getAccounts(): Promise<string>{
                let result = await wallet.accounts;
                return JSON.stringify(result);
            },
            getAddress(): string{
                return wallet.address
            },
            async getBalance(): Promise<string>{
                let balance = await wallet.balance;
                return balance.toString();
            },
            async getBlock(blockHashOrBlockNumber?: number | string, returnTransactionObjects?: boolean): Promise<string>{
                let result = await wallet.getBlock(blockHashOrBlockNumber, returnTransactionObjects);
                return JSON.stringify(result);
            },
            getDefaultAccount(): string{
                return wallet.defaultAccount;
            },
            async methods(...args: any[]): Promise<string>{
                return JSON.stringify(await wallet.methods.apply(wallet, args));
            },            
            async getBlockNumber(): Promise<number>{
                return await wallet.getBlockNumber();
            },
            async getBlockTimestamp(blockHashOrBlockNumber?: number | string): Promise<number>{
                return await wallet.getBlockTimestamp(blockHashOrBlockNumber)
            },
            getChainId():number{   
                return wallet.chainId
            },
            async getTransaction(transactionHash: string): Promise<string>{
                return JSON.stringify(await wallet.getTransaction(transactionHash));
            },
            setPrivateKey(value: string){
                wallet.privateKey = value;
            },
            async recoverSigner(msg: string, signature: string): Promise<string>{
                return await wallet.recoverSigner(msg, signature);
            },
            registerAbi(abi: any[] | string, address?: string|string[]): string{
                return wallet.registerAbi(abi, address);
            },
            registerAbiContracts(abiHash: string, address: string|string[]){
                wallet.registerAbiContracts(abiHash, address)
            },
            setChainId(value: number){
                let network = options.networks[value];
                if (network){
                    wallet.chainId = value;
                }
            },
            setDefaultAccount(value: string){
                wallet.defaultAccount = value;
            },
            async send(to: string, amount: number): Promise<string>{
                return JSON.stringify(await wallet.send(to, amount));
            },
            async _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<string>{
                return JSON.stringify(await wallet._send(abiHash, address, methodName, params, options));
            },
            async scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<string>{
                let result = await wallet.scanEvents(fromBlock, toBlock, topics, events, address);
                return JSON.stringify(result);
            },
            setAccount(value: IAccount){
                wallet.account = value;
            },
            async signMessage(msg: string): Promise<string>{
                return await wallet.signMessage(msg)
            },
            async signTransaction(tx: any, privateKey?: string): Promise<string>{
                return await wallet.signTransaction(tx, privateKey);
            },
            async tokenInfo(address: string): Promise<string>{
                let result = await wallet.tokenInfo(address);
                return JSON.stringify({
                    name: result.name,
                    symbol: result.symbol,
                    decimals: result.decimals,
                    totalSupply: result.totalSupply.toString()
                });
            },
            utils_fromWei(value: any, unit?: any): string{
                return wallet.utils.fromWei(value, unit);
            },
            utils_hexToUtf8(value: string): string{          
                return wallet.utils.hexToUtf8(value);
            },
            utils_sha3(value: string): string{
                return wallet.utils.sha3(value);
            },
            utils_stringToBytes(value: string, nByte?: number): string{
                return JSON.stringify(wallet.utils.stringToBytes(value, nByte));
            },
            utils_stringToBytes32(value: string|stringArray): string{
                return JSON.stringify(wallet.utils.stringToBytes32(value));
            },
            utils_toString(value: any): string{
                return wallet.utils.toString(value);
            },
            utils_toUtf8(value: any): string{
                return wallet.utils.toUtf8(value);
            },
            utils_toWei(value: string, unit?: any): string{
                return wallet.utils.toWei(value, unit);
            },
            async verifyMessage(account: string, msg: string, signature: string): Promise<boolean>{
                return await wallet.verifyMessage(account, msg, signature);
            }, 
            soliditySha3(...val: any[]): string{
                return wallet.soliditySha3(...val);
            },     
            toChecksumAddress(address: string): string{
                return wallet.toChecksumAddress(address);
            }           
        };
        worker.vm.injectGlobalObject('$$wallet_plugin', plugin);
        return `
            global.$$session.plugins.wallet = global._$$modules['@ijstech/wallet'].default;
        `
    }
    else
        return wallet;
};
    