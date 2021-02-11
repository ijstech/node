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
        this.options = options;        
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
                        key:  Fs.readFileSync(Path.resolve(RootPath, certPath, domain, 'privkey.pem')),
                        cert: Fs.readFileSync(Path.resolve(RootPath, certPath, domain, 'fullchain.pem'))
                    })	
                    SSL[domain] = crt;                    
                    resolve(crt);
                }
                else if (Fs.existsSync(Path.resolve(RootPath, certPath, domain, 'ca_bundle.crt'))){                    
                    var crt = Tls.createSecureContext({
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
           
        if (this.options.plugin){         
            for (let n in this.options.plugin){                
                let opt = this.options.plugin[n];
                let p = require(n);                
                if (typeof(p._init) == 'function')
                    p._init(opt);
            }
        }
        if (this.options.port || this.options.securePort){
            this.ssl = {};
            this.app = new Koa();        
            this.app.use(BodyParser());

            for (var v in this.options.middleware){
                let opt = this.options.middleware[v];
                let p = require(v);
                
                if (typeof(p._middleware) == 'function'){
                    if (typeof(p._init) == 'function')
                        p._init(opt);
                    this.app.use(p._middleware);
                }
                else if (typeof(p) == 'function'){
                    this.app.use(p(opt));
                }                                    
            }
            this.app.use(ctx => {
                ctx.status = 404;
                ctx.body = page404;
            });
    
            let self = this;
            if (this.options.port){                        
                let http = require('http');
                this.httpConnections = new Set();
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
                }
                this.https = https.createServer(SNIOptions, this.app.callback()).listen(this.options.securePort);            
                console.log(`https server is running at ${this.options.securePort}`);
            }; 
        }                       
    }
    use(middleware){                
        this.app.use(middleware);
    }
}
module.exports = AppServer;