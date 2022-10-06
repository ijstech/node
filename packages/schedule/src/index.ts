/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import CronParser from 'cron-parser';
import {PackageManager, IDomainWorkerPackage} from '@ijstech/package';
import {JobQueue, IWorkerOptions} from '@ijstech/queue'
import {IStorageOptions} from '@ijstech/storage'

export interface ISchdeulePluginOptions extends IWorkerPluginOptions{
    cron: string;
    disabled?: boolean;
};
export interface ISchedulerOptions {
    module?: string;
    jobs?: ISchdeulePluginOptions[];
    worker?: IWorkerOptions;
    storage?: IStorageOptions;
    domains?: {[domainName: string]: IDomainWorker[]}
};
export interface IScheduleJob extends ISchdeulePluginOptions{
    id?: string;
    next?: CronParser.CronDate;
    domain?: string;
    pack?: IDomainWorkerPackage;
    workerName?: string;
    plugin?: Worker;
};
export interface IDomainSchedule {
    id?: string;
    cron: string;    
    worker: string;
    params?: any;
};
export interface IDomainWorker {
    pack: IDomainWorkerPackage;
    schedules?: IDomainSchedule[];
};
export class Scheduler {
    private options: ISchedulerOptions;
    private timer: any;
    private started: boolean;
    private jobs: IScheduleJob[];
    private queue: JobQueue;
    private packageManager: PackageManager;
    private domainWorkers: {[domain: string]: IDomainWorker[]} = {};

    constructor(options?: ISchedulerOptions){
        this.jobs = [];
        this.options = options || {};                    
        if (this.options.worker && this.options.worker.enabled !== false)
            this.queue = new JobQueue({
                jobQueue: this.options.worker.jobQueue,
                connection: this.options.worker.connection
            });
        for (let domain in this.options.domains){
            let domainWorkers = this.options.domains[domain];
            for (let i = 0; i < domainWorkers.length; i ++){
                this.addDomainWorker(domain, domainWorkers[i])
            }
        }
        this.options.jobs = this.options.jobs || [];   
        for (let i = 0; i < this.options.jobs.length; i ++)
            this.addJob(this.options.jobs[i], this.options.module);
    };
    async addDomainWorker(domain: string, worker: IDomainWorker){
        if (!this.packageManager){
            this.packageManager = new PackageManager({
                storage: this.options.storage
            });        
        };
        this.domainWorkers[domain] = this.domainWorkers[domain] || [];
        let domainWorkers = this.domainWorkers[domain];
        domainWorkers.push(worker);        
        for (let i = 0; i < worker.schedules?.length; i ++){
            let schedule = worker.schedules[i];            
            let id = schedule.id || `${domain}:${schedule.worker}:${i}`
            this.jobs.push({
                id: id, 
                domain: domain,
                cron: schedule.cron,
                pack: worker.pack,
                workerName: schedule.worker,
                params: schedule.params
            });
        };
    };
    addJob(job: ISchdeulePluginOptions, module?: string){        
        if (module)
            job.modulePath = module;
        this.jobs.push(job);
    };
    async start(){        
        if (this.started)
            return;        
        for (let domain in this.domainWorkers){
            let domainWorkers = this.domainWorkers[domain]
            for (let i = 0; i < domainWorkers.length; i ++){
                let worker = domainWorkers[i];
                if (!worker.schedules){
                    try{
                        let scconfig = JSON.parse(await this.packageManager.getFileContent(worker.pack.packagePath, 'scconfig.json'));                
                        worker.schedules = scconfig?.schedules || [];                
                    }
                    catch(err){
                        worker.schedules = [];
                    };
                    for (let i = 0; i < worker.schedules.length; i ++){
                        let schedule = worker.schedules[i];            
                        let id = schedule.id || `${domain}:${schedule.worker}:${i}`
                        if (id){
                            this.jobs.push({
                                id: id, 
                                domain: domain,
                                cron: schedule.cron,
                                pack: worker.pack,
                                workerName: schedule.worker,
                                params: schedule.params
                            });
                        }
                    };
                }
            }
        };
        if (this.jobs.length == 0)
            return;
        this.started = true; 
        this.timer = setInterval(()=>{
            this.processJobs();
        }, 500);
    };
    stop(){
        clearInterval(this.timer);
        this.started = false;
    };
    private async runJob(job: IScheduleJob){
        if (!job.next){
            job.next = CronParser.parseExpression(job.cron).next();
            console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id?job.id:''));
        };
        if (job.next.getTime() < new Date().getTime()){
            job.processing = true;
            try{
                if (job.pack){                    
                    if (this.queue){                        
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
                    else{
                        if (!job.plugin){
                            let worker = await this.packageManager.getPackageWorker(job.pack, job.workerName);
                            let plugins: any = {};
                            if (worker.plugins?.cache)
                                plugins.cache = job.pack.options.plugins.cache
                            if (worker.plugins?.db)
                                plugins.db = {default: job.pack.options.plugins.db}
                            if (worker.plugins?.wallet)
                                plugins.wallet = job.pack.options.plugins.wallet
                            job.plugin = new Worker({
                                plugins: plugins,
                                dependencies: worker.moduleScript.dependencies,
                                script: worker.moduleScript.script,
                                params: worker.params                            
                            });
                        };
                        let result = await job.plugin.process(job.params);
                    }
                }
                else{
                    if (!job.plugin){
                        job.plugin = new Worker(job);                    
                        await job.plugin.init(job.params);
                    };
                    await job.plugin.process(job.params);
                };
                job.next = CronParser.parseExpression(job.cron).next();
                console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id?job.id:''));
            }
            finally{
                job.processing = false;
            };
        };
    };
    private processJobs(){        
        this.jobs.forEach(async (job: IScheduleJob)=>{
            if (!job.disabled && !job.processing){
                this.runJob(job);
            };
        });
    };
};