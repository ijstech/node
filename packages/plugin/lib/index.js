"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = exports.Router = exports.LocalTaskManager = exports.BigNumber = void 0;
exports.resolveFilePath = resolveFilePath;
exports.getPackageScript = getPackageScript;
exports.loadModule = loadModule;
exports.RouterRequest = RouterRequest;
exports.RouterResponse = RouterResponse;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vm_1 = require("@ijstech/vm");
const types_1 = require("@ijstech/types");
Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return types_1.BigNumber; } });
const tsc_1 = require("@ijstech/tsc");
var localTaskManager_1 = require("./localTaskManager");
Object.defineProperty(exports, "LocalTaskManager", { enumerable: true, get: function () { return localTaskManager_1.LocalTaskManager; } });
;
const RootPath = process.cwd();
let Modules = {};
let LoadingPackageName = '';
let LastDefineModule;
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
        LastDefineModule = exports;
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
;
function getScript(filePath, modulePath) {
    return new Promise(async (resolve) => {
        try {
            if (modulePath)
                filePath = path_1.default.join(modulePath, filePath);
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
        else if (!pack.dts)
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
;
function loadModule(script, name) {
    global.define.amd = true;
    try {
        LoadingPackageName = name;
        LastDefineModule = null;
        var m = new module.constructor();
        m.filename = name;
        m._compile(script, name || 'index');
        LoadingPackageName = '';
    }
    finally {
        global.define.amd = undefined;
    }
    ;
    return Modules[name || 'index'] || LastDefineModule;
}
;
function cloneObject(value) {
    if (value)
        return JSON.parse(JSON.stringify(value));
    else
        return;
}
;
;
function RouterRequest(ctx) {
    if (isContext(ctx)) {
        return {
            method: ctx.method,
            hostname: ctx.hostname || '',
            path: ctx.path || '/',
            url: ctx.url || '/',
            origUrl: ctx.origUrl || ctx.url || '/',
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
    else if (ctx) {
        return {
            method: ctx.method || 'GET',
            hostname: ctx.hostname || '',
            path: ctx.path || '/',
            url: ctx.url || '/',
            origUrl: ctx.origUrl || ctx.url || '/',
            ip: ctx.ip || '',
            type: ctx.type,
            query: ctx.query,
            params: ctx.params,
            body: ctx.body,
            cookie: function (name) {
                return ctx.cookies ? ctx.cookies[name] : null;
            },
            header: function (name) {
                return ctx.headers ? ctx.headers[name] : null;
            }
        };
    }
}
;
function isContext(object) {
    return typeof (object.cookies?.set) == 'function';
}
function RouterResponse(ctx) {
    if (isContext(ctx)) {
        ctx.statusCode = 200;
        return {
            statusCode: function (value) {
                ctx.statusCode = value;
            },
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
    else if (ctx) {
        ctx.statusCode = 200;
        return {
            statusCode: function (value) {
                ctx.statusCode = value;
            },
            cookie: function (name, value, option) {
                ctx.cookies = ctx.cookies || {};
                ctx.cookies[name] = {
                    value,
                    option
                };
            },
            end: function (value, contentType) {
                ctx.contentType = contentType || 'application/json';
                ctx.body = value;
            },
            header: function (name, value) {
                ctx.header = ctx.header || {};
                ctx.header[name] = value;
            }
        };
    }
}
;
;
;
;
;
function getTaskManagerPlugin(taskManager) {
    let plugin = {
        completeStep: async function (taskId, stepName) {
            return await taskManager.completeStep(taskId, stepName);
        },
        completeTask: async function (taskId) {
            return await taskManager.completeTask(taskId);
        },
        loadTask: async function (taskId) {
            let result = await taskManager.loadTask(taskId);
            return JSON.stringify(result);
        },
        resumeTask: async function (taskId) {
            return await taskManager.resumeTask(taskId);
        },
        startTask: async function (options, id) {
            return await taskManager.startTask(JSON.stringify(options), id);
        }
    };
    return plugin;
}
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
    get id() {
        return this.options.id;
    }
    ;
    async setup() {
        if (this.options.taskManager) {
            this.vm.injectGlobalObject('$$taskManager', getTaskManagerPlugin(this.options.taskManager), '');
        }
        this.vm.injectGlobalScript(`
define("@ijstech/plugin", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.task = exports.step = void 0;

//copy from lib/decorators.js ==>
exports.step = step;
exports.task = task;
function step(config) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor?.value;
        let stepName = propertyKey.toString();
        descriptor.value = async function (...args) {
            let taskManager = global['$$taskManager'];
            const taskId = this.taskId;
            if (taskManager) {
                if (!taskId) {
                    throw new Error('Task ID is not set.');
                }
                ;
                if (taskManager) {
                    let taskdata = await taskManager.loadTask(taskId);
                    const task = JSON.parse(taskdata);
                    if (task?.completedSteps.includes(stepName)) {
                        return;
                    }
                    ;
                }
                ;
            }
            ;
            let attempt = 0;
            let delay = config?.delay || 1000;
            let retryOnFailure;
            let delayMultiplier = config?.delayMultiplier || 2;
            if (config?.retryOnFailure !== false && config?.maxAttempts)
                retryOnFailure = true;
            else
                retryOnFailure = config?.retryOnFailure || false;
            let maxAttempts = config?.maxAttempts || 3;
            while (attempt < maxAttempts) {
                try {
                    let result = await originalMethod.apply(this, args);
                    if (taskManager)
                        await taskManager.completeStep(taskId, stepName);
                    return result;
                }
                catch (error) {
                    if (!retryOnFailure) {
                        throw error;
                    }
                    ;
                    attempt++;
                    if (attempt < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= delayMultiplier;
                    }
                    else {
                        throw error;
                    }
                    ;
                }
                ;
            }
            ;
        };
        return descriptor;
    };
}
;
function task(options) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (taskId) {
            let taskManager = global.$$taskManager;
            if (taskManager) {
                let task;
                if (taskId) {
                    let data = await taskManager.loadTask(taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data);
                    else
                        task = data;
                }
                if (!task) {
                    const data = await taskManager.startTask(options, taskId);
                    if (typeof data == 'string')
                        task = JSON.parse(data);
                    else
                        task = data;
                    taskId = task.id;
                    this.taskId = task.id;
                }
                else {
                    this.taskId = task.id;
                    await taskManager.resumeTask(task.id);
                }
                ;
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    await taskManager.completeTask(this.taskId);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
            else {
                try {
                    let result = await originalMethod.apply(this, [taskId]);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
        };
        return descriptor;
    };
};
//<<===   
    
});`);
        await this.loadDependencies();
        this.vm.injectGlobalScript(this.options.script);
        return;
    }
    ;
    async loadPackage(name, pack) {
        let script = await getPackageScript(name, pack);
        if (script)
            this.vm.injectGlobalPackage(name, script);
        else
            throw new Error('#Failed to load package: ' + name);
    }
    ;
    async loadDependencies() {
        if (this.options.plugins) {
            if (this.options.plugins.db)
                await this.loadPackage('@ijstech/pdm');
            if (this.options.plugins.wallet) {
                await this.loadPackage('bignumber.js');
                await this.loadPackage('@ijstech/wallet');
                await this.loadPackage('@ijstech/eth-contract');
            }
            ;
            if (this.options.plugins.fetch) {
                await this.loadPackage('@ijstech/fetch');
            }
        }
        ;
        if (this.options.dependencies) {
            for (let packname in this.options.dependencies) {
                if (packname != '@ijstech/plugin') {
                    let pack = this.options.dependencies[packname];
                    await this.loadPackage(packname, pack);
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
            let module = global._$$modules['index'] || global._$$currModule;   
            let fn = module.default['router'] || module.default;
            global.$$router = new fn();
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
                        let result = await global.$$router.route(global.$$session, global.$$request, global.$$response);
                        return result;
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
        let globalValues = {
            '$$init': true
        };
        if (params != null)
            globalValues['$$data'] = JSON.stringify(params);
        await this.vm.execute(globalValues);
    }
    ;
    async route(session, request, response) {
        try {
            let result = await this.vm.execute({
                '$$request': request,
                '$$response': response
            });
            if (result === false) {
                response.statusCode(500);
                return false;
            }
            ;
            return true;
        }
        catch (err) {
            console.dir('RouterPluginVM exception');
            console.dir(err);
            response.statusCode(500);
            return false;
        }
        ;
    }
    ;
}
;
class WorkerPluginVM extends PluginVM {
    async setup() {
        await super.setup();
        this.vm.injectGlobalScript(`            
            let module = global._$$modules['index'] || global._$$currModule
            let fn = module.default['worker'] || module.default;
            global.$$worker = new fn();
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
        let globalValues = {
            '$$init': true
        };
        if (params != null)
            globalValues['$$data'] = JSON.stringify(params);
        await this.vm.execute(globalValues);
    }
    ;
    async message(session, channel, msg) {
        let result = await this.vm.execute({
            '$$data': JSON.stringify({ channel, msg })
        });
        return result;
    }
    ;
    async process(session, data) {
        try {
            let globalValues;
            if (data != null) {
                globalValues = {
                    '$$data': JSON.stringify(data)
                };
            }
            ;
            let result = await this.vm.execute(globalValues);
            return result;
        }
        catch (err) {
            console.dir('WorkerPluginVM exception');
            console.dir(err);
        }
        ;
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
    get id() {
        return this.options.id;
    }
    get domain() {
        return this.options.domain;
    }
    async addPackage(packName, script) {
        await this.createPlugin();
        if (!script) {
            script = await getPackageScript(packName);
        }
        loadModule(script, packName);
    }
    async createPlugin() {
        if (!this.plugin) {
            if (!this.options.script && this.options.scriptPath) {
                if (this.options.scriptPath.endsWith('.js'))
                    this.options.script = await getScript(this.options.scriptPath, this.options.modulePath);
                else {
                    let result = await (0, tsc_1.PluginScript)(this.options);
                    this.options.dependencies = this.options.dependencies || {};
                    for (let n in result.dependencies) {
                        if (result.dependencies[n].script)
                            this.options.dependencies[n] = result.dependencies[n];
                    }
                    this.options.script = result.script;
                }
            }
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
                    await m.loadPlugin(this, this.options.plugins.db);
                    break;
                }
                ;
            }
            ;
            for (let v in this.options.dependencies) {
                if (['@ijstech/crypto'].indexOf(v) > -1) {
                    let m = require(v);
                    await m.loadPlugin(this);
                }
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
    async loadDependenceModule(name) {
        if (!Modules[name]) {
            let script = await getPackageScript(name);
            if (script)
                loadModule(script, name);
        }
        ;
    }
    ;
    async createModule() {
        if (this.options.plugins?.db) {
            await this.loadDependenceModule('@ijstech/pdm');
        }
        ;
        if (this.options.plugins?.wallet) {
            await this.loadDependenceModule('bignumber.js');
            await this.loadDependenceModule('@ijstech/wallet');
            await this.loadDependenceModule('@ijstech/eth-contract');
        }
        ;
        if (this.options.plugins?.fetch) {
            await this.loadDependenceModule('@ijstech/fetch');
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
        let script = this.options.script;
        if (script) {
            let module = loadModule(script);
            if (module) {
                if (module.default)
                    module = module.default[this.pluginType] || module.default;
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
            await this.plugin.init(await this.getSession(), params);
        }
        catch (err) {
            console.dir(err);
        }
    }
    ;
    async getSession(taskId) {
        if (this._session)
            return this._session;
        let result = Session(this.options);
        if (taskId)
            result.taskId = taskId;
        let script = '';
        this._session = result;
        if (this.options.plugins) {
            for (let v in this.options.plugins) {
                try {
                    let m = require('@ijstech/' + v);
                    let plugin = await m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                    if (typeof (plugin) == 'string')
                        script += plugin;
                    else if (plugin)
                        result.plugins[v] = plugin;
                    if (v == 'db') {
                        let m = require('@ijstech/pdm');
                        let plugin = await m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
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
        this.pluginType = 'worker';
    }
    ;
    async createVM() {
        super.createVM();
        let result = new RouterPluginVM(this.options);
        await result.setup();
        return result;
    }
    ;
    async route(ctx, request, response) {
        if (ctx) {
            ctx.origUrl = ctx.url;
            ctx.url = ctx.url.slice(this.options.baseUrl.length);
            if (!ctx.url.startsWith('/'))
                ctx.url = '/' + ctx.url;
        }
        let result;
        await this.createPlugin();
        if (this.plugin) {
            request = request || RouterRequest(ctx);
            response = response || RouterResponse(ctx);
            if (request && response)
                result = await this.plugin.route(await this.getSession(), request, response);
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
        this.pluginType = 'worker';
    }
    ;
    async createVM() {
        super.createVM();
        let result = new WorkerPluginVM(this.options);
        await result.setup();
        return result;
    }
    ;
    async message(channel, msg) {
        try {
            await this.createPlugin();
            await this.plugin.process(await this.getSession(), { channel, msg });
        }
        catch (err) {
            console.dir(err);
        }
    }
    async process(data, taskId) {
        let result;
        this.options.processing = true;
        try {
            await this.createPlugin();
            let session = await this.getSession(taskId);
            result = await this.plugin.process(session, data);
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
