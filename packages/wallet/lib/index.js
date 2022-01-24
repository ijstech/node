"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = void 0;
const eth_wallet_1 = require("@ijstech/eth-wallet");
function loadPlugin(worker, options) {
    worker.data = worker.data || {};
    let network = options.networks[options.chainId];
    worker.data.wallet = new eth_wallet_1.Wallet(network.provider, options.accounts);
    let wallet = worker.data.wallet;
    wallet.chainId = options.chainId;
    if (worker.vm) {
        worker.vm.injectGlobalObject('$$wallet_plugin', {
            getAddress() {
                return wallet.address;
            },
            getChainId() {
                return wallet.chainId;
            },
            setChainId(value) {
                let network = options.networks[value];
                if (network) {
                    wallet.chainId = value;
                }
            },
            async getBalance() {
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
        }`;
    }
    else
        return {
            get address() {
                return wallet.address;
            },
            get chainId() {
                return wallet.chainId;
            },
            set chainId(value) {
                wallet.chainId = value;
            },
            async getBalance() {
                return (await wallet.balance).toNumber();
            }
        };
}
exports.loadPlugin = loadPlugin;
;
