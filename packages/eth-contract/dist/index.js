/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
///<amd-module name="@ijstech/eth-contract"/>
define("@ijstech/eth-contract", ["require", "exports", "bignumber.js"], function (require, exports, bignumber_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TAuthContract = exports.Contract = exports.nullAddress = exports.BigNumber = void 0;
    Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return bignumber_js_1.BigNumber; } });
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    exports.nullAddress = "0x0000000000000000000000000000000000000000";
    ;
    ;
    class Contract {
        constructor(wallet, address, abi, bytecode) {
            this.wallet = wallet;
            if (abi)
                this.abiHash = this.wallet.registerAbi(abi);
            if (typeof (abi) == 'string')
                this._abi = JSON.parse(abi);
            else
                this._abi = abi;
            this._bytecode = bytecode;
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
        getAbiEvents() {
            if (!this._events) {
                this._events = {};
                let events = this._abi.filter(e => e.type == "event");
                for (let i = 0; i < events.length; i++) {
                    let topic = this.wallet.utils.sha3(events[i].name + "(" + events[i].inputs.map(e => e.type == "tuple" ? "(" + (e.components.map(f => f.type)) + ")" : e.type).join(",") + ")");
                    this._events[topic] = events[i];
                }
            }
            return this._events;
        }
        getAbiTopics(eventNames) {
            if (!eventNames || eventNames.length == 0)
                eventNames = null;
            let result = [];
            let events = this.getAbiEvents();
            for (let topic in events) {
                if (!eventNames || eventNames.includes(events[topic].name)) {
                    result.push(topic);
                }
            }
            if (result.length == 0 && eventNames && eventNames.length > 0)
                return ['NULL'];
            return [result];
        }
        // registerEvents(handler: any) {
        //     if (this._address)
        //         this.wallet.registerEvent(this.getAbiEvents(), this._address, handler);
        // }
        scanEvents(fromBlock, toBlock, eventNames) {
            if (typeof (fromBlock) == 'number') {
                let topics = this.getAbiTopics(eventNames);
                let events = this.getAbiEvents();
                return this.wallet.scanEvents(fromBlock, toBlock, topics, events, this._address);
            }
            else {
                let params = fromBlock;
                let topics = this.getAbiTopics(params.eventNames);
                let events = this.getAbiEvents();
                return this.wallet.scanEvents(params.fromBlock, params.toBlock, topics, events, this._address);
            }
            ;
        }
        ;
        async batchCall(batchObj, key, methodName, params, options) {
            //TODO: implement the batch call
            // let contract = await this.getContract();
            // if (!contract.methods[methodName]) return;
            // let method = <IContractMethod>contract.methods[methodName].apply(this, params);
            // batchObj.promises.push(new Promise((resolve, reject) => {
            //     batchObj.batch.add(method.call.request({from: this.wallet.address, ...options}, 
            //         (e,v) => {
            //             return resolve({
            //                 key:key, 
            //                 result:e ? null : v
            //             });
            //         }
            //     ));
            // }));
        }
        async txData(methodName, params, options) {
            return await this.wallet._txData(this.abiHash, this._address, methodName, params, options);
        }
        async call(methodName, params, options) {
            return await this.wallet._call(this.abiHash, this._address, methodName, params, options);
        }
        async _send(methodName, params, options) {
            params = params || [];
            if (!methodName)
                params.unshift(this._bytecode);
            return await this.wallet._send(this.abiHash, this._address, methodName, params, options);
        }
        async __deploy(params, options) {
            let receipt = await this._send('', params, options);
            this.address = receipt.contractAddress;
            return this.address;
        }
        send(methodName, params, options) {
            let receipt = this._send(methodName, params, options);
            return receipt;
        }
        // backward compatability
        _deploy(...params) {
            return this.__deploy(params);
        }
        async methods(methodName, ...params) {
            let method = this._abi.find(e => e.name == methodName);
            if (method.stateMutability == "view" || method.stateMutability == "pure") {
                return await this.call(methodName, params);
            }
            else if (method.stateMutability == 'payable') {
                let value = params.pop();
                return await this.call(methodName, params, { value: value });
            }
            else {
                return await this.send(methodName, params);
            }
        }
    }
    exports.Contract = Contract;
    ;
    class TAuthContract extends Contract {
        async rely(address) {
            return await this.methods('rely', address);
        }
        ;
        async deny(address) {
            return await this.methods('deny', address);
        }
        ;
    }
    exports.TAuthContract = TAuthContract;
    ;
});
