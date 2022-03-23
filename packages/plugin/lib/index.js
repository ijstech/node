"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = exports.Router = exports.loadModule = exports.getPackageScript = exports.resolveFilePath = exports.BigNumber = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vm_1 = require("@ijstech/vm");
var types_1 = require("@ijstech/types");
Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return types_1.BigNumber; } });
const github_1 = __importDefault(require("./github"));
const tsc_1 = require("@ijstech/tsc");
const RootPath = path_1.default.dirname(require.main.filename);
let Modules = {};
let LoadingPackageName = '';
global.define = function (id, deps, callback) {
    if (typeof (id) == 'function') {
        callback = id;
        Modules[LoadingPackageName] = callback();
    }
    else {
        let result = [];
        let exports = {};
        for (let i = 0; i < deps.length; i++) {
            let dep = deps[i];
            if (dep == 'require')
                result.push(null);
            else if (dep == 'exports') {
                result.push(exports);
            }
            else {
                result.push(Modules[dep]);
            }
        }
        ;
        if (callback)
            callback.apply(this, result);
        if (id == 'index' || id == 'plugin')
            Modules[LoadingPackageName || 'index'] = exports;
        else
            Modules[id] = exports;
    }
    ;
};
function resolveFilePath(rootPaths, filePath, allowsOutsideRootPath) {
    let rootPath = path_1.default.resolve(...rootPaths);
    let result = path_1.default.join(rootPath, filePath);
    if (allowsOutsideRootPath)
        return result;
    return result.startsWith(rootPath) ? result : undefined;
}
exports.resolveFilePath = resolveFilePath;
;
function getScript(filePath) {
    return new Promise(async (resolve) => {
        try {
            if (!filePath.startsWith('/'))
                filePath = resolveFilePath([RootPath], filePath, true);
            let isDir = (await fs_1.default.promises.lstat(filePath)).isDirectory();
            if (isDir) {
                let pack = await getPackage(filePath);
                if (pack.directories && pack.directories.bin) {
                    let compiler = new tsc_1.PluginCompiler();
                    compiler.addDirectory(resolveFilePath([filePath], pack.directories.bin));
                    let result = await compiler.compile();
                    return resolve(result.script);
                }
                resolve('');
            }
            else {
                fs_1.default.readFile(filePath, 'utf8', (err, result) => {
                    if (err)
                        resolve('');
                    else
                        resolve(result);
                });
            }
        }
        catch (err) {
            resolve('');
        }
    });
}
;
async function getPackage(filePath) {
    try {
        let text = await getScript(filePath + '/package.json');
        if (text)
            return JSON.parse(text);
    }
    catch (err) {
        return {};
    }
}
;
function getPackageDir(pack) {
    if (pack[0] != '/')
        pack = require.resolve(pack);
    let dir = path_1.default.dirname(pack);
    if (fs_1.default.existsSync(path_1.default.resolve(dir, 'package.json')))
        return dir;
    else
        return getPackageDir(dir);
}
;
async function getPackageScript(packName, pack) {
    let result;
    let packPath = '';
    if (!pack) {
        pack = {};
        if (packName.startsWith('@ijstech/')) {
            packName = packName.slice(9);
            packPath = resolveFilePath([__dirname, '../..'], packName, true);
        }
        ;
        if (!packPath)
            packPath = getPackageDir(packName);
    }
    else if (pack) {
        if (pack.script && pack.script.startsWith('file:'))
            packPath = resolveFilePath([RootPath], pack.script.substring(5), true);
        else if (pack.script)
            return pack.script;
        else
            packPath = getPackageDir(packName);
    }
    ;
    if (packPath) {
        let p = await getPackage(packPath);
        if (p) {
            let libPath = resolveFilePath([packPath], p.plugin || p.browser || p.main || 'index.js');
            if (libPath) {
                let script = await getScript(libPath);
                pack.script = script;
                return script;
            }
        }
        ;
    }
    ;
}
exports.getPackageScript = getPackageScript;
;
function loadModule(script, name) {
    LoadingPackageName = name;
    var m = new module.constructor();
    m.filename = name;
    m._compile(script, name || 'index');
    LoadingPackageName = '';
    return Modules[name || 'index'];
}
exports.loadModule = loadModule;
;
function cloneObject(value) {
    if (value)
        return JSON.parse(JSON.stringify(value));
    else
        return;
}
;
function RouterRequest(ctx) {
    return {
        method: ctx.method,
        hostname: ctx.hostname || '',
        path: ctx.path || '',
        url: ctx.url || '',
        origUrl: ctx.origUrl || '',
        ip: ctx.ip || '',
        type: ctx.request.type,
        query: cloneObject(ctx.request.query),
        params: cloneObject(ctx.params),
        body: cloneObject(ctx.request.body),
        cookie: function (name) {
            return ctx.cookies.get(name);
        },
        header: function (name) {
            return ctx.get(name);
        }
    };
}
;
function RouterResponse(ctx) {
    return {
        statusCode: 200,
        cookie: function (name, value, option) {
            ctx.cookies.set(name, value, option);
        },
        end: function (value, contentType) {
            if (!contentType && typeof (value) == 'object')
                contentType = 'application/json';
            ctx.response.set('Content-Type', contentType || 'text/plain');
            ctx.body = value;
        },
        header: function (name, value) {
            ctx.set(name, value);
        }
    };
}
;
;
;
;
;
;
class PluginVM {
    constructor(options) {
        this.options = options;
        this.vm = new vm_1.VM({
            logging: true,
            memoryLimit: options.memoryLimit,
            timeLimit: options.timeLimit
        });
    }
    ;
    async setup() {
        await this.loadDependencies();
        this.vm.injectGlobalScript(this.options.script);
        return;
    }
    ;
    async loadDependencies() {
        if (this.options.plugins && this.options.plugins.db) {
            let script = await getPackageScript('@ijstech/pdm');
            if (script)
                this.vm.injectGlobalPackage('@ijstech/pdm', script);
        }
        ;
        if (this.options.dependencies) {
            for (let packname in this.options.dependencies) {
                let pack = this.options.dependencies[packname];
                let script = await getPackageScript(packname, pack);
                if (script) {
                    this.vm.injectGlobalPackage(packname, script);
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
class RouterPluginVM extends PluginVM {
    async setup() {
        await super.setup();
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];            
            global.$$router = new module.default();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$init){
                        if (global.$$router.init){
                            let data = global.$$data;
                            if (data)
                                data = JSON.parse(data);
                            try{
                                global.$$router.init(global.$$session, data);
                            }
                            catch(err){}
                        }
                    }
                    else{
                        await global.$$router.route(global.$$session, global.$$request, global.$$response);
                        return true;
                    }
                }
                finally{
                    delete global.$$data;
                    delete global.$$init;
                }
            }
            catch(err){
                return false;
            };
        `;
        return;
    }
    ;
    async init(session, params) {
        this.vm.injectGlobalValue('$$init', true);
        if (params != null)
            this.vm.injectGlobalValue('$$data', JSON.stringify(params));
        await this.vm.execute();
    }
    ;
    async route(session, request, response) {
        this.vm.injectGlobalValue('$$request', request);
        this.vm.injectGlobalValue('$$response', response);
        let result = await this.vm.execute();
        if (result !== true) {
            response.statusCode = 500;
            response.end('');
        }
        ;
        return true;
    }
    ;
}
;
class WorkerPluginVM extends PluginVM {
    async setup() {
        await super.setup();
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];            
            global.$$worker = new module.default();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$init){
                        if (global.$$worker.init){
                            let data = global.$$data;
                            if (data)
                                data = JSON.parse(data);
                            try{
                                global.$$worker.init(global.$$session, data);
                            }
                            catch(err){}
                        }
                    }
                    else{
                        let data = global.$$data;
                        if (data)
                            data = JSON.parse(data);
                        let result = await global.$$worker.process(global.$$session, data);                        
                        return result;
                    }
                }
                finally{
                    delete global.$$init;
                    delete global.$$data;
                }
            }
            catch(err){
                return false;
            };
        `;
        return true;
    }
    ;
    async init(session, params) {
        this.vm.injectGlobalValue('$$init', true);
        if (params != null)
            this.vm.injectGlobalValue('$$data', JSON.stringify(params));
        await this.vm.execute();
    }
    ;
    async message(session, channel, msg) {
        this.vm.injectGlobalValue('$$data', JSON.stringify({ channel, msg }));
        let result = await this.vm.execute();
        return result;
    }
    ;
    async process(session, data) {
        if (data != null)
            this.vm.injectGlobalValue('$$data', JSON.stringify(data));
        let result = await this.vm.execute();
        return result;
    }
    ;
}
;
function Session(options) {
    return {
        params: options.params,
        plugins: {}
    };
}
;
class Plugin {
    constructor(options) {
        this.options = options;
    }
    ;
    async addPackage(packName, script) {
        await this.createPlugin();
        if (!script) {
            script = await getPackageScript(packName);
        }
        loadModule(script, packName);
    }
    async createPlugin() {
        if (!this.plugin) {
            if (this.options.isolated === false)
                this.plugin = await this.createModule();
            else {
                this.plugin = await this.createVM();
                this.vm = this.plugin.vm;
            }
            ;
            for (let v in this.options.plugins) {
                if (v == 'db') {
                    let m = require('@ijstech/pdm');
                    m.loadPlugin(this, this.options.plugins.db, this.plugin.vm);
                    break;
                }
                ;
            }
            ;
        }
        ;
    }
    ;
    createVM() {
        return;
    }
    ;
    async createModule() {
        for (let v in this.options.plugins) {
            if (v == 'db') {
                let script = await getPackageScript('@ijstech/pdm');
                if (script)
                    loadModule(script, '@ijstech/pdm');
                break;
            }
            ;
        }
        ;
        if (this.options.dependencies) {
            for (let packname in this.options.dependencies) {
                let pack = this.options.dependencies[packname];
                let script = await getPackageScript(packname, pack);
                if (script)
                    loadModule(script, packname);
            }
            ;
        }
        ;
        if (!this.options.script) {
            if (this.options.github) {
                this.options.script = await github_1.default.getFile({
                    org: this.options.github.org,
                    repo: this.options.github.repo,
                    token: this.options.github.token,
                    filePath: 'lib/index.js'
                });
            }
            else if (this.options.scriptPath)
                this.options.script = await getScript(this.options.scriptPath);
        }
        ;
        let script = this.options.script;
        if (script) {
            let module = loadModule(script);
            if (module) {
                if (module.default)
                    module = module.default;
                return new module(this.options);
            }
            ;
        }
        ;
    }
    ;
    async init(params) {
        try {
            await this.createPlugin();
            await this.plugin.init(this.session, params);
        }
        catch (err) {
            console.dir(err);
        }
    }
    ;
    get session() {
        if (this._session)
            return this._session;
        let result = Session(this.options);
        let script = '';
        this._session = result;
        if (this.options.plugins) {
            for (let v in this.options.plugins) {
                try {
                    let m = require('@ijstech/' + v);
                    let plugin = m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                    if (typeof (plugin) == 'string')
                        script += plugin;
                    else if (plugin)
                        result.plugins[v] = plugin;
                    if (v == 'db') {
                        let m = require('@ijstech/pdm');
                        let plugin = m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                        if (typeof (plugin) == 'string')
                            script += plugin;
                    }
                    ;
                }
                catch (err) {
                    console.dir(err);
                }
                ;
            }
            ;
        }
        ;
        if (this.plugin.vm)
            this.plugin.vm.injectGlobalValue('$$session', result, script);
        return result;
    }
    ;
}
;
class Router extends Plugin {
    constructor(options) {
        super(options);
    }
    ;
    async createVM() {
        super.createVM();
        if (!this.options.script && this.options.scriptPath)
            this.options.script = await getScript(this.options.scriptPath);
        let result = new RouterPluginVM(this.options);
        await result.setup();
        return result;
    }
    ;
    async route(ctx, baseUrl) {
        ctx.origUrl = ctx.url;
        ctx.url = ctx.url.slice(this.options.baseUrl.length);
        if (!ctx.url.startsWith('/'))
            ctx.url = '/' + ctx.url;
        let result;
        await this.createPlugin();
        if (this.plugin) {
            result = await this.plugin.route(this.session, RouterRequest(ctx), RouterResponse(ctx));
            return result;
        }
    }
    ;
}
exports.Router = Router;
;
class Worker extends Plugin {
    constructor(options) {
        super(options);
    }
    ;
    async createVM() {
        super.createVM();
        if (!this.options.script && this.options.scriptPath)
            this.options.script = await getScript(this.options.scriptPath);
        let result = new WorkerPluginVM(this.options);
        await result.setup();
        return result;
    }
    ;
    async message(channel, msg) {
        try {
            await this.createPlugin();
            await this.plugin.process(this.session, { channel, msg });
        }
        catch (err) {
            console.dir(err);
        }
    }
    async process(data) {
        let result;
        this.options.processing = true;
        try {
            await this.createPlugin();
            result = await this.plugin.process(this.session, data);
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            this.options.processing = false;
        }
        ;
        return result;
    }
    ;
}
exports.Worker = Worker;
;
