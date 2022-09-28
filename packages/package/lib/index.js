"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = exports.Package = exports.matchRoute = void 0;
const tsc_1 = require("@ijstech/tsc");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const pathToRegexp_1 = require("./pathToRegexp");
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
exports.matchRoute = matchRoute;
;
;
;
;
class Package {
    constructor(manager, packagePath) {
        this.scripts = {};
        this.manager = manager;
        this.packagePath = packagePath;
    }
    ;
    async getFileContent(filePath) {
        if (this.packagePath.indexOf('/') >= 0) {
            return await fs_1.promises.readFile(path_1.default.join(this.packagePath, filePath), 'utf8');
        }
        else {
        }
        return;
    }
    ;
    get name() {
        return this.packageConfig.name || this.packagePath;
    }
    ;
    get path() {
        return this.packagePath;
    }
    get version() {
        return this.packageConfig.version || '*';
    }
    ;
    async init() {
        if (this.packageConfig == undefined) {
            try {
                this.packageConfig = JSON.parse(await this.getFileContent('package.json'));
            }
            catch (err) {
                this.packageConfig = {};
            }
            try {
                this.scconfig = JSON.parse(await this.getFileContent('scconfig.json'));
            }
            catch (err) {
                this.scconfig = {};
            }
        }
    }
    ;
    async fileImporter(fileName, isPackage) {
        if (isPackage) {
            let result = await this.manager.getScript(fileName);
            return {
                fileName: 'index.d.ts',
                script: result.script,
                dts: result.dts
            };
        }
        else
            return {
                fileName: fileName + '.ts',
                script: await this.getFileContent(fileName + '.ts')
            };
    }
    ;
    async getScript(fileName) {
        fileName = fileName || 'index.ts';
        if (!this.scripts[fileName]) {
            await this.init();
            let content = '';
            if (this.scconfig.src) {
                if (this.scconfig.src.endsWith('.ts'))
                    content = await this.getFileContent(this.scconfig.src);
                else if (fileName)
                    content = await this.getFileContent(path_1.default.join(this.scconfig.src, fileName));
                else
                    content = await this.getFileContent(path_1.default.join(this.scconfig.src, 'index.ts'));
            }
            else
                content = await this.getFileContent('src/index.ts');
            if (content) {
                let compiler = new tsc_1.Compiler();
                await compiler.addPackage('@ijstech/plugin');
                await compiler.addPackage('bignumber.js');
                await compiler.addFileContent('index.ts', content, this.name, this.fileImporter.bind(this));
                let result = await compiler.compile(true);
                this.scripts[fileName] = result;
            }
        }
        ;
        return this.scripts[fileName];
    }
    ;
}
exports.Package = Package;
;
class PackageManager {
    constructor(options) {
        this.packagesByPath = {};
        this.packagesByVersion = {};
        this.packagesByName = {};
        this.domainRouters = {};
        this.domainWorkers = {};
        this.options = options;
    }
    ;
    async addDomainRouter(domain, router) {
        let packs = this.domainRouters[domain] || [];
        packs.push(router);
        this.domainRouters[domain] = packs;
    }
    ;
    async addDomainWorker(domain, worker) {
        let packs = this.domainWorkers[domain] || [];
        packs.push(worker);
        this.domainWorkers[domain] = packs;
    }
    ;
    async addPackage(packagePath) {
        if (!this.packagesByPath[packagePath]) {
            let result = new Package(this, packagePath);
            await result.init();
            this.packagesByPath[packagePath] = result;
            this.packagesByVersion[`${result.name}@${result.version}`] = result;
            this.packagesByName[result.name] = result;
        }
        ;
        return this.packagesByPath[packagePath];
    }
    ;
    async getDomainRouter(ctx) {
        var _a, _b;
        let packs = this.domainRouters[ctx.domain];
        if (packs) {
            let method = ctx.method;
            for (let i = 0; i < packs.length; i++) {
                let pack = packs[i];
                if (ctx.url.startsWith(pack.baseUrl)) {
                    let p = await this.addPackage(pack.packagePath);
                    for (let k = 0; k < ((_b = (_a = p.scconfig) === null || _a === void 0 ? void 0 : _a.router) === null || _b === void 0 ? void 0 : _b.routes.length); k++) {
                        let route = p.scconfig.router.routes[k];
                        if (route.methods.indexOf(method) > -1) {
                            let params = matchRoute(pack, route, ctx.url);
                            if (params !== false) {
                                if (params === true)
                                    params = route.params;
                                else {
                                    params = params || {};
                                    for (let p in route.params)
                                        params[p] = route.params[p];
                                }
                                ;
                                return {
                                    options: pack.options,
                                    pack: p,
                                    params,
                                    route
                                };
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
        return {};
    }
    ;
    async getScript(packageName, fileName) {
        let pack = await this.getPackage(packageName);
        if (pack)
            return await pack.getScript(fileName);
    }
    ;
    async getPackage(name, version) {
        try {
            let result;
            if (version)
                result = this.packagesByVersion[`${name}@${version}`];
            else
                result = this.packagesByName[`${name}`];
            if (!result && this.packageImporter)
                result = await this.packageImporter(name, version);
            return result;
        }
        catch (err) {
            console.error(err);
        }
        ;
    }
    ;
}
exports.PackageManager = PackageManager;
;
