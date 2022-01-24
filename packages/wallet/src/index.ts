import {Wallet} from '@ijstech/eth-wallet';
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
            async getBalance(): Promise<number>{
                let balance = await wallet.balance;
                return balance.toNumber();
            }
        });
        return `
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
            async getBalance(){
                return await global.$$wallet_plugin.getBalance();
            }
        }`
    }
    else
        return {
            get address(): string{
                return wallet.address;
            },
            get chainId(): number{                
                return wallet.chainId;
            },
            set chainId(value: number){
                wallet.chainId = value;
            },
            async getBalance(): Promise<number>{
                return (await wallet.balance).toNumber();
            }
        };
    };