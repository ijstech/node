"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = void 0;
const eth_wallet_1 = require("@ijstech/eth-wallet");
const bignumber_js_1 = require("bignumber.js");
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
            async balance() {
                let balance = await wallet.balance;
                return balance.toString();
            },
            async methods(...args) {
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
        }`;
    }
    else
        return {
            get address() {
                return wallet.address;
            },
            get balance() {
                return new Promise(async (resolve) => {
                    resolve(new bignumber_js_1.BigNumber(await wallet.balance));
                });
            },
            get chainId() {
                return wallet.chainId;
            },
            set chainId(value) {
                wallet.chainId = value;
            },
            decode(abi, event, raw) {
                return wallet.decode(abi, event, raw);
            },
            decodeLog(inputs, hexString, topics) {
                return wallet.decodeLog(inputs, hexString, topics);
            },
            getAbiEvents(abi) {
                return wallet.getAbiEvents(abi);
            },
            getAbiTopics(abi, eventNames) {
                return wallet.getAbiTopics(abi, eventNames);
            },
            methods(...args) {
                return wallet.methods.apply(wallet, args);
            },
            send(to, amount) {
                return wallet.send(to, amount);
            },
            scanEvents(fromBlock, toBlock, topics, events, address) {
                return wallet.scanEvents(fromBlock, toBlock, topics, events, address);
            },
            utils: {
                fromWei(value, unit) {
                    return wallet.utils.fromWei(value, unit);
                },
                hexToUtf8(value) {
                    console.dir('hexToUtf8');
                    return '';
                },
                toUtf8(value) {
                    return wallet.utils.toUtf8(value);
                },
                toWei(value, unit) {
                    return wallet.utils.toWei(value, unit);
                }
            }
        };
}
exports.loadPlugin = loadPlugin;
;
