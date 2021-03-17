const Koa = require('koa');
const BodyParser = require('koa-bodyparser');
const Fs = require('fs');
const Tls = require('tls');
const Path = require('path');
const page404 = require('./templates/404');
const RootPath = process.cwd();

class AppServer {
    constructor(options){
        if (!options){
            if (Fs.existsSync(Path.resolve(RootPath, './config.js'))){
                options = require(Path.resolve(RootPath, './config.js'))
            }
            else if (Fs.existsSync(Path.resolve(RootPath, './config/config.js'))){
                options = require(Path.resolve(RootPath, './config/config.js'))                
            }
            else
                return console.log('Server configuration not defined!')
        }        
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
    }    
    getCert(domain){            
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
                        var crt = await self.getCert(domain);
                        if (crt)
                            SSL[domain] = crt;                        
                        resolve(crt);
                    }
                    else{                        
                        resolve();
                    }
                }
            }
            catch(err){                
                resolve()
            }
        })
    }
    start(){
        if (this.running)
            return;
        this.running = true;     
        // this.app.use(async function(ctx, next){    
        //     return new Promise(function(resolve, reject){
        //         if (ctx.request.type == 'multipart/form-data'){
        //             var data = "";
        //             ctx.req.on("data", chunk => {
        //                 data += chunk
        //             });
        //             ctx.req.on("end", async () => {
        //                 ctx.raw_data = data;                
        //                 await next();
        //             });            
        //         }
        //         else            
        //             await next();
        //     })                                
        // })   
        this.app.use(BodyParser());
        let middlewares = [];   
        if (this.options.plugin){         
            for (let n in this.options.plugin){                
                let opt = this.options.plugin[n];
                let p = require(n);                
                if (typeof(p._middleware) == 'function')
                    middlewares.push(p._middleware);
                if (typeof(p._init) == 'function'){
                    p._init(opt, function(middleware){
                        if (middleware && middlewares.indexOf(middleware) < 0)
                            middlewares.push(middleware);
                    });
                };
            };
        };   
        if (this.options.port || this.options.securePort){
            this.ssl = {};
            let self = this;
            if (this.options.port){                        
                let http = require('http');
                this.http = http.createServer(this.app.callback()).listen(this.options.port,'0.0.0.0');            
                console.log(`http server is running at ${this.options.port}`);
            };
            if (this.options.securePort){                        
                let https = require('https');                
                var SNIOptions = {
                    SNICallback:  async function (domain, callback) {		
                        var crt = await self.getCert(domain);                    
                        callback(null, crt);
                    }
                };
                this.https = https.createServer(SNIOptions, this.app.callback()).listen(this.options.securePort);            
                console.log(`https server is running at ${this.options.securePort}`);
            }; 

            for (let v in this.options.middleware){
                let opt = this.options.middleware[v];
                let p = require(v);
                
                if (typeof(p._middleware) == 'function'){
                    if (typeof(p._init) == 'function')
                        p._init(opt, this);
                    if (middlewares.indexOf(p._middleware) < 0)
                        this.app.use(p._middleware);
                }
                else if (typeof(p) == 'function'){
                    this.app.use(p(opt));
                };
            };
            for (let i = 0; i < middlewares.length; i ++){
                this.app.use(middlewares[i]);
            };
            this.app.use(ctx => {
                ctx.status = 404;
                ctx.body = page404;
            });            
        };
    };
    use(middleware){                
        this.app.use(middleware);
    };
};
module.exports = AppServer;