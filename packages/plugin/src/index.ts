import Fs from 'fs';
import Path from 'path';
import Koa from 'koa';
import {VM} from '@ijstech/vm';
import * as Types from '@ijstech/types';

const RootPath = Path.dirname(require.main.filename);
let plugins = {};
global.define = function(id: string, deps: string[], callback: Function){      
    let result = [];
    for (let i = 0; i < deps.length; i ++){
        let dep = deps[i];
        if (dep == 'require')
            result.push(null)
        else if (dep == 'exports'){
            if (id){
                plugins[id] = {};
                result.push(plugins[id])
            }
            else
                result.push({})
        }
        else
            result.push(plugins[dep])
    }    
    let module = callback.apply(this, result)
    if (module)
        plugins[id] = module;
};
export function resolveFilePath(rootPaths: string[], filePath: string): string{    
    let rootPath = Path.resolve(...rootPaths);    
    let result = Path.join(rootPath, filePath);
    return result.startsWith(rootPath) ? result : undefined;
};
export function getScript(filePath: string): Promise<string>{
    return new Promise((resolve, reject)=>{
        if (filePath.startsWith('./'))
            filePath = resolveFilePath([RootPath], filePath);
        Fs.readFile(filePath, 'utf8', (err, result)=>{
            if (err)
                reject(err)
            else
                resolve(result)
        })
    })
};
export type IPluginScript = any;
export function loadScript(script: string): IPluginScript{    
    plugins = {};
    var m = new (<any>module).constructor();
    m._compile(script, 'index');
    return plugins['index'];
};
export type IPackageVersion = string;
export interface IDependencies {
    [packageName: string]: IPackageVersion;
};
export interface IPluginOptions {
    memoryLimit?: number;
    timeLimit?: number;
    isolated?: boolean;    
    script?: string;
    scriptPath?: string;
    params?: any;
    dependencies?: IDependencies;    
    plugins?: Types.IRequiredPlugins;
};
export interface IWorkerPluginOptions extends IPluginOptions{    
    processing?: boolean;
};
export interface IQueuePluginOptions extends IWorkerPluginOptions{
    queue: string;
};
export type IRouterPluginMethod = 'GET'|'POST'|'PUT'|'DELETE';
export interface IRouterPluginOptions extends IPluginOptions {
    baseUrl: string;
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
    init?: (params: any)=>Promise<void>;        
    message?: (session: ISession, channel: string, msg: string)=>void;
    process(session: ISession, data: any): Promise<any>;
};
class RouterPluginVM implements IRouterPlugin{
    private options: IPluginOptions;
    public vm: VM;        
    constructor(options: IPluginOptions){
        this.options = options;
        this.vm = new VM({
            logging: true,
            memoryLimit: options.memoryLimit,
            timeLimit: options.timeLimit
        });
        this.vm.injectGlobalScript(options.script);        
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
class WorkerPluginVM implements IWorkerPlugin{
    private options: IPluginOptions;
    public vm: VM;    
    constructor(options: IPluginOptions){      
        this.options = options;
        this.vm = new VM({
            logging: true,
            memoryLimit: options.memoryLimit,
            timeLimit: options.timeLimit
        });
        this.vm.injectGlobalScript(options.script);        
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
function Session(options: IPluginOptions): ISession{
    return {
        params: options.params,
        plugins: {}
    };
};
class Plugin{
    protected options: IPluginOptions;
    protected plugin: any;
    protected _session: ISession;

    constructor(options: IPluginOptions){
        this.options = options;        
    };        
    async createPlugin(){
        if (!this.plugin){
            if (this.options.isolated === false)
                this.plugin = await this.createModule();            
            else
                this.plugin = await this.createVM();            
        }
    };
    createVM(): any{
        return;
    };    
    async createModule(): Promise<any>{        
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);
        let script = this.options.script;
        let module = loadScript(script);
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
        this._session = result;
        if (this.options.plugins){
            for (let v in this.options.plugins){                
                try{
                    let m = require('@ijstech/' + v);
                    let plugin = m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                    if (plugin)
                        result.plugins[v] = plugin;
                }
                catch(err){
                    console.dir(err);
                };
            };
        };
        if (this.plugin.vm)
            this.plugin.vm.injectGlobalValue('$$session', result);
        return result;
    };
};
export class Router extends Plugin{    
    protected plugin: IRouterPlugin;
    protected options: IRouterPluginOptions;    
    constructor(options: IRouterPluginOptions){
        super(options);
    };
    async createVM(): Promise<RouterPluginVM>{
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);        
        return new RouterPluginVM(this.options);
    };
    async route(ctx: Koa.Context): Promise<boolean>{         
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
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);
        return new WorkerPluginVM(this.options);
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
export default {
    getScript,
    loadScript,
    resolveFilePath 
};