"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = exports.Package = exports.matchRoute = void 0;
const tsc_1 = require("@ijstech/tsc");
const storage_1 = require("@ijstech/storage");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const pathToRegexp_1 = require("./pathToRegexp");
const DefaultPlugins = ['@ijstech/crypto', '@ijstech/plugin', '@ijstech/wallet', '@ijstech/eth-contract'];
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
exports.matchRoute = matchRoute;
;
;
;
class Package {
    constructor(manager, packagePath, options) {
        this.scripts = {};
        this.manager = manager;
        this.packagePath = packagePath;
        this.packageName = options === null || options === void 0 ? void 0 : options.name;
        this.packageVersion = options === null || options === void 0 ? void 0 : options.version;
    }
    ;
    async getFileContent(filePath) {
        return this.manager.getFileContent(this.packagePath, filePath);
    }
    ;
    get name() {
        return this.packageName || this.packageConfig.name || this.packagePath;
    }
    ;
    get path() {
        return this.packagePath;
    }
    ;
    get version() {
        return this.packageVersion || this.packageConfig.version || '*';
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
            if (result.errors)
                console.dir(result.errors);
            return {
                fileName: 'index.d.ts',
                script: result.script,
                dts: result.dts,
                dependencies: result.dependencies
            };
        }
        else {
            return {
                fileName: fileName + '.ts',
                script: await this.getFileContent(fileName + '.ts')
            };
        }
    }
    ;
    async getScript(fileName) {
        fileName = fileName || 'index.ts';
        if (!this.scripts[fileName]) {
            await this.init();
            let content = '';
            let indexFile = 'index.ts';
            try {
                if (this.scconfig.src) {
                    if (this.scconfig.src.endsWith('.ts')) {
                        content = await this.getFileContent(fileName);
                        indexFile = path_1.default.join(path_1.default.dirname(this.scconfig.src), 'index.ts');
                    }
                    else {
                        content = await this.getFileContent(path_1.default.join(this.scconfig.src, fileName));
                        indexFile = path_1.default.join(this.scconfig.src, indexFile);
                    }
                }
                else {
                    content = await this.getFileContent(path_1.default.join('src', fileName));
                    indexFile = 'src/index.ts';
                }
                ;
            }
            catch (err) {
                console.error(err);
            }
            ;
            if (content) {
                let compiler = new tsc_1.Compiler();
                await compiler.addFileContent(indexFile, content, this.name, async (fileName, isPackage) => {
                    if (isPackage && DefaultPlugins.indexOf(fileName) > -1) {
                        await compiler.addPackage('bignumber.js');
                        if (fileName == '@ijstech/eth-contract') {
                            await compiler.addPackage('@ijstech/wallet');
                        }
                        ;
                        if (fileName == '@ijstech/wallet') {
                            await compiler.addPackage('bignumber.js');
                        }
                        ;
                        await compiler.addPackage(fileName);
                    }
                    else {
                        let result = await this.fileImporter(fileName, isPackage);
                        if (isPackage) {
                            await compiler.addPackage(fileName, result);
                            for (let p in result.dependencies) {
                                if (p == '@ijstech/eth-contract') {
                                    await compiler.addPackage('bignumber.js');
                                    await compiler.addPackage('@ijstech/wallet');
                                    await compiler.addPackage(p);
                                }
                                ;
                                if (p == '@ijstech/wallet') {
                                    await compiler.addPackage('bignumber.js');
                                    await compiler.addPackage(p);
                                }
                                ;
                            }
                            ;
                        }
                        ;
                        return result;
                    }
                });
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
;
class PackageManager {
    constructor(options) {
        var _a;
        this.packagesByPath = {};
        this.packagesByVersion = {};
        this.packagesByName = {};
        this.domainRouterPackages = {};
        this.packages = {};
        this.options = options;
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.packages)
            this.register(this.options.packages);
    }
    ;
    async addDomainRouter(domain, pack) {
        let packs = this.domainRouterPackages[domain] || [];
        packs.push(pack);
        this.domainRouterPackages[domain] = packs;
    }
    ;
    async addPackage(packagePath, packageOptions) {
        if (!this.packagesByPath[packagePath]) {
            let result = new Package(this, packagePath, packageOptions);
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
        let packs = this.domainRouterPackages[ctx.domain];
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
    async getFileContent(packagePath, filePath) {
        if (packagePath.indexOf('/') >= 0) {
            let path = path_1.default.resolve(packagePath, filePath);
            if (!path.startsWith(packagePath))
                return '';
            return await fs_1.promises.readFile(path, 'utf8');
        }
        else if (this.options.storage) {
            if (!this.storage)
                this.storage = new storage_1.Storage(this.options.storage);
            return await this.storage.getFile(packagePath, filePath);
        }
        ;
        return;
    }
    ;
    async getPackageWorker(pack, workerName) {
        var _a;
        let p = await this.addPackage(pack.packagePath);
        let workers = (_a = p.scconfig) === null || _a === void 0 ? void 0 : _a.workers;
        if (workers) {
            let w = workers[workerName];
            if (w) {
                if (!w.moduleScript)
                    w.moduleScript = await p.getScript(w.module);
                return w;
            }
            ;
        }
        ;
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
            if (!result && this.packages[name]) {
                let packs = this.packages[name];
                for (let i = 0; i < packs.length; i++) {
                    let pack = packs[i];
                    if (pack.version == '*' || pack.version == version) {
                        return await this.addPackage(pack.path, {
                            name: name,
                            version: pack.version
                        });
                    }
                    ;
                    pack = packs[0];
                    return await this.addPackage(pack.path, {
                        name: name,
                        version: pack.version
                    });
                }
                ;
            }
            ;
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
    async register(packages) {
        for (let name in packages) {
            let items = packages[name];
            this.packages[name] = items.concat(this.packages[name] || []);
        }
        ;
    }
    ;
}
exports.PackageManager = PackageManager;
;
