/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Ivm from 'isolated-vm';
import vmConsole from './vmConsole';
import vmGlobal from './vmGlobal';

const RootPath = process.cwd();
export interface IEventEmitter{
    events: any;
    emit: (event: string, ...args: any)=>void;
    on: (event: string, cb: any)=>void;
}
const EventEmitter = function(): IEventEmitter{
    return {
        events: {},
        emit(event: string, ...args: any) {
            (this.events[event] || []).forEach(function(cb){
                try{
                    cb(...args)
                }
                catch(err){}
            })
        },
        on(event: string, cb: any) {
            this.events[event] = this.events[event] || [];
            this.events[event].push(cb);
            return () =>
                (this.events[event] = this.events[event].filter(e => e !== cb))
        }
    }
}
export interface IVMOptions{
    memoryLimit?: number; 
    timeLimit?: number;
    logging?: boolean;
    token?: string;
    script?: string;
}
export type Events = 'reset'|'error'|'start'|'timeout'|'end'

export let DefaultTimeLimit = 0; //unlimited
export let DefaultRamLimit = 128;
export let DefaultLogging = false;

export interface ILoadedVM {
    [name: string]: boolean;
}
export class VM {
    public memoryLimit: number;
    public timeLimit: number;
    public logging: boolean;
    private isolate: Ivm.Isolate;
    private token: string;
    private events: IEventEmitter;
    private cpuTime: number;
    private context: Ivm.Context;
    private _script: string;
    private compiledScript: Ivm.Reference;// Ivm.Script;
    private timeLimitTimer: any;
    private executing: boolean;
    public loadedPlugins: ILoadedVM = {};

    constructor(options?: IVMOptions) {
        this.memoryLimit = options && options.memoryLimit != undefined? options.memoryLimit: DefaultRamLimit;        
        this.timeLimit = options && options.timeLimit != undefined? options.timeLimit: DefaultTimeLimit;
        this.logging = options && options.logging != undefined? options.logging: false;        
        this.token = options && options.token?options.token:'';
        this.events = EventEmitter();

        this.setupContext();         
        if (options && options.script)
            this.script = options.script;
    };
    getCpuTime(): number {
        if(this.isolate){
            return (this.isolate.cpuTime[0] + this.isolate.cpuTime[1] / 1e9) * 1000;
        }
        else{
            return this.cpuTime;
        };
    };
    functionToReference(obj: any){
        return new Ivm.Reference(function (...args) {
            return obj(...args);
        });
    };
    objectToReference(obj: any) {
        let result = {};
        for (let v in obj) {
            if(obj.hasOwnProperty(v)) {
                if(typeof obj[v] === 'function') {
                    result[v] = {
                        ref: this.functionToReference(obj[v]), 
                        type: 'func',
                        async: true //obj['$$' + v]?true:false
                    };
                }
                else if(typeof obj[v] === 'object'){
                    result[v] = {
                        ref: this.objectToReference(obj[v]), 
                        type: 'obj'};
                }
                else{
                    result[v] = obj[v];
                };
            };
        };
        return new Ivm.Reference(result);
    };
    private setupContext() {
        if (this.context)
            return;
        this.isolate = new Ivm.Isolate({memoryLimit: this.memoryLimit});        
        this.context = this.isolate.createContextSync();
        let jail = this.context.global;        
        jail.setSync('_ivm', Ivm);
        jail.setSync('global', jail.derefInto());
        
        let script = this.isolate.compileScriptSync(`new ` + <any>function () {
            let ivm = global._ivm;            
            delete global._ivm;        
            global._$$modules = {};            
            global.define = function(id, deps, callback){      
                if (typeof(id) == 'function'){
                    callback = id;
                    global._$$modules[global['$$currPackName']] = callback();
                    global._$$currModule = global._$$modules[global['$$currPackName']];
                }
                else{
                    let result = [];
                    let exports = {};
                    for (let i = 0; i < deps.length; i ++){
                        let dep = deps[i];
                        if (dep == 'require')
                            result.push(null)
                        else if (dep == 'exports'){
                            result.push(exports);
                        }
                        else
                            result.push(global._$$modules[dep])
                    }   
                    if (callback) 
                        callback.apply(this, result)
                    if (global['$$currPackName'] && (id == 'index' || id == 'plugin')){
                        global._$$modules[global['$$currPackName']] = exports;    
                        global._$$currModule = exports;
                    }
                    else{
                        global._$$modules[id] = exports;
                        global._$$currModule = exports;
                    }
                };
            };   
            global.define.amd = true;         
            function referenceFunction(obj){
                return function(...args){
                    // if (obj.async){                        
                        let result = obj.ref.applySyncPromise(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto({release: true})));
                        try{
                            if (typeof(result) == 'string' && result.startsWith('$$plugin_')){                                
                                return global[result];
                            }
                            // else if (typeof(result) == 'string' && ['{', '['].indexOf(result[0]) > -1 && ['}', ']'].indexOf(result.slice(-1)) > -1){
                            //     return JSON.parse(result)
                            // }
                            else
                                return result
                        }
                        catch(err){
                            return result
                        }
                    // }
                    // else{     
                    //     return obj.ref.applySync(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
                    // };
                };
            };
            function referenceToObject(obj) {                
                if(obj.constructor.name === 'Reference') {
                    obj = obj.copySync();
                };
                let result = {};
                for (let v in obj) {
                    if(typeof(obj[v]) != 'undefined') {
                        if(obj[v].type === 'func') {
                            result[v] = referenceFunction(obj[v]);
                        } 
                        else if(obj[v].type === 'obj'){
                            result[v] = referenceToObject(obj[v].ref);
                        }
                        else{
                            result[v] = obj[v];
                        };
                    };
                };
                return result;
            };                         
            global.referenceToObject = referenceToObject;            
        })        
        script.runSync(this.context);    
        vmConsole(this);
        vmGlobal(this);
    };
    injectGlobalObject(name:string, obj: any, script?: string){        
        this.context.global.setSync(name, this.objectToReference(obj));
        let s = this.isolate.compileScriptSync(`new function () {    
            global["${name}"] = referenceToObject(global["${name}"]);
            ${script || ''}
        }`);
        s.runSync(this.context);
    };    
    injectGlobalValue(name:string, value: any, script?: string){
        if (typeof(value) == 'object')
            this.injectGlobalObject(name, value, script)
        else
            this.context.global.setSync(name, value);    
    };    
    injectGlobalFunction(funcName: string, func: any){
        this.context.evalClosureSync(`
            global.${funcName} = async function(...args) {
              return $0.applySync(undefined, args, { arguments: { copy: true }, result: { copy: true, promise: true }});
            }
          `,
            [func],            
            { arguments: { reference: true }, result: { copy: true, promise: true } }            
        );
    };
    injectGlobalPackage(packName: string, script: string){
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
    };
    injectGlobalScript(script: string) {        
        this.isolate.compileScriptSync(script).runSync(this.context);
    };    
    get script(): string{
        return this._script;
    };
    set script(value: string){
        this._script = value;
        this.compileScript();
    };
    private compileScript(){
        if (this._script)      
            this.compiledScript = this.context.evalSync(`(async () =>{${this._script}})`, { reference: true, result: { promise: true } });        
    };
    async getGlobalValue(name: string): Promise<any>{
        return this.context.global.getSync(name, {copy: true, promise: true});        
    };    
    private emitEvent(event: Events, data?: any){
        this.events.emit(event, data);
    };
    async execute() {        
        if (this.executing)
            return;

        if (!this.context)
            this.setupContext();
        this.executing = true;
        try{
            if (this.timeLimit){
                clearTimeout(this.timeLimitTimer);
                this.timeLimitTimer = setTimeout(()=>{
                    this.emitEvent('timeout')
                    this.resetContext();                    
                }, this.timeLimit);
            }
            let result: any;
            try{
                result = await this.compiledScript.apply(undefined, [], {reference: true, result: {copy: true, promise: true } });
                this.cpuTime = (this.isolate.cpuTime[0] + this.isolate.cpuTime[1] / 1e9) * 1000;
                clearTimeout(this.timeLimitTimer);
            }
            catch(err){                       
                clearTimeout(this.timeLimitTimer);
                this.emitEvent('error', err);
            }
            return result;
        }
        finally{
            this.executing = false;
        }
    };
    async eval(script: string){   
        if (this.executing)
            return;
            
        if (!this.context) 
            this.setupContext();
        this.executing = true;
        try{
            try{            
                script = `(async () =>{${script}})`;
                this.events.emit('eval', script);
                let fn = await this.context.eval(script, { reference: true, result: { promise: true } });
                let result = await fn.apply(undefined, [], {reference: true, result: { promise: true } });
                this.cpuTime = (this.isolate.cpuTime[0] + this.isolate.cpuTime[1] / 1e9) * 1000;
                return result;
            }
            catch(err){
                this.events.emit('error', err);
            }
        }
        finally{
            this.executing = false;
        };
    };
    on(event: Events, cb: any){
        return this.events.on(event, cb);
    };
    resetContext() {        
        clearTimeout(this.timeLimitTimer);
        if (this.context){
            this.cpuTime = (this.isolate.cpuTime[0] + this.isolate.cpuTime[1] / 1e9) * 1000;
            this.isolate.dispose();
            delete this.isolate;            
            delete this.context;
            delete this.compiledScript;
            
            this.setupContext();
            this.compileScript();
        };
        this.emitEvent('reset');
    };
};
export default VM;