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
const pathToRegexp_1 = require("./pathToRegexp");
const RootPath = process.cwd();
;
;
;
;
function matchRoute(pack, route, url) {
    if (pack.baseUrl + route.url == url)
        return true;
    if (!route._match) {
        let keys = [];
        route._match = pathToRegexp_1.match(pack.baseUrl + route.url);
    }
    let result = route._match(url);
    if (result === false)
        return false;
    else
        return Object.assign({}, result.params);
}
;
;
;
class HttpServer {
    constructor(options) {
        this.ssl = {};
        this.domainPacks = {};
        this.options = options;
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
    async addDomainPackage(domain, baseUrl, packagePath, options) {
        if (!this.packageManager)
            this.packageManager = new package_1.PackageManager();
        let packs = this.domainPacks[domain] || [];
        packs.push({
            baseUrl: baseUrl,
            packagePath: packagePath,
            options: options
        });
        this.domainPacks[domain] = packs;
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
                var _a, _b, _c, _d, _e, _f;
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
                                await router._plugin.init(router.params);
                            }
                            ;
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
                    let packs = this.domainPacks[ctx.hostname];
                    if (packs) {
                        let method = ctx.method;
                        for (let i = 0; i < packs.length; i++) {
                            let pack = packs[i];
                            if (ctx.url.startsWith(pack.baseUrl)) {
                                let p = await this.packageManager.addPackage(pack.packagePath);
                                for (let k = 0; k < ((_d = (_c = p.scconfig) === null || _c === void 0 ? void 0 : _c.router) === null || _d === void 0 ? void 0 : _d.routes.length); k++) {
                                    let route = p.scconfig.router.routes[k];
                                    if (route.methods.indexOf(method) > -1) {
                                        let params = matchRoute(pack, route, ctx.url);
                                        if (params !== false) {
                                            let plugin = route._plugin;
                                            if (!plugin) {
                                                let script = await p.getScript(route.module);
                                                if (script) {
                                                    let plugins = {};
                                                    if (pack.options && pack.options.plugins) {
                                                        if ((_e = route.plugins) === null || _e === void 0 ? void 0 : _e.db)
                                                            plugins.db = { default: pack.options.plugins.db };
                                                        if ((_f = route.plugins) === null || _f === void 0 ? void 0 : _f.cache)
                                                            plugins.cache = pack.options.plugins.cache;
                                                    }
                                                    ;
                                                    plugin = new plugin_1.Router({
                                                        baseUrl: route.url,
                                                        methods: [method],
                                                        script: script.script,
                                                        dependencies: script.dependencies,
                                                        plugins: plugins
                                                    });
                                                    route._plugin = plugin;
                                                }
                                                ;
                                            }
                                            ;
                                            if (plugin) {
                                                let request = plugin_1.RouterRequest(ctx);
                                                if (params === true)
                                                    request.params = route.params;
                                                else {
                                                    request.params = params || {};
                                                    for (let p in route.params)
                                                        request.params[p] = route.params[p];
                                                }
                                                ;
                                                await plugin.route(ctx, request);
                                                return;
                                            }
                                            ;
                                        }
                                        ;
                                    }
                                    ;
                                }
                                ;
                            }
                            ;
                        }
                        ;
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
