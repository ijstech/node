/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import CronParser from 'cron-parser';

export interface ISchdeulePluginOptions extends IWorkerPluginOptions{
    cron: string;
    disabled?: boolean;
}
export interface ISchedulerOptions {
    module?: string;
    jobs?: ISchdeulePluginOptions[]
}
export interface IScheduleJobOptions extends ISchdeulePluginOptions{
    next?: CronParser.CronDate;
    plugin?: Worker;
}
export class Scheduler {
    private options: ISchedulerOptions;
    private timer: any;
    private started: boolean;
    private jobs: IScheduleJobOptions[];
    constructor(options: ISchedulerOptions){
        this.jobs = [];
        this.options = options || {};            
        this.options.jobs = this.options.jobs || [];   
        for (let i = 0; i < this.options.jobs.length; i ++)
            this.addJob(this.options.jobs[i], this.options.module);
    }
    addJob(job: ISchdeulePluginOptions, module?: string){        
        if (module)
            job.modulePath = module;
        this.jobs.push(job);
    };
    start(){
        if (this.started)
            return;        
        
        if (this.jobs.length == 0)
            return;
        this.started = true; 
        this.timer = setInterval(()=>{
            this.processJobs();
        }, 500)
    }
    private async runJob(job: IScheduleJobOptions){
        if (!job.next){
            job.next = CronParser.parseExpression(job.cron).next();
            console.log('Next Schedule: ' + job.next.toString() + ' ' + job.scriptPath)
        }                
        if (job.next.getTime() < new Date().getTime()){
            job.processing = true;
            try{
                if (!job.plugin){
                    job.plugin = new Worker(job);                    
                    await job.plugin.init(job.params);
                }
                await job.plugin.process(job.params)
                job.next = CronParser.parseExpression(job.cron).next();
                console.log('Next Schedule: ' + job.next.toString() + ' ' + job.scriptPath)
            }
            finally{
                job.processing = false;
            }
        }
    }
    private processJobs(){
        this.jobs.forEach(async (job: IScheduleJobOptions)=>{
            if (!job.disabled && !job.processing){     
                this.runJob(job);
            }
        })        
    }
}