var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("plugin", ["require", "exports", "bignumber.js"], function (require, exports, bignumber_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    bignumber_js_1 = __importDefault(bignumber_js_1);
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
    const Wallet = {
        get account() {
            return {
                address: global.$$wallet_plugin.getAddress()
            };
        },
        set account(value) {
            global.$$wallet_plugin.setAccount(value);
        },
        get accounts() {
            return new Promise(async (resolve) => {
                let result = await global.$$wallet_plugin.getAccounts();
                resolve(JSON.parse(result));
            });
        },
        get address() {
            return global.$$wallet_plugin.getAddress();
        },
        get balance() {
            return new Promise(async (resolve) => {
                let result = await global.$$wallet_plugin.getBalance();
                resolve(new bignumber_js_1.default(result));
            });
        },
        balanceOf(address) {
            return new Promise(async (resolve) => {
                let result = await global.$$wallet_plugin.balanceOf(address);
                resolve(new bignumber_js_1.default(result));
            });
        },
        get chainId() {
            return global.$$wallet_plugin.getChainId();
        },
        set chainId(value) {
            global.$$wallet_plugin.setChainId(value);
        },
        createAccount() {
            let result = global.$$wallet_plugin.createAccount();
            return JSON.parse(result);
        },
        decode(abi, event, raw) {
            return JSON.parse(global.$$wallet_plugin.decode(abi, event, raw));
        },
        async decodeEventData(data, events) {
            return JSON.parse(await global.$$wallet_plugin.decodeEventData(data, events));
        },
        decodeLog(inputs, hexString, topics) {
            return JSON.parse(global.$$wallet_plugin.decodeLog(inputs, hexString, topics));
        },
        get defaultAccount() {
            return global.$$wallet_plugin.getDefaultAccount();
        },
        set defaultAccount(value) {
            global.$$wallet_plugin.setDefaultAccount(value);
        },
        getAbiEvents(abi) {
            return JSON.parse(global.$$wallet_plugin.getAbiEvents(abi));
        },
        getAbiTopics(abi, eventNames) {
            return JSON.parse(global.$$wallet_plugin.getAbiTopics(abi, eventNames));
        },
        async getBlock(...args) {
            return JSON.parse(await global.$$wallet_plugin.getBlock.apply(this, args));
        },
        async getBlockNumber() {
            return await global.$$wallet_plugin.getBlockNumber();
        },
        async getBlockTimestamp(blockHashOrBlockNumber) {
            return await global.$$wallet_plugin.getBlockTimestamp(blockHashOrBlockNumber);
        },
        async getChainId() {
            return await global.$$wallet_plugin.getChainId();
        },
        getContractAbi(address) {
            return _abiAddressDict[address];
        },
        getContractAbiEvents(address) {
            let events = _abiEventDict[address];
            if (events)
                return events;
            let abi = _abiHashDict[_abiAddressDict[address]];
            if (abi) {
                events = JSON.parse(global.$$wallet_plugin.getAbiEvents(abi));
                _abiEventDict[address] = events;
                return events;
            }
            ;
        },
        async methods(...args) {
            return JSON.parse(await global.$$wallet_plugin.methods.apply(this, args));
        },
        set privateKey(value) {
            global.$$wallet_plugin.privateKey = value;
        },
        async recoverSigner(msg, signature) {
            return await global.$$wallet_plugin.recoverSigner(msg, signature);
        },
        registerAbi(abi, address, handler) {
            let hash = global.$$wallet_plugin.registerAbi(abi, address);
            if (address && handler)
                _registerAbiContracts(hash, address, handler);
            return hash;
        },
        registerAbiContracts(abiHash, address, handler) {
            global.$$wallet_plugin.registerAbiContracts(abiHash, address);
            if (address && handler)
                _registerAbiContracts(abiHash, address, handler);
        },
        async send(to, amount) {
            return JSON.parse(await global.$$wallet_plugin.send(to, amount));
        },
        async scanEvents(fromBlock, toBlock, topics, events, address) {
            let result = JSON.parse(await global.$$wallet_plugin.scanEvents(fromBlock, toBlock, topics, events, address));
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
            return await global.$$wallet_plugin.signMessage(msg);
        },
        async signTransaction(tx, privateKey) {
            return await global.$$wallet_plugin.signTransaction(tx, privateKey);
        },
        async tokenInfo(address) {
            let result = JSON.parse(await global.$$wallet_plugin.tokenInfo(address));
            if (result.totalSupply)
                result.totalSupply = new bignumber_js_1.default(result.totalSupply);
            return result;
        },
        utils: {
            fromWei(value, unit) {
                return global.$$wallet_plugin.utils_fromWei(value, unit);
            },
            hexToUtf8(value) {
                return global.$$wallet_plugin.utils_hexToUtf8(value);
            },
            toUtf8(value) {
                return global.$$wallet_plugin.utils_toUtf8(value);
            },
            toWei(value, unit) {
                return global.$$wallet_plugin.utils_toWei(value, unit);
            }
        },
        async verifyMessage(account, msg, signature) {
            return await global.$$wallet_plugin.verifyMessage(account, msg, signature);
        },
        soliditySha3(...val) {
            return global.$$wallet_plugin.soliditySha3(...val);
        }
    };
    exports.default = Wallet;
});
