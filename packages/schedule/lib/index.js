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
exports.Scheduler = void 0;
const plugin_1 = require("@ijstech/plugin");
const cron_parser_1 = __importDefault(require("cron-parser"));
const package_1 = require("@ijstech/package");
const queue_1 = require("@ijstech/queue");
;
;
;
;
;
class Scheduler {
    constructor(options) {
        this.domainWorkers = {};
        this.jobs = [];
        this.options = options || {};
        if (this.options.worker)
            this.queue = new queue_1.JobQueue({
                jobQueue: this.options.worker.jobQueue,
                connection: this.options.worker.connection
            });
        for (let domain in this.options.domains) {
            let domainWorkers = this.options.domains[domain];
            for (let i = 0; i < domainWorkers.length; i++) {
                this.addDomainWorker(domain, domainWorkers[i]);
            }
        }
        this.options.jobs = this.options.jobs || [];
        for (let i = 0; i < this.options.jobs.length; i++)
            this.addJob(this.options.jobs[i], this.options.module);
    }
    ;
    async addDomainWorker(domain, worker) {
        var _a;
        if (!this.packageManager) {
            this.packageManager = new package_1.PackageManager({
                storage: this.options.storage
            });
        }
        ;
        this.domainWorkers[domain] = this.domainWorkers[domain] || [];
        let domainWorkers = this.domainWorkers[domain];
        domainWorkers.push(worker);
        for (let i = 0; i < ((_a = worker.schedules) === null || _a === void 0 ? void 0 : _a.length); i++) {
            let schedule = worker.schedules[i];
            let id = schedule.id || `${domain}:${schedule.worker}:${i}`;
            this.jobs.push({
                id: id,
                domain: domain,
                cron: schedule.cron,
                pack: worker.pack,
                workerName: schedule.worker,
                params: schedule.params
            });
        }
        ;
    }
    ;
    addJob(job, module) {
        if (module)
            job.modulePath = module;
        this.jobs.push(job);
    }
    ;
    async start() {
        if (this.started)
            return;
        for (let domain in this.domainWorkers) {
            let domainWorkers = this.domainWorkers[domain];
            for (let i = 0; i < domainWorkers.length; i++) {
                let worker = domainWorkers[i];
                if (!worker.schedules) {
                    try {
                        let scconfig = JSON.parse(await this.packageManager.getFileContent(worker.pack.packagePath, 'scconfig.json'));
                        worker.schedules = (scconfig === null || scconfig === void 0 ? void 0 : scconfig.schedules) || [];
                    }
                    catch (err) {
                        worker.schedules = [];
                    }
                    ;
                    for (let i = 0; i < worker.schedules.length; i++) {
                        let schedule = worker.schedules[i];
                        let id = schedule.id || `${domain}:${schedule.worker}:${i}`;
                        if (id) {
                            this.jobs.push({
                                id: id,
                                domain: domain,
                                cron: schedule.cron,
                                pack: worker.pack,
                                workerName: schedule.worker,
                                params: schedule.params
                            });
                        }
                    }
                    ;
                }
            }
        }
        ;
        if (this.jobs.length == 0)
            return;
        this.started = true;
        this.timer = setInterval(() => {
            this.processJobs();
        }, 500);
    }
    ;
    stop() {
        clearInterval(this.timer);
        this.started = false;
    }
    ;
    async runJob(job) {
        var _a, _b, _c;
        if (!job.next) {
            job.next = cron_parser_1.default.parseExpression(job.cron).next();
            console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id ? job.id : ''));
        }
        ;
        if (job.next.getTime() < new Date().getTime()) {
            job.processing = true;
            try {
                if (job.pack) {
                    if (this.queue) {
                        let result = await this.queue.createJob({
                            worker: {
                                domain: job.domain,
                                packagePath: job.pack.packagePath,
                                workerName: job.workerName,
                                params: job.params
                            }
                        }, false, {
                            id: job.id
                        });
                    }
                    else {
                        if (!job.plugin) {
                            let worker = await this.packageManager.getPackageWorker(job.pack, job.workerName);
                            let plugins = {};
                            if ((_a = worker.plugins) === null || _a === void 0 ? void 0 : _a.cache)
                                plugins.cache = job.pack.options.plugins.cache;
                            if ((_b = worker.plugins) === null || _b === void 0 ? void 0 : _b.db)
                                plugins.db = { default: job.pack.options.plugins.db };
                            if ((_c = worker.plugins) === null || _c === void 0 ? void 0 : _c.wallet)
                                plugins.wallet = job.pack.options.plugins.wallet;
                            job.plugin = new plugin_1.Worker({
                                plugins: plugins,
                                dependencies: worker.moduleScript.dependencies,
                                script: worker.moduleScript.script,
                                params: worker.params
                            });
                        }
                        ;
                        let result = await job.plugin.process(job.params);
                    }
                }
                else {
                    if (!job.plugin) {
                        job.plugin = new plugin_1.Worker(job);
                        await job.plugin.init(job.params);
                    }
                    ;
                    await job.plugin.process(job.params);
                }
                ;
                job.next = cron_parser_1.default.parseExpression(job.cron).next();
                console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id ? job.id : ''));
            }
            finally {
                job.processing = false;
            }
            ;
        }
        ;
    }
    ;
    processJobs() {
        this.jobs.forEach(async (job) => {
            if (!job.disabled && !job.processing) {
                this.runJob(job);
            }
            ;
        });
    }
    ;
}
exports.Scheduler = Scheduler;
;
