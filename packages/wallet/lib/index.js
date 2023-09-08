"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = void 0;
const eth_wallet_1 = require("@ijstech/eth-wallet");
function getWalletPlugin() {
    return global.$$wallet_plugin;
}
exports.default = getWalletPlugin();
;
function convertDataType(value) {
    if (Array.isArray(value)) {
        let keys = Object.keys(value);
        if (keys.length > value.length) {
            let result = {};
            for (let i = 0; i < keys.length; i++)
                result[keys[i]] = value[keys[i]];
            return result;
        }
        else {
            let result = [];
            for (let i = 0; i < value.length; i++)
                result.push(convertDataType(value[i]));
            return result;
        }
    }
    else if (typeof (value) == 'object') {
        let result = {};
        for (let n in value)
            result[n] = convertDataType(value[n]);
        return result;
    }
    else
        return value;
}
;
function stringifyJson(value) {
    return JSON.stringify(convertDataType(value));
}
;
async function loadPlugin(worker, options) {
    worker.data = worker.data || {};
    let network = options.networks[options.chainId];
    let wallet = new eth_wallet_1.Wallet(network.provider, options.accounts);
    worker.data.wallet = wallet;
    wallet.chainId = options.chainId;
    if (!wallet.defaultAccount) {
        let accounts = await wallet.accounts;
        wallet.defaultAccount = accounts[0];
    }
    ;
    if (worker.vm) {
        let plugin = {
            async balanceOf(address) {
                let result = await wallet.balanceOf(address);
                return result.toString(10);
            },
            async _call(abiHash, address, methodName, params, options) {
                let result = await wallet._call(abiHash, address, methodName, params, options);
                return stringifyJson(result);
            },
            createAccount() {
                let result = wallet.createAccount();
                return stringifyJson(result);
            },
            decode(abi, event, raw) {
                return stringifyJson(wallet.decode(abi, event, raw));
            },
            async decodeEventData(data, events) {
                return stringifyJson(await wallet.decodeEventData(data, events));
            },
            decodeErrorMessage(msg) {
                return stringifyJson(wallet.decodeErrorMessage(msg));
            },
            decodeLog(inputs, hexString, topics) {
                return stringifyJson(wallet.decodeLog(inputs, hexString, topics));
            },
            getAbiEvents(abi) {
                return stringifyJson(wallet.getAbiEvents(abi));
            },
            getAbiTopics(abi, eventNames) {
                return stringifyJson(wallet.getAbiTopics(abi, eventNames));
            },
            async getAccounts() {
                let result = await wallet.accounts;
                return stringifyJson(result);
            },
            getAddress() {
                return wallet.address;
            },
            async getBalance() {
                let balance = await wallet.balance;
                return balance.toString(10);
            },
            async getBlock(blockHashOrBlockNumber, returnTransactionObjects) {
                let result = await wallet.getBlock(blockHashOrBlockNumber, returnTransactionObjects);
                return stringifyJson(result);
            },
            getDefaultAccount() {
                return wallet.defaultAccount;
            },
            async methods(...args) {
                return stringifyJson(await wallet.methods.apply(wallet, args));
            },
            async getBlockNumber() {
                return await wallet.getBlockNumber();
                ;
            },
            async getBlockTimestamp(blockHashOrBlockNumber) {
                return await wallet.getBlockTimestamp(blockHashOrBlockNumber);
            },
            getChainId() {
                return wallet.chainId;
            },
            async getTransaction(transactionHash) {
                return stringifyJson(await wallet.getTransaction(transactionHash));
            },
            setPrivateKey(value) {
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
                return stringifyJson(await wallet.send(to, amount));
            },
            async _send(abiHash, address, methodName, params, options) {
                return stringifyJson(await wallet._send(abiHash, address, methodName, params, options));
            },
            async scanEvents(fromBlock, toBlock, topics, events, address) {
                if (typeof (fromBlock) == 'number') {
                    let result = await wallet.scanEvents(fromBlock, toBlock, topics, events, address);
                    return stringifyJson(result);
                }
                else {
                    let params = fromBlock;
                    let result = await wallet.scanEvents(params.fromBlock, params.toBlock, params.topics, params.events, params.address);
                    return stringifyJson(result);
                }
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
                return stringifyJson({
                    name: result.name,
                    symbol: result.symbol,
                    decimals: result.decimals,
                    totalSupply: result.totalSupply.toString(10)
                });
            },
            utils_fromWei(value, unit) {
                return wallet.utils.fromWei(value, unit);
            },
            utils_hexToUtf8(value) {
                return wallet.utils.hexToUtf8(value);
            },
            utils_sha3(value) {
                return wallet.utils.sha3(value);
            },
            utils_stringToBytes(value, nByte) {
                return stringifyJson(wallet.utils.stringToBytes(value, nByte));
            },
            utils_stringToBytes32(value) {
                return stringifyJson(wallet.utils.stringToBytes32(value));
            },
            utils_toString(value) {
                return wallet.utils.toString(value);
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
            },
            toChecksumAddress(address) {
                return wallet.toChecksumAddress(address);
            },
            multiCall(calls, gasBuffer) {
                return wallet.multiCall(calls, gasBuffer);
            },
            encodeFunctionCall(contract, methodName, params) {
                return wallet.encodeFunctionCall(contract, methodName, params);
            },
            decodeAbiEncodedParameters(contract, methodName, hexString) {
                return wallet.decodeAbiEncodedParameters(contract, methodName, hexString);
            }
        };
        worker.vm.injectGlobalObject('$$wallet_plugin', plugin);
        return `
            global.$$session.plugins.wallet = global._$$modules['@ijstech/wallet'].default;
        `;
    }
    else
        return wallet;
}
exports.loadPlugin = loadPlugin;
;
