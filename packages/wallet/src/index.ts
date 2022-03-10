import {Wallet} from '@ijstech/eth-wallet';
import {BigNumber} from 'bignumber.js';
import * as Types from '@ijstech/types';

export function loadPlugin(worker: Types.IWorker, options: Types.IWalletRequiredPluginOptions): string | Types.IWalletPlugin{
    worker.data = worker.data || {};
    let network = options.networks[options.chainId];
    worker.data.wallet = new Wallet(network.provider, options.accounts);    
    let wallet: Wallet = worker.data.wallet;
    wallet.chainId = options.chainId;
    if (worker.vm){
        worker.vm.injectGlobalObject('$$wallet_plugin', {
            getAddress(){
                return wallet.address
            },
            getChainId(){   
                return wallet.chainId
            },
            setChainId(value: number){
                let network = options.networks[value];
                if (network){
                    wallet.chainId = value;
                    // wallet.provider = network.provider
                }
            },
            async balance(): Promise<string>{
                let balance = await wallet.balance;
                return balance.toString();
            },
            async methods(...args){
                return await wallet.methods.apply(wallet, args);
            }
        });
        return `
        let BigNumber = global._$$modules['bignumber.js'];
        global.$$session.plugins.wallet = {
            get address(){
                return global.$$wallet_plugin.getAddress();
            },
            get chainId(){                
                return global.$$wallet_plugin.getChainId();
            },
            set chainId(value){
                global.$$wallet_plugin.setChainId(value);
            },
            get balance(){
                return new Promise(async(resolve)=>{
                    let result = await global.$$wallet_plugin.balance();                    
                    resolve(new BigNumber(result));
                })
            },
            async methods(...args) {
                return await global.$$wallet_plugin.methods.apply(this, args);
            }
        }`
    }
    else
        return {
            get address(): string{
                return wallet.address;
            },            
            get balance(): Promise<BigNumber>{
                return new Promise(async (resolve)=>{                    
                    // let result = (await wallet.balance).toNumber();
                    resolve(new BigNumber(await wallet.balance))
                });
            },
            get chainId(): number{                
                return wallet.chainId;
            },
            set chainId(value: number){
                wallet.chainId = value;
            },
            decode(abi:any, event:Types.IWalletEventLog, raw?:{data: string,topics: string[]}): Types.IWalletEvent{
                return wallet.decode(abi, event, raw)
            },
            decodeLog(inputs: any, hexString: string, topics: any): any{
                return wallet.decodeLog(inputs, hexString, topics);
            },
            getAbiEvents(abi: any[]): any{
                return wallet.getAbiEvents(abi);
            },
            getAbiTopics(abi: any[], eventNames: string[]): any[]{
                return wallet.getAbiTopics(abi, eventNames);
            },
            methods(...args: any): Promise<any>{
                return wallet.methods.apply(wallet, args);
            },
            send(to: string, amount: number): Promise<Types.IWalletTransactionReceipt>{
                return wallet.send(to, amount);
            },
            scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<Types.IWalletEvent[]>{
                return wallet.scanEvents(fromBlock, toBlock, topics, events, address);
            },
            utils: {
                fromWei(value: any, unit?: any): string{
                    return wallet.utils.fromWei(value, unit);
                },
                hexToUtf8(value: string): string{
                    console.dir('hexToUtf8');
                    return '';
                    // return wallet.utils.hexToUtf8(value);
                },
                toUtf8(value: any): string{
                    return wallet.utils.toUtf8(value);
                },
                toWei(value: string, unit?: any): string{
                    return wallet.utils.toWei(value, unit);
                }
            }
        };
    };
    