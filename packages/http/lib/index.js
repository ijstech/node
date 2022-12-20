"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
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
const package_1 = require("@ijstech/package");
const queue_1 = require("@ijstech/queue");
const RootPath = process.cwd();
;
;
;
;
class HttpServer {
    constructor(options) {
        this.ssl = {};
        this.options = options;
        this.packageManager = this.options.packageManager;
        if (this.options.worker)
            this.queue = queue_1.getJobQueue(this.options.worker);
        if (this.options.domains) {
            for (let domain in this.options.domains) {
                let packages = this.options.domains[domain];
                for (let i = 0; i < packages.length; i++)
                    this.addDomainPackage(domain, packages[i]);
            }
            ;
        }
        ;
        if (this.options.port || this.options.securePort) {
            this.app = new koa_1.default();
            this.app.use(koa_bodyparser_1.default());
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
    }
    ;
    async addDomainPackage(domain, pack) {
        if (!this.packageManager)
            this.packageManager = new package_1.PackageManager({
                storage: this.options.storage
            });
        this.packageManager.addDomainRouter(domain, pack);
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
    async getRouter(ctx) {
        let url = ctx.url;
        let routes;
        routes = this.options.router.routes;
        if (routes) {
            let matched;
            let matchedUrl;
            let matchedLength = 0;
            for (let i = 0; i < routes.length; i++) {
                let router = routes[i];
                if (Array.isArray(router.baseUrl)) {
                    for (let i = 0; i < router.baseUrl.length; i++) {
                        let baseUrl = router.baseUrl[i];
                        if ((url + '/').startsWith(baseUrl + '/') || (url + '?').startsWith(baseUrl + '?')) {
                            if (!matched || baseUrl.split('/').length > matchedLength) {
                                matched = router;
                                matchedUrl = baseUrl;
                                matchedLength = baseUrl.split('/').length;
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                else if ((url + '/').startsWith(router.baseUrl + '/') || (url + '?').startsWith(router.baseUrl + '?')) {
                    if (!matched || router.baseUrl.split('/').length > matchedLength) {
                        matched = router;
                        matchedUrl = router.baseUrl;
                        matchedLength = router.baseUrl.split('/').length;
                    }
                    ;
                }
                ;
            }
            ;
            return {
                router: matched,
                baseUrl: matchedUrl
            };
        }
    }
    ;
    async stop() {
        if (this.running) {
            return new Promise((resolve) => {
                this.running = false;
                if (this.http) {
                    this.http.close(() => {
                        if (this.https)
                            this.https.close(resolve);
                        else
                            resolve(null);
                    });
                }
                else if (this.https)
                    this.https.close(resolve);
                else
                    resolve(null);
            });
        }
    }
    ;
    async start() {
        if (this.running)
            return;
        this.running = true;
        if (this.options.port || this.options.securePort) {
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
            this.app.use(async (ctx, next) => {
                var _a, _b, _c, _d, _e;
                if (this.options.cors) {
                    if (ctx.method == 'OPTIONS') {
                        ctx.set('Access-Control-Allow-Origin', '*');
                        ctx.set('Access-Control-Allow-Headers', 'content-type');
                        ctx.status = 200;
                        return;
                    }
                    else if (ctx.method == 'POST') {
                        ctx.set('Access-Control-Allow-Origin', '*');
                        ctx.set('Access-Control-Allow-Headers', 'content-type');
                    }
                    ;
                }
                ;
                if (this.options.router && this.options.router.routes) {
                    let matched = await this.getRouter(ctx);
                    if (matched === null || matched === void 0 ? void 0 : matched.router) {
                        let router = matched.router;
                        let baseUrl = matched.baseUrl;
                        if ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.router) === null || _b === void 0 ? void 0 : _b.module)
                            router.modulePath = this.options.router.module;
                        try {
                            if (!router._plugin) {
                                router._plugin = new plugin_1.Router(router);
                            }
                            ;
                            router._plugin.session.params = router._plugin.session.params || router.params || {};
                            let result = await router._plugin.route(ctx, baseUrl);
                            if (result)
                                return;
                        }
                        catch (err) {
                            console.dir(err);
                            ctx.status = 500;
                            return;
                        }
                        ;
                    }
                    else if (!this.withDefaultMiddleware) {
                        ctx.status = 404;
                        ctx.body = _404_1.default.page404;
                    }
                    else
                        await next();
                }
                else if (this.packageManager) {
                    let { pack, route, params, options } = await this.packageManager.getDomainRouter({
                        method: ctx.method,
                        domain: ctx.hostname,
                        url: ctx.url
                    });
                    if (route && params !== false) {
                        if (this.queue) {
                            let jobReq = {
                                request: plugin_1.RouterRequest(ctx)
                            };
                            let result = await this.queue.createJob(jobReq, true);
                            ctx.set('job-id', result.id);
                            ctx.status = result.result.statusCode;
                            ctx.body = result.result.body;
                        }
                        else {
                            let plugin = route._plugin;
                            if (!plugin) {
                                let script = await pack.getScript(route.module);
                                if (script) {
                                    let plugins = {};
                                    if (options && options.plugins) {
                                        if ((_c = route.plugins) === null || _c === void 0 ? void 0 : _c.db)
                                            plugins.db = { default: options.plugins.db };
                                        if ((_d = route.plugins) === null || _d === void 0 ? void 0 : _d.cache)
                                            plugins.cache = options.plugins.cache;
                                        if ((_e = route.plugins) === null || _e === void 0 ? void 0 : _e.wallet)
                                            plugins.wallet = options.plugins.wallet;
                                    }
                                    ;
                                    let method = ctx.method;
                                    plugin = new plugin_1.Router({
                                        baseUrl: route.url,
                                        methods: [method],
                                        script: script.script,
                                        dependencies: script.dependencies,
                                        plugins: plugins,
                                        params: route.params
                                    });
                                    route._plugin = plugin;
                                }
                                ;
                            }
                            ;
                            if (plugin) {
                                let request = plugin_1.RouterRequest(ctx);
                                if (params === true)
                                    request.params = {};
                                else {
                                    request.params = params || {};
                                }
                                ;
                                await plugin.route(ctx, request);
                                return;
                            }
                            ;
                        }
                    }
                    ;
                }
                ;
                await next();
            });
        }
        ;
    }
    ;
    use(middleware) {
        this.withDefaultMiddleware = true;
        this.app.use(middleware);
    }
    ;
}
exports.HttpServer = HttpServer;
;
