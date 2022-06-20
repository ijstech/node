"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = void 0;
const eth_wallet_1 = require("@ijstech/eth-wallet");
function getWalletPlugin() {
    return global.$$wallet_plugin;
}
exports.default = getWalletPlugin();
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
            },
            createAccount() {
                let result = wallet.createAccount();
                return JSON.stringify(result);
            },
            decode(abi, event, raw) {
                return JSON.stringify(wallet.decode(abi, event, raw));
            },
            async decodeEventData(data, events) {
                return JSON.stringify(await wallet.decodeEventData(data, events));
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
            async getBlockNumber() {
                return await wallet.getBlockNumber();
            },
            async getBlockTimestamp(blockHashOrBlockNumber) {
                return await wallet.getBlockTimestamp(blockHashOrBlockNumber);
            },
            getChainId() {
                return wallet.chainId;
            },
            set privateKey(value) {
                wallet.privateKey = value;
            },
            async recoverSigner(msg, signature) {
                return await wallet.recoverSigner(msg, signature);
            },
            registerAbi(abi, address) {
                return wallet.registerAbi(abi, address);
            },
            registerAbiContracts(abiHash, address) {
                wallet.registerAbiContracts(abiHash, address);
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
            async signTransaction(tx, privateKey) {
                return await wallet.signTransaction(tx, privateKey);
            },
            async tokenInfo(address) {
                let result = await wallet.tokenInfo(address);
                return JSON.stringify({
                    name: result.name,
                    symbol: result.symbol,
                    decimals: result.decimals,
                    totalSupply: result.totalSupply.toString()
                });
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
            },
            soliditySha3(...val) {
                return wallet.soliditySha3(...val);
            }
        });
        return `
            global.$$session.plugins.wallet = global._$$modules['@ijstech/wallet'].default;
        `;
    }
    else
        return wallet;
}
exports.loadPlugin = loadPlugin;
;
