"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.Queue = exports.JobQueue = exports.getJobQueue = void 0;
const plugin_1 = require("@ijstech/plugin");
const message_1 = require("@ijstech/message");
const jobQueue_1 = require("./jobQueue");
Object.defineProperty(exports, "getJobQueue", { enumerable: true, get: function () { return jobQueue_1.getJobQueue; } });
Object.defineProperty(exports, "JobQueue", { enumerable: true, get: function () { return jobQueue_1.JobQueue; } });
const package_1 = require("@ijstech/package");
;
;
class Queue {
    constructor(options) {
        this.domainPackage = {};
        options = options || {};
        this.packageManager = options.packageManager;
        this.options = options;
        for (let domain in options.domains) {
            let domainOptions = options.domains[domain];
            if (domainOptions.routers) {
                for (let i = 0; i < domainOptions.routers.length; i++)
                    this.addDomainRouter(domain, domainOptions.routers[i]);
            }
            ;
            if (domainOptions.workers) {
                for (let i = 0; i < domainOptions.workers.length; i++)
                    this.addDomainWorker(domain, domainOptions.workers[i]);
            }
            ;
        }
        ;
    }
    ;
    async addDomainRouter(domain, router) {
        if (!this.packageManager)
            this.packageManager = new package_1.PackageManager({
                storage: this.options.storage
            });
        this.packageManager.addDomainRouter(domain, router);
    }
    ;
    async addDomainWorker(domain, worker) {
        if (!this.packageManager)
            this.packageManager = new package_1.PackageManager({
                storage: this.options.storage
            });
        this.domainPackage[domain] = this.domainPackage[domain] || {};
        this.domainPackage[domain][worker.packagePath] = worker;
    }
    ;
    runWorker(worker) {
        if (!worker.plugin)
            worker.plugin = new plugin_1.Worker(worker);
        worker.queue = jobQueue_1.getJobQueue(worker);
        if (worker.plugins && worker.plugins.message) {
            worker.message = new message_1.Message(worker.plugin, worker.plugins.message);
        }
        worker.queue.processJob(async (job) => {
            try {
                let result = await worker.plugin.process(job.data);
                return result;
            }
            catch (err) {
                console.trace(err);
            }
        });
    }
    ;
    start() {
        if (this.started)
            return;
        this.started = true;
        if (this.options.jobQueue && !this.options.disabled && this.options.connection) {
            this.queue = jobQueue_1.getJobQueue({
                connection: this.options.connection,
                jobQueue: this.options.jobQueue
            });
            this.queue.processJob(async (job) => {
                if (job.data?.worker) {
                    let worker = job.data.worker;
                    let pack;
                    if (this.domainPackage[worker.domain])
                        pack = this.domainPackage[worker.domain][worker.packagePath];
                    if (pack) {
                        let module = await this.packageManager.getPackageWorker(pack, worker.workerName);
                        if (module.moduleScript.errors)
                            console.error(module.moduleScript.errors);
                        if (module) {
                            let plugins = {};
                            if (module.plugins?.cache)
                                plugins.cache = pack.options.plugins.cache;
                            if (module.plugins?.db)
                                plugins.db = { default: pack.options.plugins.db };
                            if (module.plugins?.wallet)
                                plugins.wallet = pack.options.plugins.wallet;
                            if (module.plugins?.fetch)
                                plugins.fetch = pack.options.plugins.fetch || { methods: ['GET'] };
                            let params = {};
                            for (let v in module.params)
                                params[v] = module.params[v];
                            for (let v in worker.params)
                                params[v] = worker.params[v];
                            let plugin = new plugin_1.Worker({
                                dependencies: module.moduleScript.dependencies,
                                script: module.moduleScript.script,
                                params: params,
                                plugins: plugins
                            });
                            let result = await plugin.process(worker.params);
                        }
                    }
                    else
                        console.error('Domain package not found: ' + worker.domain);
                    return true;
                }
                else if (this.packageManager && job.data?.request?.hostname) {
                    let request = job.data.request;
                    let { options, pack, params, route } = await this.packageManager.getDomainRouter({
                        domain: request.hostname,
                        method: request.method,
                        url: request.url
                    });
                    if (route) {
                        let plugin = route._plugin;
                        if (!plugin) {
                            let script = await pack.getScript(route.module);
                            if (script) {
                                let plugins = {};
                                if (options && options.plugins) {
                                    if (route.plugins?.db)
                                        plugins.db = { default: options.plugins.db };
                                    if (route.plugins?.cache)
                                        plugins.cache = options.plugins.cache;
                                    if (route.plugins?.wallet)
                                        plugins.wallet = options.plugins.wallet;
                                }
                                ;
                                let method = request.method;
                                plugin = new plugin_1.Router({
                                    baseUrl: route.url,
                                    methods: [method],
                                    script: script.script,
                                    params: route.params,
                                    dependencies: script.dependencies,
                                    plugins: plugins
                                });
                                route._plugin = plugin;
                            }
                            ;
                        }
                        ;
                        if (plugin) {
                            let result = {};
                            request.params = params;
                            await plugin.route(null, plugin_1.RouterRequest(request), plugin_1.RouterResponse(result));
                            return result;
                        }
                        ;
                    }
                    ;
                }
                ;
            });
        }
        ;
        if (this.options.workers) {
            for (let i = 0; i < this.options.workers.length; i++) {
                let worker = this.options.workers[i];
                if (!worker.disabled)
                    this.runWorker(worker);
            }
            ;
        }
    }
    ;
    async stop() {
        if (!this.started)
            return;
        await this.queue.stop();
        if (this.options.workers) {
            for (let i = 0; i < this.options.workers.length; i++) {
                let worker = this.options.workers[i];
                if (worker.queue) {
                    await worker.queue.stop();
                    worker.queue = null;
                }
                ;
            }
            ;
        }
        ;
        this.started = false;
    }
    ;
}
exports.Queue = Queue;
;
function loadPlugin(plugin, options, vm) {
    return {
        createJob: async function (queue, data, waitForResult, timeout, retries) {
            if (typeof (queue) == 'number')
                queue = options.queues[queue];
            if (queue && options.queues.indexOf(queue) >= 0) {
                let q = jobQueue_1.getJobQueue({
                    jobQueue: queue,
                    connection: options.connection
                });
                let job = await q.createJob(data, waitForResult, {
                    timeout,
                    retries
                });
                if (vm)
                    return JSON.stringify(job);
                else
                    return job;
            }
            ;
        }
    };
}
exports.loadPlugin = loadPlugin;
;
exports.default = loadPlugin;
