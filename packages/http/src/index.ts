/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Fs from 'fs';
import Tls from 'tls';
import Path from 'path';
import Http from 'http';
import Https from 'https';
import Templates from './templates/404';
import {IRouterPluginOptions, Router, RouterRequest} from '@ijstech/plugin';
import {PackageManager, IDomainRouterPackage} from '@ijstech/package';
import { IRouterPluginMethod, IJobQueueConnectionOptions } from '@ijstech/types';
import {getJobQueue, JobQueue} from '@ijstech/queue';
import {IStorageOptions} from '@ijstech/storage';

const RootPath = process.cwd();

export interface IPlugin{
    scriptPath?: string;
    baseUrl?: string;
};
export interface IPlugins{
    [name: string]: IPlugin;
};
export interface IRouterOptions {    
    module?: string;
    routes?: IRouterPluginOptions[];
};
export interface IWorkerOptions{
    enabled: boolean;
    jobQueue: string;
    connection: IJobQueueConnectionOptions
}
export interface IHttpServerOptions{    
    certPath?: string;
    ciphers?: string;
    cors?: boolean;
    port?: number;
    router?: IRouterOptions;
    securePort?: number;    
    worker?: IWorkerOptions;
    storage?: IStorageOptions;
    domains?: {[domainName: string]: IDomainRouterPackage[]};
    packageManager?: PackageManager;
};
export class HttpServer {
    private app: Koa;
    private options: IHttpServerOptions;
    private ciphers: string;
    private ssl: any = {};
    private running: boolean;
    private http: Http.Server;
    private https: Https.Server;
    private withDefaultMiddleware: boolean;    
    private packageManager: PackageManager;
    private queue: JobQueue;

    constructor(options: IHttpServerOptions){
        this.options = options; 
        this.packageManager = this.options.packageManager;
        if (this.options.worker)
            this.queue = getJobQueue(this.options.worker);
        if (this.options.domains){
            for (let domain in this.options.domains){
                let packages = this.options.domains[domain];
                for (let i = 0; i < packages.length; i ++)
                    this.addDomainRouter(domain, packages[i]);
            };
        };
        if (this.options.port || this.options.securePort){
            this.app = new Koa();
            this.app.use(BodyParser());        
            this.ciphers = options.ciphers || [
                "ECDHE-RSA-AES256-SHA384",
                "DHE-RSA-AES256-SHA384",
                "ECDHE-RSA-AES256-SHA256",
                "DHE-RSA-AES256-SHA256",
                "ECDHE-RSA-AES128-SHA256",
                "DHE-RSA-AES128-SHA256",
                "HIGH",
                "!aNULL",
                "!eNULL",
                "!EXPORT",
                "!DES",
                "!RC4",
                "!MD5",
                "!PSK",
                "!SRP",
                "!CAMELLIA"
            ].join(':'); 
        };
    };    
    async addDomainRouter(domain: string, router: IDomainRouterPackage){
        if (!this.packageManager)
            this.packageManager = new PackageManager({
                storage: this.options.storage
            });
        this.packageManager.addDomainRouter(domain, router);
    };
    getCert(domain: string): Promise<Tls.SecureContext>{            
        let self = this;
        let SSL = this.ssl;        
        if (SSL[domain])
            return SSL[domain];
        return new Promise(async function(resolve){            
            var certPath = self.options.certPath || './certs';
            try{                
                if (Fs.existsSync(Path.resolve(RootPath, certPath, domain, 'privkey.pem'))){                    
                    var crt = Tls.createSecureContext({
                        ciphers: self.ciphers,                        
                        honorCipherOrder: true,
                        key:  Fs.readFileSync(Path.resolve(RootPath, certPath, domain, 'privkey.pem')),
                        cert: Fs.readFileSync(Path.resolve(RootPath, certPath, domain, 'fullchain.pem'))
                    })	
                    SSL[domain] = crt;                    
                    resolve(crt);
                }
                else if (Fs.existsSync(Path.resolve(RootPath, certPath, domain, 'ca_bundle.crt'))){                    
                    var crt = Tls.createSecureContext({
                        ciphers: self.ciphers,
                        honorCipherOrder: true,
                        key:  Fs.readFileSync(Path.resolve(RootPath, certPath, domain, 'private.key')),
                        cert: Fs.readFileSync(Path.resolve(RootPath, certPath, domain, 'ca_bundle.crt'))
                    })	
                    SSL[domain] = crt;                    
                    resolve(crt);
                }
                else{                    
                    var items = domain.split('.');
                    if (items.length > 2 && items.length < 20){
                        items.shift();                    
                        domain = items.join('.');         
                        let crt = await self.getCert(domain);
                        if (crt)
                            SSL[domain] = crt;                        
                        resolve(crt);
                    }
                    else{                        
                        resolve(null);
                    };
                };
            }
            catch(err){                
                resolve(null);
            };
        });
    };
    async getRouter(ctx: Koa.Context): Promise<{router: IRouterPluginOptions, baseUrl: string}>{
        let url = ctx.url;        
        let routes: IRouterPluginOptions[];
        routes = this.options.router.routes;
        if (routes){
            let matched: IRouterPluginOptions;
            let matchedUrl: string;
            let matchedLength = 0;
            for (let i = 0; i < routes.length; i++){
                let router = routes[i];
                if (Array.isArray(router.baseUrl)){
                    for (let i = 0; i < router.baseUrl.length; i ++){
                        let baseUrl = router.baseUrl[i];
                        if ((url + '/').startsWith(baseUrl + '/') || (url + '?').startsWith(baseUrl + '?')){
                            if (!matched || baseUrl.split('/').length > matchedLength){
                                matched = router;
                                matchedUrl = baseUrl;
                                matchedLength = baseUrl.split('/').length;
                            };
                        };
                    };
                }
                else if ((url + '/').startsWith(router.baseUrl + '/') || (url + '?').startsWith(router.baseUrl + '?')){
                    if (!matched || router.baseUrl.split('/').length > matchedLength){
                        matched = router;
                        matchedUrl = router.baseUrl;
                        matchedLength = router.baseUrl.split('/').length;
                    };
                };
            };
            return {                    
                router: matched,
                baseUrl: matchedUrl
            };
        }
    };
    async stop(){        
        if (this.running){
            return new Promise((resolve)=>{                        
                this.running = false;
                if (this.http){
                    this.http.close(()=>{
                        if (this.https)
                            this.https.close(resolve)
                        else
                            resolve(null);
                    });
                }
                else if (this.https)
                    this.https.close(resolve)
                else
                    resolve(null);
            });
        }
    };
    async start(){        
        if (this.running)
            return;
        this.running = true;        
        if (this.options.port || this.options.securePort){            
            this.ssl = {};
            let self = this;
            if (this.options.port){                                        
                this.http = Http.createServer(this.app.callback()).listen(this.options.port,'0.0.0.0');            
                console.log(`http server is running at ${this.options.port}`);
            };
            if (this.options.securePort){                                        
                var SNIOptions = {
                    SNICallback:  async function (domain, callback) {		
                        var crt = await self.getCert(domain);                    
                        callback(null, crt);
                    }
                };
                this.https = Https.createServer(SNIOptions, this.app.callback()).listen(this.options.securePort);            
                console.log(`https server is running at ${this.options.securePort}`);
            };
            this.app.use(async (ctx: Koa.Context, next)=>{
                if (this.options.cors){
                    if (ctx.method == 'OPTIONS'){
                        ctx.set('Access-Control-Allow-Origin', '*');
                        ctx.set('Access-Control-Allow-Headers', 'content-type');
                        ctx.status = 200;
                        return;
                    }
                    else if (ctx.method == 'POST'){
                        ctx.set('Access-Control-Allow-Origin', '*');
                        ctx.set('Access-Control-Allow-Headers', 'content-type');
                    };
                };
                if (this.options.router && this.options.router.routes){
                    let matched = await this.getRouter(ctx);
                    if (matched?.router){
                        let router = matched.router;
                        let baseUrl = matched.baseUrl;
                        if (this.options?.router?.module)
                            router.modulePath = this.options.router.module;
                        try{
                            if (!(<any>router)._plugin){
                                (<any>router)._plugin = new Router(router); 
                                await (<any>router)._plugin.init(router.params);
                            };
                            let result = await (<any>router)._plugin.route(ctx, baseUrl);                            
                            if (result)                           
                                return;
                        }
                        catch(err){
                            console.dir(err)
                            ctx.status = 500;
                            return;
                        };                    
                    }
                    else if (!this.withDefaultMiddleware){
                        ctx.status = 404;
                        ctx.body = Templates.page404;
                    }
                    else
                        await next();
                }
                else if (this.packageManager){
                    let {pack, route, params, options} = await this.packageManager.getDomainRouter({
                        method: ctx.method,
                        domain: ctx.hostname,
                        url: ctx.url
                    });
                    if (route && params !== false){
                        if (this.queue){
                            let jobReq: any = {
                                request: RouterRequest(ctx)
                            };
                            let result = await this.queue.createJob(jobReq, true);
                            ctx.set('job-id',result.id);
                            ctx.status = result.result.statusCode;
                            ctx.body = result.result.body
                        }
                        else{
                            let plugin: Router = (<any>route)._plugin;
                            if (!plugin){
                                let script = await pack.getScript(route.module);
                                if (script){
                                    let plugins:any = {};
                                    if (options && options.plugins){
                                        if (route.plugins?.db)
                                            plugins.db = {default: options.plugins.db};
                                        if (route.plugins?.cache)
                                            plugins.cache = options.plugins.cache;
                                        if (route.plugins?.wallet)
                                            plugins.wallet = options.plugins.wallet;
                                    };
                                    let method = ctx.method as IRouterPluginMethod;
                                    plugin = new Router({
                                        baseUrl: route.url,
                                        methods: [method],
                                        script: script.script,
                                        dependencies: script.dependencies,
                                        plugins: plugins
                                    });
                                    (<any>route)._plugin = plugin;
                                };
                            };
                            if (plugin){                                                
                                let request = RouterRequest(ctx);                                                
                                if (params === true)
                                    request.params = route.params
                                else{
                                    request.params = params || {};
                                    for (let p in route.params)
                                        request.params[p] = route.params[p];
                                };
                                await plugin.route(ctx, request);
                                return;
                            };
                        }
                    };
                };
                await next();
            });
        };
    };
    use(middleware: any){     
        this.withDefaultMiddleware = true;
        this.app.use(middleware);
    };
};