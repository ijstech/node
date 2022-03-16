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
            async balanceOf(address) {
                let result = await wallet.balanceOf(address);
                return result.toString();
                wallet.provider;
            },
            createAccount() {
                let result = wallet.createAccount();
                return JSON.stringify(result);
            },
            decode(abi, event, raw) {
                return JSON.stringify(wallet.decode(abi, event, raw));
            },
            decodeLog(inputs, hexString, topics) {
                return JSON.stringify(wallet.decodeLog(inputs, hexString, topics));
            },
            getAbiEvents(abi) {
                return JSON.stringify(wallet.getAbiEvents(abi));
            },
            getAbiTopics(abi, eventNames) {
                return JSON.stringify(wallet.getAbiTopics(abi, eventNames));
            },
            async getAccounts() {
                let result = await wallet.accounts;
                return JSON.stringify(result);
            },
            getAddress() {
                return wallet.address;
            },
            async getBalance() {
                let balance = await wallet.balance;
                return balance.toString();
            },
            async getBlock(blockHashOrBlockNumber, returnTransactionObjects) {
                let result = await wallet.getBlock(blockHashOrBlockNumber, returnTransactionObjects);
                return JSON.stringify(result);
            },
            getDefaultAccount() {
                return wallet.defaultAccount;
            },
            async methods(...args) {
                return JSON.stringify(await wallet.methods.apply(wallet, args));
            },
            getChainId() {
                return wallet.chainId;
            },
            async getBlockNumber() {
                return await wallet.getBlockNumber();
            },
            async getBlockTimestamp() {
                return await wallet.getBlockTimestamp();
            },
            async recoverSigner(msg, signature) {
                return await wallet.recoverSigner(msg, signature);
            },
            setChainId(value) {
                let network = options.networks[value];
                if (network) {
                    wallet.chainId = value;
                }
            },
            setDefaultAccount(value) {
                wallet.defaultAccount = value;
            },
            async send(to, amount) {
                return JSON.stringify(await wallet.send(to, amount));
            },
            async scanEvents(fromBlock, toBlock, topics, events, address) {
                let result = await wallet.scanEvents(fromBlock, toBlock, topics, events, address);
                return JSON.stringify(result);
            },
            setAccount(value) {
                wallet.account = value;
            },
            async signMessage(msg) {
                return await wallet.signMessage(msg);
            },
            utils_fromWei(value, unit) {
                return wallet.utils.fromWei(value, unit);
            },
            utils_hexToUtf8(value) {
                return wallet.utils.hexToUtf8(value);
            },
            utils_toUtf8(value) {
                return wallet.utils.toUtf8(value);
            },
            utils_toWei(value, unit) {
                return wallet.utils.toWei(value, unit);
            },
            async verifyMessage(account, msg, signature) {
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
        }`;
    }
    else
        return wallet;
}
exports.loadPlugin = loadPlugin;
;
