import {IWallet, Wallet, IAccount} from '@ijstech/eth-wallet';
import * as Types from '@ijstech/types';
function getWalletPlugin(): IWallet{
    return global.$$wallet_plugin;
}
export default getWalletPlugin();

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
            async decodeEventData(data: Types.IWalletLog, events?: any): Promise<string>{
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
            getChainId(){   
                return wallet.chainId
            },
            set privateKey(value: string){
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
            global.$$session.plugins.wallet = global._$$modules['@ijstech/wallet'].default;
        `
    }
    else
        return wallet;
};
    