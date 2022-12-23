"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = __importDefault(require("bignumber.js"));
;
let _abiAddressDict = {};
let _abiEventDict = {};
let _abiHashDict = {};
let _eventHandler;
function _registerAbiContracts(abiHash, address, handler) {
    if (address) {
        _eventHandler = _eventHandler || {};
        if (!Array.isArray(address))
            address = [address];
        for (let i = 0; i < address.length; i++) {
            _abiAddressDict[address[i]] = abiHash;
            if (handler)
                _eventHandler[address[i]] = handler;
        }
    }
}
;
function parseJson(value) {
    return JSON.parse(value);
}
;
const Wallet = {
    get account() {
        let wallet = global.$$wallet_plugin;
        return {
            address: wallet.getAddress()
        };
    },
    set account(value) {
        let wallet = global.$$wallet_plugin;
        wallet.setAccount(value);
    },
    get accounts() {
        return new Promise(async (resolve) => {
            let wallet = global.$$wallet_plugin;
            let result = await wallet.getAccounts();
            resolve(parseJson(result));
        });
    },
    get address() {
        let wallet = global.$$wallet_plugin;
        return wallet.getAddress();
    },
    get balance() {
        return new Promise(async (resolve) => {
            let wallet = global.$$wallet_plugin;
            let result = await wallet.getBalance();
            resolve(new bignumber_js_1.default(result));
        });
    },
    balanceOf(address) {
        return new Promise(async (resolve) => {
            let wallet = global.$$wallet_plugin;
            let result = await wallet.balanceOf(address);
            resolve(new bignumber_js_1.default(result));
        });
    },
    _call(abiHash, address, methodName, params, options) {
        return new Promise(async (resolve) => {
            let wallet = global.$$wallet_plugin;
            let result = await wallet._call(abiHash, address, methodName, params, options);
            resolve(parseJson(result));
        });
    },
    get chainId() {
        let wallet = global.$$wallet_plugin;
        return wallet.getChainId();
    },
    set chainId(value) {
        let wallet = global.$$wallet_plugin;
        wallet.setChainId(value);
    },
    createAccount() {
        let wallet = global.$$wallet_plugin;
        let result = wallet.createAccount();
        return parseJson(result);
    },
    decode(abi, event, raw) {
        let wallet = global.$$wallet_plugin;
        return parseJson(wallet.decode(abi, event, raw));
    },
    async decodeEventData(data, events) {
        let wallet = global.$$wallet_plugin;
        return parseJson(await wallet.decodeEventData(data, events));
    },
    decodeLog(inputs, hexString, topics) {
        let wallet = global.$$wallet_plugin;
        return parseJson(wallet.decodeLog(inputs, hexString, topics));
    },
    get defaultAccount() {
        let wallet = global.$$wallet_plugin;
        return wallet.getDefaultAccount();
    },
    set defaultAccount(value) {
        let wallet = global.$$wallet_plugin;
        wallet.setDefaultAccount(value);
    },
    getAbiEvents(abi) {
        let wallet = global.$$wallet_plugin;
        return parseJson(wallet.getAbiEvents(abi));
    },
    getAbiTopics(abi, eventNames) {
        let wallet = global.$$wallet_plugin;
        return parseJson(wallet.getAbiTopics(abi, eventNames));
    },
    async getBlock(...args) {
        let wallet = global.$$wallet_plugin;
        return parseJson(await wallet.getBlock.apply(this, args));
    },
    async getBlockNumber() {
        let wallet = global.$$wallet_plugin;
        return await wallet.getBlockNumber();
    },
    async getBlockTimestamp(blockHashOrBlockNumber) {
        let wallet = global.$$wallet_plugin;
        return await wallet.getBlockTimestamp(blockHashOrBlockNumber);
    },
    async getChainId() {
        let wallet = global.$$wallet_plugin;
        return await wallet.getChainId();
    },
    getContractAbi(address) {
        let wallet = global.$$wallet_plugin;
        return _abiAddressDict[address];
    },
    getContractAbiEvents(address) {
        let wallet = global.$$wallet_plugin;
        let events = _abiEventDict[address];
        if (events)
            return events;
        let abi = _abiHashDict[_abiAddressDict[address]];
        if (abi) {
            events = parseJson(wallet.getAbiEvents(abi));
            _abiEventDict[address] = events;
            return events;
        }
        ;
    },
    async getTransaction(transactionHash) {
        let wallet = global.$$wallet_plugin;
        let result = await wallet.getTransaction(transactionHash);
        return parseJson(result);
    },
    async methods(...args) {
        let wallet = global.$$wallet_plugin;
        return parseJson(await wallet.methods.apply(this, args));
    },
    set privateKey(value) {
        let wallet = global.$$wallet_plugin;
        wallet.setPrivateKey(value);
    },
    async recoverSigner(msg, signature) {
        let wallet = global.$$wallet_plugin;
        return await wallet.recoverSigner(msg, signature);
    },
    registerAbi(abi, address, handler) {
        let wallet = global.$$wallet_plugin;
        let hash = wallet.registerAbi(abi, address);
        if (address && handler)
            _registerAbiContracts(hash, address, handler);
        return hash;
    },
    registerAbiContracts(abiHash, address, handler) {
        let wallet = global.$$wallet_plugin;
        wallet.registerAbiContracts(abiHash, address);
        if (address && handler)
            _registerAbiContracts(abiHash, address, handler);
    },
    async send(to, amount) {
        let wallet = global.$$wallet_plugin;
        return parseJson(await wallet.send(to, amount));
    },
    async _send(abiHash, address, methodName, params, options) {
        let wallet = global.$$wallet_plugin;
        return parseJson(await wallet._send(abiHash, address, methodName, params, options));
    },
    async scanEvents(fromBlock, toBlock, topics, events, address) {
        let wallet = global.$$wallet_plugin;
        let result = parseJson(await wallet.scanEvents(fromBlock, toBlock, topics, events, address));
        if (_eventHandler) {
            for (let i = 0; i < result.length; i++) {
                let event = result[i];
                let handler = _eventHandler[event.address];
                if (handler)
                    await handler(event);
            }
        }
        return result;
    },
    async signMessage(msg) {
        let wallet = global.$$wallet_plugin;
        return await wallet.signMessage(msg);
    },
    async signTransaction(tx, privateKey) {
        let wallet = global.$$wallet_plugin;
        return await wallet.signTransaction(tx, privateKey);
    },
    async tokenInfo(address) {
        let wallet = global.$$wallet_plugin;
        let result = parseJson(await wallet.tokenInfo(address));
        if (result.totalSupply)
            result.totalSupply = new bignumber_js_1.default(result.totalSupply);
        return result;
    },
    utils: {
        fromDecimals(value, decimals) {
            decimals = decimals || 18;
            return new bignumber_js_1.default(value).shiftedBy(-decimals);
        },
        fromWei(value, unit) {
            let wallet = global.$$wallet_plugin;
            return wallet.utils_fromWei(value, unit);
        },
        hexToUtf8(value) {
            let wallet = global.$$wallet_plugin;
            return wallet.utils_hexToUtf8(value);
        },
        sha3(value) {
            let wallet = global.$$wallet_plugin;
            return wallet.utils_sha3(value);
        },
        stringToBytes(value, nByte) {
            let wallet = global.$$wallet_plugin;
            return parseJson(wallet.utils_stringToBytes(JSON.stringify(value), nByte));
        },
        stringToBytes32(value) {
            let wallet = global.$$wallet_plugin;
            return wallet.utils_stringToBytes32(value);
        },
        toDecimals(value, decimals) {
            decimals = decimals || 18;
            return new bignumber_js_1.default(value).shiftedBy(decimals);
        },
        toString(value) {
            if (bignumber_js_1.default.isBigNumber(value))
                return new bignumber_js_1.default(value).toString(10);
            let wallet = global.$$wallet_plugin;
            return wallet.utils_toString(value);
        },
        toUtf8(value) {
            let wallet = global.$$wallet_plugin;
            return wallet.utils_toUtf8(value);
        },
        toWei(value, unit) {
            let wallet = global.$$wallet_plugin;
            return wallet.utils_toWei(value, unit);
        }
    },
    async verifyMessage(account, msg, signature) {
        let wallet = global.$$wallet_plugin;
        return await wallet.verifyMessage(account, msg, signature);
    },
    soliditySha3(...val) {
        let wallet = global.$$wallet_plugin;
        return wallet.soliditySha3(...val);
    },
    toChecksumAddress(address) {
        let wallet = global.$$wallet_plugin;
        return wallet.toChecksumAddress(address);
    },
    _txObj(abiHash, address, methodName, params, options) {
        let wallet = global.$$wallet_plugin;
        return;
    },
    _txData(abiHash, address, methodName, params, options) {
        let wallet = global.$$wallet_plugin;
        return;
    }
};
exports.default = Wallet;
