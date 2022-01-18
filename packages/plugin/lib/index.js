"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = exports.Router = exports.loadScript = exports.getScript = exports.resolveFilePath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vm_1 = require("@ijstech/vm");
const RootPath = path_1.default.dirname(require.main.filename);
let plugins = {};
global.define = function (id, deps, callback) {
    let result = [];
    for (let i = 0; i < deps.length; i++) {
        let dep = deps[i];
        if (dep == 'require')
            result.push(null);
        else if (dep == 'exports') {
            if (id) {
                plugins[id] = {};
                result.push(plugins[id]);
            }
            else
                result.push({});
        }
        else
            result.push(plugins[dep]);
    }
    let module = callback.apply(this, result);
    if (module)
        plugins[id] = module;
};
function resolveFilePath(rootPaths, filePath) {
    let rootPath = path_1.default.resolve(...rootPaths);
    let result = path_1.default.join(rootPath, filePath);
    return result.startsWith(rootPath) ? result : undefined;
}
exports.resolveFilePath = resolveFilePath;
;
function getScript(filePath) {
    return new Promise((resolve, reject) => {
        if (filePath.startsWith('./'))
            filePath = resolveFilePath([RootPath], filePath);
        fs_1.default.readFile(filePath, 'utf8', (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
}
exports.getScript = getScript;
;
function loadScript(script) {
    plugins = {};
    var m = new module.constructor();
    m._compile(script, 'index');
    return plugins['index'];
}
exports.loadScript = loadScript;
;
;
;
;
;
;
;
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
class RouterPluginVM {
    constructor(options) {
        this.options = options;
        this.vm = new vm_1.VM({
            logging: true,
            memoryLimit: options.memoryLimit,
            timeLimit: options.timeLimit
        });
        this.vm.injectGlobalScript(options.script);
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];            
            global.$$router = new module.default();
        `);
        this.vm.script = `
            try{
                await global.$$router.route(global.$$session, global.$$request, global.$$response);
                return true;
            }
            catch(err){
                return false;
            };
        `;
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
class WorkerPluginVM {
    constructor(options) {
        this.options = options;
        this.vm = new vm_1.VM({
            logging: true,
            memoryLimit: options.memoryLimit,
            timeLimit: options.timeLimit
        });
        this.vm.injectGlobalScript(options.script);
        this.vm.injectGlobalScript(`
            let module = global._$$modules['index'];            
            global.$$worker = new module.default();
        `);
        this.vm.script = `
            try{
                try{
                    if (global.$$message){
                        global.$$worker.message(global.$$session, global.$$message.channel, global.$$message.msg);
                    }
                    else{
                        let result = await global.$$worker.process(global.$$session, global.$$data);                        
                        return result;
                    }
                }
                finally{
                    delete global.$$message;
                }
            }
            catch(err){
                return false;
            };
        `;
    }
    ;
    async message(session, channel, msg) {
        this.vm.injectGlobalValue('$$message', { channel, msg });
        this.vm.execute();
    }
    ;
    async process(session, data) {
        if (data != null)
            this.vm.injectGlobalValue('$$data', data);
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
    async createPlugin() {
        if (!this.plugin) {
            if (this.options.isolated === false)
                this.plugin = await this.createModule();
            else
                this.plugin = await this.createVM();
        }
    }
    ;
    createVM() {
        return;
    }
    ;
    async createModule() {
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);
        let script = this.options.script;
        let module = loadScript(script);
        if (module) {
            if (module.default)
                module = module.default;
            return new module(this.options);
        }
    }
    ;
    get session() {
        if (this._session)
            return this._session;
        let result = Session(this.options);
        this._session = result;
        if (this.options.plugins) {
            for (let v in this.options.plugins) {
                try {
                    let m = require('@ijstech/' + v);
                    let plugin = m.loadPlugin(this, this.options.plugins[v], this.plugin.vm);
                    if (plugin)
                        result.plugins[v] = plugin;
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
            this.plugin.vm.injectGlobalValue('$$session', result);
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
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);
        return new RouterPluginVM(this.options);
    }
    ;
    async route(ctx) {
        ctx.origUrl = ctx.url;
        ctx.url = ctx.url.slice(this.options.baseUrl.length);
        if (!ctx.url.startsWith('/'))
            ctx.url = '/' + ctx.url;
        let result;
        await this.createPlugin();
        result = await this.plugin.route(this.session, RouterRequest(ctx), RouterResponse(ctx));
        return result;
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
        if (!this.options.script)
            this.options.script = await getScript(this.options.scriptPath);
        return new WorkerPluginVM(this.options);
    }
    ;
    async message(channel, msg) {
        try {
            await this.createPlugin();
            this.plugin.message(this.session, channel, msg);
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
exports.default = {
    getScript,
    loadScript,
    resolveFilePath
};
