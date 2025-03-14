/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import {parseExpression} from 'cron-parser';
import {PackageManager, IDomainWorkerPackage} from '@ijstech/package';
import {JobQueue, IWorkerOptions} from '@ijstech/queue';
import {IDomainOptions} from '@ijstech/types';
import {IStorageOptions} from '@ijstech/storage'

export function parseCron(expression: string): Date{
    let cron = parseExpression(expression);
    if (cron.hasNext())
        return new Date(cron.next().getTime())
    else
        return new Date('9999-01-01')
};
export interface ISchdeulePluginOptions extends IWorkerPluginOptions{
    cron: string;
    disabled?: boolean;
};
export interface ISchedulerOptions {
    module?: string;
    jobs?: ISchdeulePluginOptions[];
    worker?: IWorkerOptions;
    storage?: IStorageOptions;
    domains?: {[domainName: string]: IDomainSchedulePackage[]}
    packageManager?: PackageManager;
};
export interface IScheduleJob extends ISchdeulePluginOptions{
    id?: string;
    next?: Date;
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
export interface IDomainSchedulePackage {
    packagePath: string;
    params?: any;
    schedules?: IDomainSchedule[];
    options?: IDomainOptions;
}
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
    private domainPackages: {[domain: string]: IDomainSchedulePackage[]} = {};

    constructor(options?: ISchedulerOptions){
        this.jobs = [];
        this.options = options || {};                  
        this.packageManager = options.packageManager;  
        if (this.options.worker && this.options.worker.enabled !== false)
            this.queue = new JobQueue({
                jobQueue: this.options.worker.jobQueue,
                connection: this.options.worker.connection
            });
        for (let domain in this.options.domains){
            let domainWorkers = this.options.domains[domain];
            for (let i = 0; i < domainWorkers.length; i ++){
                this.addDomainPackage(domain, domainWorkers[i])
            }
        }
        this.options.jobs = this.options.jobs || [];   
        for (let i = 0; i < this.options.jobs.length; i ++)
            this.addJob(this.options.jobs[i], this.options.module);
    };
    async addDomainPackage(domain: string, pack: IDomainSchedulePackage){
        if (!this.packageManager){
            this.packageManager = new PackageManager({
                storage: this.options.storage
            });        
        };
        this.domainPackages[domain] = this.domainPackages[domain] || [];
        let domainPackages = this.domainPackages[domain];
        domainPackages.push(pack);     
        for (let i = 0; i < pack.schedules?.length; i ++){
            let schedule = pack.schedules[i];            
            let id = schedule.id || `${domain}:${schedule.worker}:${i}`
            this.jobs.push({
                id: id, 
                domain: domain,
                cron: schedule.cron,
                pack: pack,
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
        for (let domain in this.domainPackages){
            let domainPackages = this.domainPackages[domain]
            for (let i = 0; i < domainPackages.length; i ++){
                let pack = domainPackages[i];
                if (!pack.schedules){
                    try{
                        let scconfig = JSON.parse(await this.packageManager.getFileContent(pack.packagePath, 'scconfig.json'));                
                        pack.schedules = scconfig?.schedules || [];                
                    }
                    catch(err){
                        pack.schedules = [];
                    };
                    for (let i = 0; i < pack.schedules.length; i ++){
                        let schedule = pack.schedules[i];
                        let id = schedule.id || `${domain}:${schedule.worker}:${i}`
                        if (id){
                            this.jobs.push({
                                id: id, 
                                domain: domain,
                                cron: schedule.cron,
                                pack: pack,
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
    async runJob(domain: string, workerName: string, params?: any): Promise<any>{
        let domainPacks = this.domainPackages[domain];
        for (let i = 0; i < domainPacks?.length; i ++){
            let pack = domainPacks[i];            
            for (let k = 0; k < pack.schedules?.length; k++){
                let schedule = pack.schedules[k];
                if (schedule.worker == workerName){
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
                };
            };
        };
        if (domainPacks?.length == 1){
            return await this.processJob({
                id: '#' + workerName,
                domain: domain,
                workerName: workerName,
                cron: '*',
                pack: domainPacks[0],
                params: params
            });
        };
    };
    private async processJob(job: IScheduleJob){
        if (job.cron != '*' && !job.next){
            job.next = parseCron(job.cron);
            console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id?`${job.domain}:${job.id}`:''));
        };
        if (job.cron == '*' || job.next.getTime() < new Date().getTime()){
            job.processing = true;
            try{
                let result: any;  
                if (job.pack){     
                    if (this.queue){                        
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
                    else{
                        if (!job.plugin){
                            let worker = await this.packageManager.getPackageWorker(job.pack, job.workerName);
                            if (worker.moduleScript.errors)
                                console.error(worker.moduleScript.errors)
                            let plugins: any = {};
                            if (worker.plugins?.cache)
                                plugins.cache = job.pack.options.plugins.cache
                            if (worker.plugins?.db)
                                plugins.db = {default: job.pack.options.plugins.db}
                            if (worker.plugins?.wallet) {
                                if (job.params?.chainId) {
                                    plugins.wallet = {...job.pack.options.plugins.wallet, chainId: job.params.chainId};
                                }
                                else {
                                    plugins.wallet = job.pack.options.plugins.wallet;
                                }
                            }
                            if (worker.plugins?.fetch)
                                plugins.fetch = job.pack.options.plugins.fetch || {methods: ['GET']}
                            job.plugin = new Worker({
                                plugins: plugins,
                                dependencies: worker.moduleScript.dependencies,
                                script: worker.moduleScript.script,
                                params: worker.params                            
                            });
                            await job.plugin.init(job.params || {})
                        };
                        result = await job.plugin.process(job.params);
                    }
                }
                else{
                    if (!job.plugin){
                        job.plugin = new Worker(job);                    
                        await job.plugin.init(job.params);
                    };
                    await job.plugin.process(job.params);
                };
                if (job.cron != '*'){
                    job.next = parseCron(job.cron);
                    console.log('Next Schedule: ' + job.next.toString() + ' ' + (job.id?job.id:''));
                };  
                return result;              
            }
            finally{
                job.processing = false;
            };
        };
    };
    private processJobs(){        
        this.jobs.forEach(async (job: IScheduleJob)=>{
            if (!job.disabled && !job.processing){
                this.processJob(job);
            };
        });
    };
};