/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Fs from 'fs';
import Path from 'path';
import Koa from 'koa';
import {VM} from '@ijstech/vm';
import * as Types from '@ijstech/types';
export {BigNumber, IRouterRequest, IRouterResponse, IWorkerPluginOptions, IRouterPluginOptions} from '@ijstech/types';
import Github from './github';
import {PluginCompiler, PluginScript} from '@ijstech/tsc';

const RootPath = Path.dirname(require.main.filename);
let Modules = {};
let LoadingPackageName: string = '';
global.define = function(id: string, deps: string[], callback: Function){
    if (typeof (id) == 'function') {
        callback = id;
        Modules[LoadingPackageName] = callback();
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
            else{
                result.push(Modules[dep]);
            }
        };
        if (callback)
            callback.apply(this, result);
        if (id == 'index' || id == 'plugin')
            Modules[LoadingPackageName || 'index'] = exports
        else
            Modules[id] = exports;
    };
};
// global.define.amd = true;

export function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string{    
    let rootPath = Path.resolve(...rootPaths);    
    let result = Path.join(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    return result.startsWith(rootPath) ? result : undefined;
};
function getScript(filePath: string): Promise<string>{
    return new Promise(async (resolve)=>{
        try{
            if (!filePath.startsWith('/'))
                filePath = resolveFilePath([RootPath], filePath, true);
            let isDir = (await Fs.promises.lstat(filePath)).isDirectory();
            if (isDir){
                let pack = await getPackage(filePath);
                if (pack.directories && pack.directories.bin){
                    let compiler = new PluginCompiler();
                    compiler.addDirectory(resolveFilePath([filePath], pack.directories.bin))
                    let result = await compiler.compile();
                    return resolve(result.script)
                }
                resolve('');
            }
            else{
                Fs.readFile(filePath, 'utf8', (err, result)=>{
                    if (err)
                        resolve('')
                    else
                        resolve(result);
                });
            }
        }
        catch(err){
            resolve('')
        }
    });
};
async function getPackage(filePath: string): Promise<any>{
    try{
        let text = await getScript(filePath + '/package.json');
        if (text)
            return JSON.parse(text);
    }
    catch(err){
        return {};
    }
};
function getPackageDir(pack: string): string{
    if (pack[0] != '/')
    pack = require.resolve(pack);
    let dir = Path.dirname(pack);
    if (Fs.existsSync(Path.resolve(dir, 'package.json')))
        return dir
    else
        return getPackageDir(dir);
};
export async function getPackageScript(packName: string, pack?: Types.IPackageScript): Promise<string>{
    let result: string;
    let packPath = '';
    if (!pack){
        pack = {};
        if (packName.startsWith('@ijstech/')){
            packName = packName.slice(9)
            packPath = resolveFilePath([__dirname, '../..'], packName, true);
        };
        if (!packPath)
            packPath = getPackageDir(packName);
    }
    else if (pack){
        if (pack.script && pack.script.startsWith('file:'))
            packPath = resolveFilePath([RootPath], pack.script.substring(5), true)
        else if (pack.script)
            return pack.script
        else
            packPath = getPackageDir(packName);
    };
    if (packPath){
        let p = await getPackage(packPath);
        if (p){
            let libPath = resolveFilePath([packPath], p.plugin || p.browser || p.main || 'index.js');
            if (libPath){
                let script = await getScript(libPath);
                pack.script = script;
                return script;
            }
        };
    };  
};
export type IPluginScript = any;
export function loadModule(script: string, name?: string): IPluginScript{
    LoadingPackageName = name;
    var m = new (<any>module).constructor();
    m.filename = name;
    m._compile(script, name || 'index');
    LoadingPackageName = '';
    return Modules[name || 'index'];
};
function cloneObject(value: any): any{
    if (value)
        return JSON.parse(JSON.stringify(value))
    else
        return;
};
function RouterRequest(ctx: Koa.Context): Types.IRouterRequest{
    return {
        method: ctx.method,
        hostname: ctx.hostname || '',
        path: ctx.path || '',
        url: ctx.url || '',
        origUrl: ctx.origUrl || '',
        ip: ctx.ip || '',
        type: ctx.request.type,
        query: cloneObject(ctx.request.query),
        params: cloneObject(ctx.params),
        body: cloneObject((<any>ctx.request).body),
        cookie: function(name: string){
            return ctx.cookies.get(name);
        },
        header: function(name: string){
            return ctx.get(name);
        }
    };
};

function RouterResponse(ctx: Koa.Context): Types.IRouterResponse{
    return {
        statusCode: 200,
        cookie: function(name: string, value: string, option?: any){
            ctx.cookies.set(name, value, option)
        },
        end: function(value: any, contentType?: Types.ResponseType){       
            if (!contentType && typeof(value) == 'object')
                contentType = 'application/json';
            ctx.response.set('Content-Type', contentType || 'text/plain');
            ctx.body = value;
        },
        header: function(name: string, value: any){
            ctx.set(name, value);
        }
    };
};
export type QueueName = string;
export interface IRequiredPlugins{
    queue?: QueueName[];
    cache?: boolean;
    db?: boolean;
};
export declare abstract class IPlugin {    
    init?(session: ISession, params?: any):Promise<void>;
};
export interface ISession{
    params?: any;
    plugins: Types.IPlugins;
};
export declare abstract class IRouterPlugin extends IPlugin{
    route(session: ISession, request: Types.IRouterRequest, response: Types.IRouterResponse): Promise<boolean>;    
};
export declare abstract class IWorkerPlugin extends IPlugin{    
    process(session: ISession, data: any): Promise<any>;
};
class PluginVM{
    protected options: Types.IPluginOptions;
    public vm: VM;        
    constructor(options: Types.IPluginOptions){
        this.options = options;        
        this.vm = new VM({
            logging: true,
            memoryLimit: options.memoryLimit,
            timeLimit: options.timeLimit
        });
    };
    async setup(): Promise<boolean>{
        await this.loadDependencies();        
        this.vm.injectGlobalScript(this.options.script);        
        return;
    };
    private async loadPackage(name: string, pack?: Types.IPackageScript){
        let script = await getPackageScript(name, pack);
        if (script)
            this.vm.injectGlobalPackage(name, script);
    }
    async loadDependencies(){
        if (this.options.plugins && this.options.plugins.db)
            await this.loadPackage('@ijstech/pdm');
        if (this.options.plugins && this.options.plugins.wallet){
            await this.loadPackage('bignumber.js');
            await this.loadPackage('@ijstech/wallet');
            await this.loadPackage('@ijstech/eth-contract');
        };         
        if (this.options.dependencies){
            for (let packname in this.options.dependencies){
                let pack = this.options.dependencies[packname];
                await this.loadPackage(packname, pack);
            };
        };
    };
};
class RouterPluginVM extends PluginVM implements IRouterPlugin{
    async setup(): Promise<boolean>{        
        await super.setup();
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];   
            let fn = module.default['router'] || module.default;
            global.$$router = new fn();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$init){
                        if (global.$$router.init){
                            let data = global.$$data;
                            if (data)
                                data = JSON.parse(data);
                            try{
                                global.$$router.init(global.$$session, data);
                            }
                            catch(err){}
                        }
                    }
                    else{
                        await global.$$router.route(global.$$session, global.$$request, global.$$response);
                        return true;
                    }
                }
                finally{
                    delete global.$$data;
                    delete global.$$init;
                }
            }
            catch(err){
                return false;
            };
        `;
        return;
    };
    async init(session: ISession, params?: any): Promise<void>{
        this.vm.injectGlobalValue('$$init', true);
        if (params != null)
            this.vm.injectGlobalValue('$$data', JSON.stringify(params));
        await this.vm.execute();
    };
    async route(session: ISession, request: Types.IRouterRequest, response: Types.IRouterResponse): Promise<boolean>{
        this.vm.injectGlobalValue('$$request', request);
        this.vm.injectGlobalValue('$$response', response);
        let result = await this.vm.execute();
        if (result !== true){
            response.statusCode = 500
            response.end('');
        };
        return true;
    };
};
class WorkerPluginVM extends PluginVM implements IWorkerPlugin{
    async setup(): Promise<boolean>{
        await super.setup();
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];            
            let fn = module.default['worker'] || module.default;
            global.$$worker = new fn();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$init){
                        if (global.$$worker.init){
                            let data = global.$$data;
                            if (data)
                                data = JSON.parse(data);
                            try{
                                global.$$worker.init(global.$$session, data);
                            }
                            catch(err){}
                        }
                    }
                    else{
                        let data = global.$$data;
                        if (data)
                            data = JSON.parse(data);
                        let result = await global.$$worker.process(global.$$session, data);                        
                        return result;
                    }
                }
                finally{
                    delete global.$$init;
                    delete global.$$data;
                }
            }
            catch(err){
                return false;
            };
        `;
        return true;
    };
    async init(session: ISession, params?: any): Promise<void>{
        this.vm.injectGlobalValue('$$init', true);
        if (params != null)
            this.vm.injectGlobalValue('$$data', JSON.stringify(params));
        await this.vm.execute();
    };
    async message(session: ISession, channel: string, msg: string){
        this.vm.injectGlobalValue('$$data', JSON.stringify({channel, msg}));
        let result = await this.vm.execute();
        return result;
        // this.vm.injectGlobalValue('$$message', {channel, msg});
        // this.vm.execute();
    };
    async process(session: ISession, data?: any): Promise<boolean>{
        if (data != null)
            this.vm.injectGlobalValue('$$data', JSON.stringify(data));
        let result = await this.vm.execute();
        return result;
    };
};
function Session(options: Types.IPluginOptions): ISession{
    return {
        params: options.params,
        plugins: {}
    };
};
class Plugin{
    protected options: Types.IPluginOptions;
    protected plugin: any;
    protected _session: ISession;
    protected pluginType: string;
    public vm: VM;
    public data: any;

    constructor(options: Types.IPluginOptions){
        this.options = options;   
    };
    async addPackage(packName: string, script?: string){
        await this.createPlugin();
        if (!script){
            script = await getPackageScript(packName); 
        }
        loadModule(script, packName);
    }
    async createPlugin(){        
        if (!this.plugin){
            if (!this.options.script && this.options.scriptPath){
                if (this.options.github){
                    this.options.script = await Github.getFile({
                        org: this.options.github.org,
                        repo: this.options.github.repo,
                        token: this.options.github.token,
                        filePath: 'lib/index.js'
                    })                
                }
                else if (this.options.scriptPath.endsWith('.js'))
                    this.options.script = await getScript(this.options.scriptPath);
                else
                    this.options.script = await PluginScript(this.options);
            }
            if (this.options.isolated === false)
                this.plugin = await this.createModule();            
            else{
                this.plugin = await this.createVM();            
                this.vm = this.plugin.vm;
            };

            for (let v in this.options.plugins){  
                if (v == 'db'){
                    let m = require('@ijstech/pdm');
                    m.loadPlugin(this, this.options.plugins.db);                    
                    break;
                };
            };
            for (let v in this.options.dependencies) {                
                if (['@ijstech/crypto'].indexOf(v) > -1){
                    let m = require(v);
                    m.loadPlugin(this);
                }
            };
        };
    };
    createVM(): any{
        return;
    };    
    async createModule(): Promise<any>{
        for (let v in this.options.plugins){  
            if (v == 'db'){
                let script = await getPackageScript('@ijstech/pdm');
                if (script)
                    loadModule(script, '@ijstech/pdm');
                break;
            };
        };
        if (this.options.dependencies){
            for (let packname in this.options.dependencies){
                let pack = this.options.dependencies[packname];
                let script = await getPackageScript(packname, pack);
                if (script)
                    loadModule(script, packname)
            };
        };
        let script = this.options.script;        
        if (script){
            let module = loadModule(script);
            if (module){
                if (module.default)
                    module = module.default[this.pluginType] || module.default;
                return new module(this.options);
            };   
        };
    };
    async init(params?: any){
        try{
            await this.createPlugin();
            await this.plugin.init(this.session, params);
        }
        catch(err){
            console.dir(err)
        }
    };
    get session(): ISession{        
        if (this._session)
            return this._session;
        let result = Session(this.options);  
        let script = '';      
        this._session = result;
        if (this.options.plugins){
            for (let v in this.options.plugins){                
                try{
                    let m = require('@ijstech/' + v);
                    let plugin = m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                    if (typeof(plugin) == 'string')
                        script += plugin
                    else if (plugin)
                        result.plugins[v] = plugin;
                    if (v == 'db'){
                        let m = require('@ijstech/pdm');
                        let plugin = m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                        if (typeof(plugin) == 'string')
                            script += plugin;
                    };
                }
                catch(err){
                    console.dir(err);
                };
            };
        };
        if (this.plugin.vm)
            this.plugin.vm.injectGlobalValue('$$session', result, script);
        return result;
    };
};
export class Router extends Plugin{    
    protected plugin: IRouterPlugin;
    protected options: Types.IRouterPluginOptions;    
    constructor(options: Types.IRouterPluginOptions){
        super(options);
        this.pluginType = 'worker';
    };
    async createVM(): Promise<RouterPluginVM>{        
        super.createVM();
        let result = new RouterPluginVM(this.options);
        await result.setup();
        return result;
    };
    async route(ctx: Koa.Context, baseUrl: string): Promise<boolean>{
        ctx.origUrl = ctx.url;
        ctx.url = ctx.url.slice(this.options.baseUrl.length);        
        if (!ctx.url.startsWith('/'))
            ctx.url = '/' + ctx.url;
        let result: boolean;
        await this.createPlugin();
        if (this.plugin){
            result = await this.plugin.route(this.session, RouterRequest(ctx), RouterResponse(ctx));
            return result;
        }
    };
};
export class Worker extends Plugin{
    protected plugin: IWorkerPlugin;
    protected options: Types.IWorkerPluginOptions;    
    constructor(options: Types.IWorkerPluginOptions){
        super(options);
        this.pluginType = 'worker';
    };
    async createVM(): Promise<WorkerPluginVM>{
        super.createVM();
        let result = new WorkerPluginVM(this.options);
        await result.setup();
        return result;
    };
    async message(channel: string, msg: string){
        try{
            await this.createPlugin();
            await this.plugin.process(this.session, {channel, msg});
        }
        catch(err){
            console.dir(err)
        }
    }
    async process(data?: any): Promise<any>{
        let result: any;
        this.options.processing = true;
        try{            
            await this.createPlugin();            
            result = await this.plugin.process(this.session, data);
        }
        catch(err){
            console.dir(err)
        }
        finally{
            this.options.processing = false;
        };
        return result;
    };
};