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
import {PackageManager, IRoute} from '@ijstech/package';
import { IRouterPluginMethod } from '@ijstech/types';
import {match} from './pathToRegexp';

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
export interface IHttpServerOptions{    
    ciphers?: string;
    certPath?: string;
    port?: number;
    securePort?: number;
    router?: IRouterOptions;
};
function matchRoute(pack: IDomainPackage, route: IRoute, url: string): any{
    if (pack.baseUrl + route.url == url)
        return true;
    if (!(<any>route)._match){
        let keys = [];
        (<any>route)._match = match(pack.baseUrl + route.url);        
    }    
    let result = (<any>route)._match(url);
    if (result === false )
        return false
    else
        return Object.assign({}, result.params);
};
export interface IDomainPackage{
    baseUrl: string;
    packagePath: string;
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
    private domainPacks: {[name: string]:IDomainPackage[]} = {};

    constructor(options: IHttpServerOptions){
        this.app = new Koa();        
        this.app.use(BodyParser());
        this.options = options;
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
    async addDomainPackage(domain: string, baseUrl: string, packagePath: string){
        if (!this.packageManager)
            this.packageManager = new PackageManager();
        let packs = this.domainPacks[domain] || [];
        packs.push({
            baseUrl: baseUrl,
            packagePath: packagePath
        });
        this.domainPacks[domain] = packs;
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
                    let packs = this.domainPacks[ctx.hostname];                    
                    if (packs){
                        let method = ctx.method as IRouterPluginMethod;
                        for (let i = 0; i < packs.length; i ++){
                            let pack = packs[i];
                            if (ctx.url.startsWith(pack.baseUrl)){
                                let p = await this.packageManager.addPackage(pack.packagePath);
                                for (let k = 0; k < p.scconfig?.router?.routes.length; k ++){
                                    let route = p.scconfig.router.routes[k];                                    
                                    if (route.methods.indexOf(method) > -1){
                                        let params = matchRoute(pack, route, ctx.url);
                                        if (params !== false){
                                            let plugin: Router = (<any>route)._plugin;
                                            if (!plugin){
                                                let script = await p.getScript(route.module);
                                                if (script){
                                                    plugin = new Router({
                                                        baseUrl: route.url,
                                                        methods: [method],
                                                        script: script.script,
                                                        dependencies: script.dependencies
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
                                        };
                                    };
                                };
                            };
                        };
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