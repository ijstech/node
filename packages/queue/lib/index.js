"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
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
        this.options = options;
    }
    ;
    async addDomainRouter(domain, router) {
        if (!this.packageManager)
            this.packageManager = new package_1.PackageManager();
        this.packageManager.addDomainRouter(domain, router);
    }
    ;
    async addDomainWorker(domain, worker) {
        if (!this.packageManager)
            this.packageManager = new package_1.PackageManager();
        this.domainPackage[domain] = this.domainPackage[domain] || {};
        this.domainPackage[domain][worker.packagePath] = worker;
    }
    ;
    runWorker(worker) {
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
            let queue = jobQueue_1.getJobQueue({
                connection: this.options.connection,
                jobQueue: this.options.jobQueue
            });
            queue.processJob(async (job) => {
                var _a, _b, _c, _d, _e, _f, _g;
                if ((_a = job.data) === null || _a === void 0 ? void 0 : _a.worker) {
                    let worker = job.data.worker;
                    let pack;
                    if (this.domainPackage[worker.domain])
                        pack = this.domainPackage[worker.domain][worker.packagePath];
                    if (pack) {
                        let module = await this.packageManager.getPackageWorker(pack, worker.workerName);
                        if (module) {
                            let plugins = {};
                            if ((_b = module.plugins) === null || _b === void 0 ? void 0 : _b.cache)
                                plugins.cache = pack.options.plugins.cache;
                            if ((_c = module.plugins) === null || _c === void 0 ? void 0 : _c.db)
                                plugins.db = { default: pack.options.plugins.db };
                            let plugin = new plugin_1.Worker({
                                dependencies: module.moduleScript.dependencies,
                                script: module.moduleScript.script,
                                params: worker.params,
                                plugins: plugins
                            });
                            let result = await plugin.process(worker.params);
                        }
                    }
                    else
                        console.error('Domain package not found: ' + worker.domain);
                    return true;
                }
                else if (this.packageManager && ((_e = (_d = job.data) === null || _d === void 0 ? void 0 : _d.request) === null || _e === void 0 ? void 0 : _e.hostname)) {
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
                                    if ((_f = route.plugins) === null || _f === void 0 ? void 0 : _f.db)
                                        plugins.db = { default: options.plugins.db };
                                    if ((_g = route.plugins) === null || _g === void 0 ? void 0 : _g.cache)
                                        plugins.cache = options.plugins.cache;
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
