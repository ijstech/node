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
exports.VM = exports.DefaultLogging = exports.DefaultRamLimit = exports.DefaultTimeLimit = void 0;
const isolated_vm_1 = __importDefault(require("isolated-vm"));
const vmConsole_1 = __importDefault(require("./vmConsole"));
const vmGlobal_1 = __importDefault(require("./vmGlobal"));
const RootPath = process.cwd();
const EventEmitter = function () {
    return {
        events: {},
        emit(event, ...args) {
            (this.events[event] || []).forEach(function (cb) {
                try {
                    cb(...args);
                }
                catch (err) { }
            });
        },
        on(event, cb) {
            this.events[event] = this.events[event] || [];
            this.events[event].push(cb);
            return () => (this.events[event] = this.events[event].filter(e => e !== cb));
        }
    };
};
exports.DefaultTimeLimit = 0;
exports.DefaultRamLimit = 128;
exports.DefaultLogging = false;
class VM {
    constructor(options) {
        this.readyCallbacks = [];
        this.loadedPlugins = {};
        this.memoryLimit = options && options.memoryLimit != undefined ? options.memoryLimit : exports.DefaultRamLimit;
        this.timeLimit = options && options.timeLimit != undefined ? options.timeLimit : exports.DefaultTimeLimit;
        this.logging = options && options.logging != undefined ? options.logging : false;
        this.token = options && options.token ? options.token : '';
        this.events = EventEmitter();
        this.setupContext();
        if (options && options.script)
            this.script = options.script;
    }
    ;
    getCpuTime() {
        return this.cpuTime;
    }
    ;
    functionToReference(obj) {
        return new isolated_vm_1.default.Reference(function (...args) {
            return obj(...args);
        });
    }
    ;
    objectToReference(obj) {
        let result = {};
        for (let v in obj) {
            if (obj.hasOwnProperty(v)) {
                if (typeof obj[v] === 'function') {
                    result[v] = {
                        ref: this.functionToReference(obj[v]),
                        type: 'func',
                        async: true,
                        json: obj['$$' + v + '_json'] == true
                    };
                }
                else if (typeof obj[v] === 'object') {
                    result[v] = {
                        ref: this.objectToReference(obj[v]),
                        type: 'obj'
                    };
                }
                else {
                    result[v] = obj[v];
                }
                ;
            }
            ;
        }
        ;
        return new isolated_vm_1.default.Reference(result);
    }
    ;
    setupContext() {
        if (this.context)
            return;
        this.isolate = new isolated_vm_1.default.Isolate({ memoryLimit: this.memoryLimit });
        this.context = this.isolate.createContextSync();
        let jail = this.context.global;
        jail.setSync('_ivm', isolated_vm_1.default);
        jail.setSync('global', jail.derefInto());
        let script = this.isolate.compileScriptSync(`new ` + function () {
            let ivm = global._ivm;
            delete global._ivm;
            global._$$modules = {};
            global.define = function (id, deps, callback) {
                if (typeof (id) == 'function') {
                    callback = id;
                    global._$$modules[global['$$currPackName']] = callback();
                    global._$$currModule = global._$$modules[global['$$currPackName']];
                }
                else {
                    let result = [];
                    let exports = {};
                    for (let i = 0; i < deps.length; i++) {
                        let dep = deps[i];
                        if (dep == 'require')
                            result.push(null);
                        else if (dep == 'exports') {
                            result.push(exports);
                        }
                        else
                            result.push(global._$$modules[dep]);
                    }
                    if (callback)
                        callback.apply(this, result);
                    if (global['$$currPackName'] && (id == 'index' || id == 'plugin')) {
                        global._$$modules[global['$$currPackName']] = exports;
                        global._$$currModule = exports;
                    }
                    else {
                        global._$$modules[id] = exports;
                        global._$$currModule = exports;
                    }
                }
                ;
            };
            global.define.amd = true;
            function referenceFunction(obj) {
                return function (...args) {
                    let result = obj.ref.applySyncPromise(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto({ release: true })));
                    try {
                        if (typeof (result) == 'string' && result.startsWith('$$plugin_')) {
                            return global[result];
                        }
                        else if (typeof (result) == 'string' && obj.json) {
                            return JSON.parse(result);
                        }
                        else
                            return result;
                    }
                    catch (err) {
                        return result;
                    }
                };
            }
            ;
            function referenceToObject(obj) {
                if (obj.constructor.name === 'Reference') {
                    obj = obj.copySync();
                }
                ;
                let result = {};
                for (let v in obj) {
                    if (typeof (obj[v]) != 'undefined') {
                        if (obj[v].type === 'func') {
                            result[v] = referenceFunction(obj[v]);
                        }
                        else if (obj[v].type === 'obj') {
                            result[v] = referenceToObject(obj[v].ref);
                        }
                        else {
                            result[v] = obj[v];
                        }
                        ;
                    }
                    ;
                }
                ;
                return result;
            }
            ;
            global.referenceToObject = referenceToObject;
        });
        script.runSync(this.context);
        vmConsole_1.default(this);
        vmGlobal_1.default(this);
    }
    ;
    injectGlobalObject(name, obj, script) {
        this.context.global.setSync(name, this.objectToReference(obj));
        let s = this.isolate.compileScriptSync(`new function () {    
            global["${name}"] = referenceToObject(global["${name}"]);
            ${script || ''}
        }`);
        s.runSync(this.context);
    }
    ;
    injectGlobalValue(name, value, script) {
        if (typeof (value) == 'object')
            this.injectGlobalObject(name, value, script);
        else
            this.context.global.setSync(name, value);
    }
    ;
    injectGlobalFunction(funcName, func) {
        this.context.evalClosureSync(`
            global.${funcName} = async function(...args) {
              return $0.applySync(undefined, args, { arguments: { copy: true }, result: { copy: true, promise: true }});
            }
          `, [func], { arguments: { reference: true }, result: { copy: true, promise: true } });
    }
    ;
    injectGlobalPackage(packName, script) {
        let s = this.isolate.compileScriptSync(`new function () {    
            try{
                global.$$currPackName = "${packName}";
                ${script}
            }
            finally{
                delete global.$$currPackName;
            }
        }`);
        s.runSync(this.context);
    }
    ;
    injectGlobalScript(script) {
        this.isolate.compileScriptSync(script).runSync(this.context);
    }
    ;
    get script() {
        return this._script;
    }
    ;
    set script(value) {
        this._script = value;
        this.compileScript();
    }
    ;
    compileScript() {
        if (this._script)
            this.compiledScript = this.context.evalSync(`(async () =>{${this._script}})`, { reference: true, result: { promise: true } });
    }
    ;
    async getGlobalValue(name) {
        return this.context.global.getSync(name, { copy: true, promise: true });
    }
    ;
    emitEvent(event, data) {
        this.events.emit(event, data);
    }
    ;
    ready(callback) {
        if (this.executing || this.readyCallbacks.length > 0)
            this.readyCallbacks.push(callback);
        else
            callback();
    }
    ;
    async execute(params) {
        return new Promise(async (resolve, reject) => {
            this.ready(async () => {
                this.executing = true;
                let cpuStart = this.isolate.cpuTime;
                try {
                    if (params) {
                        for (let name in params)
                            this.injectGlobalValue(name, params[name]);
                    }
                    ;
                    if (!this.context)
                        this.setupContext();
                    if (this.timeLimit) {
                        clearTimeout(this.timeLimitTimer);
                        this.timeLimitTimer = setTimeout(() => {
                            this.emitEvent('timeout');
                            this.resetContext();
                        }, this.timeLimit);
                    }
                    let result;
                    try {
                        result = await this.compiledScript.apply(undefined, [], { reference: true, result: { copy: true, promise: true } });
                        this.cpuTime = Number(this.isolate.cpuTime - cpuStart);
                        clearTimeout(this.timeLimitTimer);
                        resolve(result);
                    }
                    catch (err) {
                        clearTimeout(this.timeLimitTimer);
                        this.emitEvent('error', err);
                        reject(err);
                    }
                }
                finally {
                    this.executing = false;
                }
                ;
                setTimeout(() => {
                    let readyCB = this.readyCallbacks.shift();
                    if (readyCB)
                        readyCB();
                }, 1);
            });
        });
    }
    ;
    async eval(script) {
        if (this.executing)
            return;
        if (!this.context)
            this.setupContext();
        this.executing = true;
        try {
            try {
                script = `(async () =>{${script}})`;
                this.events.emit('eval', script);
                let fn = await this.context.eval(script, { reference: true, result: { promise: true } });
                let result = await fn.apply(undefined, [], { reference: true, result: { promise: true } });
                this.cpuTime = (this.isolate.cpuTime[0] + this.isolate.cpuTime[1] / 1e9) * 1000;
                return result;
            }
            catch (err) {
                this.events.emit('error', err);
            }
        }
        finally {
            this.executing = false;
        }
        ;
    }
    ;
    on(event, cb) {
        return this.events.on(event, cb);
    }
    ;
    resetContext() {
        clearTimeout(this.timeLimitTimer);
        if (this.context) {
            this.cpuTime = (this.isolate.cpuTime[0] + this.isolate.cpuTime[1] / 1e9) * 1000;
            this.isolate.dispose();
            delete this.isolate;
            delete this.context;
            delete this.compiledScript;
            this.setupContext();
            this.compileScript();
        }
        ;
        this.emitEvent('reset');
    }
    ;
}
exports.VM = VM;
;
exports.default = VM;
