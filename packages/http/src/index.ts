import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Fs from 'fs';
import Tls from 'tls';
import Path from 'path';
import Http from 'http';
import Https from 'https';
import Templates from './templates/404';
import {IRouterPluginOptions, Router} from '@ijstech/plugin';

const RootPath = Path.dirname(require.main.filename);

export interface IPlugin{
    scriptPath?: string;
    baseUrl?: string;
};
export interface IPlugins{
    [name: string]: IPlugin;
};
export interface IRouterOptions {
    routes: IRouterPluginOptions[];
}
export interface IHttpServerOptions{
    ciphers?: string;
    certPath?: string;
    port?: number;
    securePort?: number;
    router: IRouterOptions;
};
export class HttpServer {
    private app: Koa;
    private options: IHttpServerOptions;
    private ciphers: string;
    private ssl: any = {};
    private running: boolean;
    private http: Http.Server;
    private https: Https.Server;

    constructor(options: IHttpServerOptions){
        this.app = new Koa();        
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
    getRouter(url: string): {router: IRouterPluginOptions, baseUrl: string}{
        if (this.options.router && this.options.router.routes){
            let matched: IRouterPluginOptions;
            let matchedUrl: string;
            let matchedLength = 0;
            for (let i = 0; i < this.options.router.routes.length; i++){
                let router = this.options.router.routes[i];
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
        };
    };
    async start(){        
        if (this.running)
            return;
        this.running = true;        
        if (this.options.port || this.options.securePort){
            this.app.use(BodyParser());
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
            this.app.use(async (ctx: Koa.Context)=>{                                
                let matched = this.getRouter(ctx.url);
                if (matched.router){
                    let router = matched.router;
                    let baseUrl = matched.baseUrl;
                    if (router.form){
                        let pack = require('@ijstech/form');
                        if (pack.default){
                            let config = {
                                baseUrl: baseUrl,
                                host: router.form.host,
                                token: router.form.token,
                                package: router.form.package,
                                mainForm: router.form.mainForm,
                                params: router.params
                            }
                            await pack.default(ctx, config);
                            return true;
                        };
                    }
                    else{
                        if (!(<any>router)._plugin){
                            (<any>router)._plugin = new Router(router); 
                            await (<any>router)._plugin.init(router.params);
                        };
                        let result = await (<any>router)._plugin.route(ctx, baseUrl);                            
                        if (result)                           
                            return;
                    };
                };
                ctx.status = 404;
                ctx.body = Templates.page404;
            });
        };
    };
    use(middleware: any){                
        this.app.use(middleware);
    };
};