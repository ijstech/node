import Fs from 'fs';
import Path from 'path';
import Koa from 'koa';
import {VM} from '@ijstech/vm';
import * as Types from '@ijstech/types';

const RootPath = Path.dirname(require.main.filename);
let Modules = {};
let LoadingPackageName: string = '';
global.define = function(id: string, deps: string[], callback: Function){
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
    }    
    callback.apply(this, result);
    if (id == 'index')
        Modules[LoadingPackageName || 'index'] = exports
    else
        Modules[id] = exports
};
export function resolveFilePath(rootPaths: string[], filePath: string, allowsOutsideRootPath?: boolean): string{    
    let rootPath = Path.resolve(...rootPaths);    
    let result = Path.join(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    return result.startsWith(rootPath) ? result : undefined;
};
function getScript(filePath: string): Promise<string>{
    return new Promise((resolve)=>{
        if (filePath.startsWith('./'))
            filePath = resolveFilePath([RootPath], filePath);
        Fs.readFile(filePath, 'utf8', (err, result)=>{
            if (err)
                resolve('')
            else
                resolve(result);
        });
    });
};
async function getPackage(filePath: string): Promise<any>{
    let text = await getScript(filePath + '/package.json');
    if (text)
        return JSON.parse(text);
};
async function getPackageScript(filePath: string): Promise<string>{
    let result: string;
    if (filePath.startsWith('file:')){
        let packPath = resolveFilePath([RootPath], filePath.substring(5), true);
        let pack = await getPackage(packPath);
        if (pack){
            let libPath = resolveFilePath([packPath], pack.main);
            if (libPath)
                return await getScript(libPath);
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
export interface IWorkerPluginOptions extends Types.IPluginOptions{    
    processing?: boolean;
};
export interface IQueuePluginOptions extends IWorkerPluginOptions{
    queue: string;
};
export type IRouterPluginMethod = 'GET'|'POST'|'PUT'|'DELETE';
export interface IRouterPluginOptions extends Types.IPluginOptions {
    form?: {
        host: string,
        token: string,
        package?: string,
        mainForm?: string
    },
    github?: {
        org: string,
        repo: string,
        token: string
    },
    baseUrl: string|string[];
    methods: IRouterPluginMethod[];
};
interface ParsedUrlQuery {[key: string]: string | string[]};
export interface IRouterRequest{    
    method: string,
    hostname: string,
    path: string;
    url: string;    
    origUrl: string;    
    ip: string;
    query?: ParsedUrlQuery;
    params?: any;
    body?: any;
    type?: string;
    cookie: (name: string)=> string;
    header: (name: string)=> string;
};
function cloneObject(value: any): any{
    if (value)
        return JSON.parse(JSON.stringify(value))
    else
        return;
};
function RouterRequest(ctx: Koa.Context): IRouterRequest{
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
type ResponseType = 'application/json'|'image/gif'|'image/jpeg'|'image/png'|'image/svg+xml'|'text/plain'|'text/html';
export interface IRouterResponse{
    statusCode: number;
    cookie: (name:string, value:string, option: any)=>void;
    end: (value: any, contentType?: ResponseType)=>void;
    header: (name:string, value: string)=>void;
};
function RouterResponse(ctx: Koa.Context): IRouterResponse{
    return {
        statusCode: 200,
        cookie: function(name: string, value: string, option?: any){
            ctx.cookies.set(name, value, option)
        },
        end: function(value: any, contentType?: ResponseType){       
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
};
export interface ISession{
    params?: any;
    plugins: Types.IPlugins;
};
export declare abstract class IRouterPlugin extends IPlugin{
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;    
};
export declare abstract class IWorkerPlugin extends IPlugin{    
    init?: (params?: any)=>Promise<boolean>;        
    message?: (session: ISession, channel: string, msg: string)=>void;
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
    async init(): Promise<boolean>{
        await this.loadDependencies();        
        this.vm.injectGlobalScript(this.options.script);        
        return;
    };
    async loadDependencies(){
        if (this.options.dependencies){
            for (let packname in this.options.dependencies){
                let pack = this.options.dependencies[packname];                
                let script = await getPackageScript(pack);
                if (script)
                    this.vm.injectGlobalPackage(packname, script);
            };
        };
    };
};
class RouterPluginVM extends PluginVM implements IRouterPlugin{
    async init(): Promise<boolean>{
        await super.init();
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];            
            global.$$router = new module.default();
        `);
        this.vm.script = `
            try{
                await global.$$router.route(global.$$session, global.$$request, global.$$response);
                return true;
            }
            catch(err){
                return false;
            };
        `;
        return;
    };
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>{
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
    async init(): Promise<boolean>{
        await super.init();
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];            
            global.$$worker = new module.default();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$message){
                        global.$$worker.message(global.$$session, global.$$message.channel, global.$$message.msg);
                    }
                    else{
                        let result = await global.$$worker.process(global.$$session, global.$$data);                        
                        return result;
                    }
                }
                finally{
                    delete global.$$message;
                }
            }
            catch(err){
                return false;
            };
        `;
        return true;
    };
    async message(session: ISession, channel: string, msg: string){
        this.vm.injectGlobalValue('$$message', {channel, msg});
        this.vm.execute();
    };
    async process(session: ISession, data?: any): Promise<boolean>{
        if (data != null)
            this.vm.injectGlobalValue('$$data', data);
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
    public vm: VM;
    public data: any;

    constructor(options: Types.IPluginOptions){
        this.options = options;        
    };        
    async createPlugin(){
        if (!this.plugin){
            if (this.options.isolated === false)
                this.plugin = await this.createModule();            
            else{
                this.plugin = await this.createVM();            
                this.vm = this.plugin.vm;
            };
        };
    };
    createVM(): any{
        return;
    };    
    async createModule(): Promise<any>{        
        if (this.options.dependencies){
            for (let packname in this.options.dependencies){
                let pack = this.options.dependencies[packname];                
                let script = await getPackageScript(pack);
                if (script)
                    loadModule(script, packname)
            };
        };
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);
        let script = this.options.script;
        let module = loadModule(script);
        if (module){
            if (module.default)
                module = module.default;
            return new module(this.options);
        }         
    };
    get session(): ISession{        
        if (this._session)
            return this._session
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
    protected options: IRouterPluginOptions;    
    constructor(options: IRouterPluginOptions){
        console.dir(options)
        super(options);
    };
    async createVM(): Promise<RouterPluginVM>{
        super.createVM();
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);        
        let result = new RouterPluginVM(this.options);
        await result.init();
        return result;
    };
    async route(ctx: Koa.Context, baseUrl: string): Promise<boolean>{         
        ctx.origUrl = ctx.url;
        ctx.url = ctx.url.slice(this.options.baseUrl.length);        
        if (!ctx.url.startsWith('/'))
            ctx.url = '/' + ctx.url;
        let result: boolean;        
        await this.createPlugin();
        result = await this.plugin.route(this.session, RouterRequest(ctx), RouterResponse(ctx));
        return result;
    };
};
export class Worker extends Plugin{
    protected plugin: IWorkerPlugin;
    protected options: IWorkerPluginOptions;    
    constructor(options: IWorkerPluginOptions){
        super(options);
    };
    async createVM(): Promise<WorkerPluginVM>{
        super.createVM();
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);
        let result = new WorkerPluginVM(this.options);
        await result.init();
        return result;
    };
    async message(channel: string, msg: string){
        try{
            await this.createPlugin();
            this.plugin.message(this.session, channel, msg);
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