"use strict";
/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = exports.parseCron = void 0;
const plugin_1 = require("@ijstech/plugin");
const cron_parser_1 = require("cron-parser");
const package_1 = require("@ijstech/package");
const queue_1 = require("@ijstech/queue");
function parseCron(expression) {
    let cron = cron_parser_1.parseExpression(expression);
    if (cron.hasNext())
        return new Date(cron.next().getTime());
    else
        return new Date('9999-01-01');
}
exports.parseCron = parseCron;
;
;
;
;
;
;
class Scheduler {
    constructor(options) {
        this.domainPackages = {};
        this.jobs = [];
        this.options = options || {};
        this.packageManager = options.packageManager;
        if (this.options.worker && this.options.worker.enabled !== false)
            this.queue = new queue_1.JobQueue({
                jobQueue: this.options.worker.jobQueue,
                connection: this.options.worker.connection
            });
        for (let domain in this.options.domains) {
            let domainWorkers = this.options.domains[domain];
            for (let i = 0; i < domainWorkers.length; i++) {
                this.addDomainPackage(domain, domainWorkers[i]);
            }
        }
        this.options.jobs = this.options.jobs || [];
        for (let i = 0; i < this.options.jobs.length; i++)
            this.addJob(this.options.jobs[i], this.options.module);
    }
    ;
    async addDomainPackage(domain, pack) {
        if (!this.packageManager) {
            this.packageManager = new package_1.PackageManager({
                storage: this.options.storage
            });
        }
        ;
        this.domainPackages[domain] = this.domainPackages[domain] || [];
        let domainPackages = this.domainPackages[domain];
        domainPackages.push(pack);
        for (let i = 0; i < pack.schedules?.length; i++) {
            let schedule = pack.schedules[i];
            let id = schedule.id || `${domain}:${schedule.worker}:${i}`;
            this.jobs.push({
                id: id,
                domain: domain,
                cron: schedule.cron,
                pack: pack,
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
        for (let domain in this.domainPackages) {
            let domainPackages = this.domainPackages[domain];
            for (let i = 0; i < domainPackages.length; i++) {
                let pack = domainPackages[i];
                if (!pack.schedules) {
                    try {
                        let scconfig = JSON.parse(await this.packageManager.getFileContent(pack.packagePath, 'scconfig.json'));
                        pack.schedules = scconfig?.schedules || [];
                    }
                    catch (err) {
                        pack.schedules = [];
                    }
                    ;
                    for (let i = 0; i < pack.schedules.length; i++) {
                        let schedule = pack.schedules[i];
                        let id = schedule.id || `${domain}:${schedule.worker}:${i}`;
                        if (id) {
                            this.jobs.push({
                                id: id,
                                domain: domain,
                                cron: schedule.cron,
                                pack: pack,
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
    async runJob(domain, workerName, params) {
        let domainPacks = this.domainPackages[domain];
        for (let i = 0; i < domainPacks?.length; i++) {
            let pack = domainPacks[i];
            for (let k = 0; k < pack.schedules?.length; k++) {
                let schedule = pack.schedules[k];
                if (schedule.worker == workerName) {
                    params = params || {};
                    for (let n in schedule.params)
                        params = schedule.params[n];
                    return await this.processJob({
                        id: '#' + workerName,
                        domain: domain,
                        cron: '*',
                        pack: pack,
                        workerName: schedule.worker,
                        params: schedule.params
                    });
                }
                ;
            }
            ;
        }
        ;
        if (domainPacks?.length == 1) {
            return await this.processJob({
                id: '#' + workerName,
                domain: domain,
                workerName: workerName,
                cron: '*',
                pack: domainPacks[0],
                params: params
            });
        }
        ;
    }
    ;
    async processJob(job) {
        if (job.cron != '*' && !job.next) {
            job.next = parseCron(job.cron);
            console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id ? `${job.domain}:${job.id}` : ''));
        }
        ;
        if (job.cron == '*' || job.next.getTime() < new Date().getTime()) {
            job.processing = true;
            try {
                let result;
                if (job.pack) {
                    if (this.queue) {
                        result = await this.queue.createJob({
                            worker: {
                                domain: job.domain,
                                packagePath: job.pack.packagePath,
                                workerName: job.workerName,
                                params: job.params
                            }
                        }, false, {
                            id: job.domain + ':' + job.id
                        });
                    }
                    else {
                        if (!job.plugin) {
                            let worker = await this.packageManager.getPackageWorker(job.pack, job.workerName);
                            if (worker.moduleScript.errors)
                                console.error(worker.moduleScript.errors);
                            let plugins = {};
                            if (worker.plugins?.cache)
                                plugins.cache = job.pack.options.plugins.cache;
                            if (worker.plugins?.db)
                                plugins.db = { default: job.pack.options.plugins.db };
                            if (worker.plugins?.wallet) {
                                if (job.params?.chainId) {
                                    plugins.wallet = { ...job.pack.options.plugins.wallet, chainId: job.params.chainId };
                                }
                                else {
                                    plugins.wallet = job.pack.options.plugins.wallet;
                                }
                            }
                            if (worker.plugins?.fetch)
                                plugins.fetch = job.pack.options.plugins.fetch || { methods: ['GET'] };
                            job.plugin = new plugin_1.Worker({
                                plugins: plugins,
                                dependencies: worker.moduleScript.dependencies,
                                script: worker.moduleScript.script,
                                params: worker.params
                            });
                            await job.plugin.init(job.params || {});
                        }
                        ;
                        result = await job.plugin.process(job.params);
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
                if (job.cron != '*') {
                    job.next = parseCron(job.cron);
                    console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id ? job.id : ''));
                }
                ;
                return result;
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
                this.processJob(job);
            }
            ;
        });
    }
    ;
}
exports.Scheduler = Scheduler;
;
