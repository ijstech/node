define("index", ["require", "exports", "bignumber.js"], function (require, exports, bignumber_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TAuthContract = exports.Contract = exports.Utils = exports.BigNumber = void 0;
    Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return bignumber_js_1.BigNumber; } });
    ;
    ;
    class Utils {
        constructor(wallet) {
            this.nullAddress = "0x0000000000000000000000000000000000000000";
            this.wallet = wallet;
        }
        ;
        asciiToHex(str) {
            if (!str)
                return "0x00";
            var hex = "";
            for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                var n = code.toString(16);
                hex += n.length < 2 ? '0' + n : n;
            }
            ;
            return "0x" + hex;
        }
        ;
        sleep(millisecond) {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(null);
                }, millisecond);
            });
        }
        ;
        numberToBytes32(value, prefix) {
            let v = new bignumber_js_1.BigNumber(value).toString(16);
            v = v.replace("0x", "");
            v = this.padLeft(v, 64);
            if (prefix)
                v = '0x' + v;
            return v;
        }
        ;
        padLeft(string, chars, sign) {
            return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
        }
        ;
        padRight(string, chars, sign) {
            return string + new Array(chars - string.length + 1).join(sign ? sign : "0");
        }
        ;
        stringToBytes32(value) {
            if (Array.isArray(value)) {
                let result = [];
                for (let i = 0; i < value.length; i++) {
                    result.push(this.stringToBytes32(value[i]));
                }
                return result;
            }
            else {
                if (value.length == 66 && value.startsWith('0x'))
                    return value;
                return this.padRight(this.asciiToHex(value), 64);
            }
        }
        addressToBytes32(value, prefix) {
            let v = value;
            v = v.replace("0x", "");
            v = this.padLeft(v, 64);
            if (prefix)
                v = '0x' + v;
            return v;
        }
        ;
        bytes32ToAddress(value) {
            return '0x' + value.replace('0x000000000000000000000000', '');
        }
        ;
        bytes32ToString(value) {
            return this.wallet.utils.hexToUtf8(value);
        }
        ;
        addressToBytes32Right(value, prefix) {
            let v = value;
            v = v.replace("0x", "");
            v = this.padRight(v, 64);
            if (prefix)
                v = '0x' + v;
            return v;
        }
        ;
        toNumber(value) {
            if (typeof (value) == 'number')
                return value;
            else if (typeof (value) == 'string')
                return new bignumber_js_1.BigNumber(value).toNumber();
            else
                return value.toNumber();
        }
        ;
        toDecimals(value, decimals) {
            decimals = decimals || 18;
            return new bignumber_js_1.BigNumber(value).shiftedBy(decimals);
        }
        ;
        fromDecimals(value, decimals) {
            decimals = decimals || 18;
            return new bignumber_js_1.BigNumber(value).shiftedBy(-decimals);
        }
        ;
        toString(value) {
            if (Array.isArray(value)) {
                let result = [];
                for (let i = 0; i < value.length; i++) {
                    if (typeof value[i] === "number" || bignumber_js_1.BigNumber.isBigNumber(value[i]))
                        result.push(value[i].toString(10));
                    else
                        result.push(value[i]);
                }
                return result;
            }
            else if (typeof value === "number" || bignumber_js_1.BigNumber.isBigNumber(value))
                return value.toString(10);
            else
                return value;
        }
        ;
    }
    exports.Utils = Utils;
    ;
    class Contract {
        constructor(wallet, address, abi, bytecode) {
            this.wallet = wallet;
            if (typeof (abi) == 'string')
                this._abi = JSON.parse(abi);
            else
                this._abi = abi;
            this._bytecode = bytecode;
            let self = this;
            if (address)
                this._address = address;
        }
        at(address) {
            this._address = address;
            return this;
        }
        set address(value) {
            this._address = value;
        }
        get address() {
            return this._address || '';
        }
        decodeEvents(receipt) {
            let events = this.getAbiEvents();
            let result = [];
            for (let name in receipt.events) {
                let events = (Array.isArray(receipt.events[name]) ? receipt.events[name] : [receipt.events[name]]);
                events.forEach(e => {
                    let data = e.raw;
                    let event = events[data.topics[0]];
                    result.push(Object.assign({ _name: name, _address: this.address }, this.wallet.decodeLog(event.inputs, data.data, data.topics.slice(1))));
                });
            }
            return result;
        }
        parseEvents(receipt, eventName) {
            let eventAbis = this.getAbiEvents();
            let topic0 = this.getAbiTopics([eventName])[0];
            let result = [];
            if (receipt.events) {
                for (let name in receipt.events) {
                    let events = (Array.isArray(receipt.events[name]) ? receipt.events[name] : [receipt.events[name]]);
                    events.forEach(event => {
                        if (topic0 == event.raw.topics[0] && (this.address && this.address == event.address)) {
                            result.push(this.wallet.decode(eventAbis[topic0], event, event.raw));
                        }
                    });
                }
            }
            else if (receipt.logs) {
                for (let i = 0; i < receipt.logs.length; i++) {
                    let log = receipt.logs[i];
                    if (topic0 == log.topics[0] && (this.address && this.address == log.address)) {
                        result.push(this.wallet.decode(eventAbis[topic0], log));
                    }
                }
            }
            return result;
        }
        get events() {
            let result = [];
            for (let i = 0; i < this._abi.length; i++) {
                if (this._abi[i].type == 'event')
                    result.push(this._abi[i]);
            }
            return result;
        }
        methodsToUtf8(...args) {
            let self = this;
            return new Promise(async function (resolve, reject) {
                let result = await self.methods.apply(self, args);
                resolve(self.wallet.utils.toUtf8(result));
            });
        }
        methodsToUtf8Array(...args) {
            let self = this;
            return new Promise(async function (resolve, reject) {
                let result = await self.methods.apply(self, args);
                let arr = [];
                for (let i = 0; i < result.length; i++) {
                    arr.push(self.wallet.utils.toUtf8(result[i]));
                }
                resolve(arr);
            });
        }
        methodsFromWeiArray(...args) {
            let self = this;
            return new Promise(async function (resolve, reject) {
                let result = await self.methods.apply(self, args);
                let arr = [];
                for (let i = 0; i < result.length; i++) {
                    arr.push(new bignumber_js_1.BigNumber(self.wallet.utils.fromWei(result[i])));
                }
                resolve(arr);
            });
        }
        methodsFromWei(...args) {
            let self = this;
            return new Promise(async function (resolve, reject) {
                let result = await self.methods.apply(self, args);
                return resolve(new bignumber_js_1.BigNumber(self.wallet.utils.fromWei(result)));
            });
        }
        methods(...args) {
            args.unshift(this._address);
            args.unshift(this._abi);            
            return this.wallet.methods.apply(this.wallet, args);
        }
        getAbiTopics(eventNames) {
            return this.wallet.getAbiTopics(this._abi, eventNames);
        }
        getAbiEvents() {
            if (!this._events)
                this._events = this.wallet.getAbiEvents(this._abi);
            return this._events;
        }
        scanEvents(fromBlock, toBlock, eventNames) {
            let topics = this.getAbiTopics(eventNames);
            let events = this.getAbiEvents();
            return this.wallet.scanEvents(fromBlock, toBlock, topics, events, this._address);
        }
        ;
        async _deploy(...args) {
            if (typeof (args[args.length - 1]) == 'undefined')
                args.pop();
            args.unshift(this._bytecode);
            args.unshift('deploy');
            args.unshift(null);
            args.unshift(this._abi);
            this._address = await this.wallet.methods.apply(this.wallet, args);
            return this._address;
        }
        ;
        get utils() {
            if (!this._utils)
                this._utils = new Utils(this.wallet);
            return this._utils;
        }
    }
    exports.Contract = Contract;
    ;
    class TAuthContract extends Contract {
        rely(address) {
            return this.methods('rely', address);
        }
        deny(address) {
            return this.methods('deny', address);
        }
    }
    exports.TAuthContract = TAuthContract;
    ;
});
