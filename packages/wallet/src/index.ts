import {Wallet, IAccount} from '@ijstech/eth-wallet';
import * as Types from '@ijstech/types';

export function loadPlugin(worker: Types.IWorker, options: Types.IWalletRequiredPluginOptions): string | Types.IWalletPlugin{
    worker.data = worker.data || {};
    let network = options.networks[options.chainId];
    worker.data.wallet = new Wallet(network.provider, options.accounts);    
    let wallet: Wallet = worker.data.wallet;
    wallet.chainId = options.chainId;
    if (worker.vm){
        worker.vm.injectGlobalObject('$$wallet_plugin', {            
            async balanceOf(address: string): Promise<string>{
                let result = await wallet.balanceOf(address);
                return result.toString();
                wallet.provider
            },
            createAccount(): string{
                let result = wallet.createAccount();
                return JSON.stringify(result);
            },
            decode(abi:any, event:Types.IWalletEventLog, raw?:{data: string,topics: string[]}): string{
                return JSON.stringify(wallet.decode(abi, event, raw))
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
            getChainId(){   
                return wallet.chainId
            },
            async getBlockNumber(): Promise<number>{
                return await wallet.getBlockNumber();
            },
            async getBlockTimestamp(): Promise<number>{
                return await wallet.getBlockTimestamp()
            },
            async recoverSigner(msg: string, signature: string): Promise<string>{
                return await wallet.recoverSigner(msg, signature);
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
            utils_fromWei(value: any, unit?: any): string{
                return wallet.utils.fromWei(value, unit);
            },
            utils_hexToUtf8(value: string): string{
                return wallet.utils.hexToUtf8(value);
            },
            utils_toUtf8(value: any): string{
                return wallet.utils.toUtf8(value);
            },
            utils_toWei(value: string, unit?: any): string{
                return wallet.utils.toWei(value, unit);
            },
            async verifyMessage(account: string, msg: string, signature: string): Promise<boolean>{
                return await wallet.verifyMessage(account, msg, signature);
            }     
        });
        return `
        let BigNumber = global._$$modules['bignumber.js'];
        global.$$session.plugins.wallet = {
            get account(){
                return {
                    address: global.$$wallet_plugin.getAddress()
                }
            },
            set account(value){
                global.$$wallet_plugin.setAccount(value);
            },
            get accounts(){
                return new Promise(async (resolve)=>{
                    let result = await global.$$wallet_plugin.getAccounts()                   
                    resolve(JSON.parse(result));
                });
            },
            get address(){
                return global.$$wallet_plugin.getAddress();
            },
            get balance(){
                return new Promise(async (resolve)=>{
                    let result = await global.$$wallet_plugin.getBalance();                    
                    resolve(new BigNumber(result));
                })
            },
            balanceOf(address){
                return new Promise(async (resolve)=>{
                    let result = await global.$$wallet_plugin.balanceOf(address)
                    resolve(new BigNumber(result));
                })
            },
            get chainId(){                
                return global.$$wallet_plugin.getChainId();
            },
            set chainId(value){
                global.$$wallet_plugin.setChainId(value);
            },
            createAccount(){                
                let result = global.$$wallet_plugin.createAccount()
                return JSON.parse(result);
            },
            decode(abi, event, raw){
                return JSON.parse(global.$$wallet_plugin.decode(abi, event, raw))
            },
            decodeLog(inputs, hexString, topics){
                return JSON.parse(global.$$wallet_plugin.decodeLog(inputs, hexString, topics));
            },
            get defaultAccount(){
                return global.$$wallet_plugin.getDefaultAccount();
            },
            set defaultAccount(value){
                return global.$$wallet_plugin.setDefaultAccount(value);
            },
            getAbiEvents(abi){
                return JSON.parse(global.$$wallet_plugin.getAbiEvents(abi));
            },
            getAbiTopics(abi, eventNames){
                return JSON.parse(global.$$wallet_plugin.getAbiTopics(abi, eventNames));
            },
            async getBlock(...args){
                return JSON.parse(await global.$$wallet_plugin.getBlock.apply(this, args));
            },
            async getBlockNumber(){
                return await global.$$wallet_plugin.getBlockNumber();
            },
            async getBlockTimestamp(){
                return await global.$$wallet_plugin.getBlockTimestamp();
            },
            async methods(...args){
                return JSON.parse(await global.$$wallet_plugin.methods.apply(this, args));
            },
            async recoverSigner(...args){
                return await global.$$wallet_plugin.recoverSigner.apply(this, args);
            },
            async send(to, amount){
                return JSON.parse(await global.$$wallet_plugin.send(to, amount));
            },
            async scanEvents(...args){
                let result = await global.$$wallet_plugin.scanEvents.apply(this, args);
                return JSON.parse(result);
            },
            async signMessage(msg){
                return await global.$$wallet_plugin.signMessage(msg);
            },
            utils: {
                fromWei(value, unit){
                    return global.$$wallet_plugin.utils_fromWei(value, unit);
                },
                hexToUtf8(value){
                    return global.$$wallet_plugin.utils.hexToUtf8(value);
                },
                toUtf8(value){
                    return global.$$wallet_plugin.utils.toUtf8(value);
                },
                toWei(value, unit){
                    return global.$$wallet_plugin.utils.toWei(value, unit);
                }
            },
            async verifyMessage(...args){
                return JSON.parse(await global.$$wallet_plugin.verifyMessage.apply(this, args));
            }
        }`
    }
    else
        return wallet;
};
    