"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServer = void 0;
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const fs_1 = __importDefault(require("fs"));
const tls_1 = __importDefault(require("tls"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const _404_1 = __importDefault(require("./templates/404"));
const plugin_1 = require("@ijstech/plugin");
const RootPath = path_1.default.dirname(require.main.filename);
;
;
;
class HttpServer {
    constructor(options) {
        this.ssl = {};
        this.app = new koa_1.default();
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
    ;
    getCert(domain) {
        let self = this;
        let SSL = this.ssl;
        if (SSL[domain])
            return SSL[domain];
        return new Promise(async function (resolve) {
            var certPath = self.options.certPath || './certs';
            try {
                if (fs_1.default.existsSync(path_1.default.resolve(RootPath, certPath, domain, 'privkey.pem'))) {
                    var crt = tls_1.default.createSecureContext({
                        ciphers: self.ciphers,
                        honorCipherOrder: true,
                        key: fs_1.default.readFileSync(path_1.default.resolve(RootPath, certPath, domain, 'privkey.pem')),
                        cert: fs_1.default.readFileSync(path_1.default.resolve(RootPath, certPath, domain, 'fullchain.pem'))
                    });
                    SSL[domain] = crt;
                    resolve(crt);
                }
                else if (fs_1.default.existsSync(path_1.default.resolve(RootPath, certPath, domain, 'ca_bundle.crt'))) {
                    var crt = tls_1.default.createSecureContext({
                        ciphers: self.ciphers,
                        honorCipherOrder: true,
                        key: fs_1.default.readFileSync(path_1.default.resolve(RootPath, certPath, domain, 'private.key')),
                        cert: fs_1.default.readFileSync(path_1.default.resolve(RootPath, certPath, domain, 'ca_bundle.crt'))
                    });
                    SSL[domain] = crt;
                    resolve(crt);
                }
                else {
                    var items = domain.split('.');
                    if (items.length > 2 && items.length < 20) {
                        items.shift();
                        domain = items.join('.');
                        let crt = await self.getCert(domain);
                        if (crt)
                            SSL[domain] = crt;
                        resolve(crt);
                    }
                    else {
                        resolve(null);
                    }
                    ;
                }
                ;
            }
            catch (err) {
                resolve(null);
            }
            ;
        });
    }
    ;
    checkBaseUrl(url, routerOptions) {
        if (Array.isArray(routerOptions.baseUrl)) {
            for (let i = 0; i < routerOptions.baseUrl.length; i++) {
                let baseUrl = routerOptions.baseUrl[i];
                if ((url + '/').startsWith(baseUrl + '/') || (url + '?').startsWith(baseUrl + '?'))
                    return baseUrl;
            }
            ;
        }
        else if ((url + '/').startsWith(routerOptions.baseUrl + '/') || (url + '?').startsWith(routerOptions.baseUrl + '?'))
            return routerOptions.baseUrl;
    }
    ;
    async start() {
        if (this.running)
            return;
        this.running = true;
        if (this.options.port || this.options.securePort) {
            this.app.use(koa_bodyparser_1.default());
            this.ssl = {};
            let self = this;
            if (this.options.port) {
                this.http = http_1.default.createServer(this.app.callback()).listen(this.options.port, '0.0.0.0');
                console.log(`http server is running at ${this.options.port}`);
            }
            ;
            if (this.options.securePort) {
                var SNIOptions = {
                    SNICallback: async function (domain, callback) {
                        var crt = await self.getCert(domain);
                        callback(null, crt);
                    }
                };
                this.https = https_1.default.createServer(SNIOptions, this.app.callback()).listen(this.options.securePort);
                console.log(`https server is running at ${this.options.securePort}`);
            }
            ;
            this.app.use(async (ctx) => {
                if (this.options.router && this.options.router.routes) {
                    for (let i = 0; i < this.options.router.routes.length; i++) {
                        let router = this.options.router.routes[i];
                        let baseUrl = this.checkBaseUrl(ctx.url, router);
                        if (baseUrl) {
                            if (router.form) {
                                let pack = require('@ijstech/form');
                                if (pack.default) {
                                    let config = {
                                        baseUrl: baseUrl,
                                        host: router.form.host,
                                        token: router.form.token,
                                        package: router.form.package,
                                        mainForm: router.form.mainForm,
                                        params: router.params
                                    };
                                    await pack.default(ctx, config);
                                    return true;
                                }
                                ;
                            }
                            else {
                                if (!router._plugin)
                                    router._plugin = new plugin_1.Router(router);
                                let result = await router._plugin.route(ctx, baseUrl);
                                if (result)
                                    return;
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                ;
                ctx.status = 404;
                ctx.body = _404_1.default.page404;
            });
        }
        ;
    }
    ;
    use(middleware) {
        this.app.use(middleware);
    }
    ;
}
exports.HttpServer = HttpServer;
;
