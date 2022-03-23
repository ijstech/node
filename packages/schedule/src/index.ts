import {IWorkerPluginOptions, Worker} from '@ijstech/plugin';
import CronParser from 'cron-parser';

export interface ISchdeulePluginOptions extends IWorkerPluginOptions{
    cron: string;
    disabled?: boolean;
}
export interface ISchedulerOptions {
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
        this.options = options;     
        this.options.jobs = this.options.jobs || [];   
    }
    start(){
        if (this.started)
            return;
        this.started = true;                
        this.jobs = [];
        this.options.jobs.forEach((job: IScheduleJobOptions)=>{
            if (!job.disabled)
                this.jobs.push(job);
        })
        if (this.jobs.length == 0)
            return;
        this.timer = setInterval(()=>{
            this.processJobs();
        }, 500)
    }
    private async runJOb(job: IScheduleJobOptions){
        if (!job.next){
            job.next = CronParser.parseExpression(job.cron).next();
            console.log('Scheduled: ' + job.next.toString() + ' ' + job.scriptPath)
        }                
        if (job.next.getTime() < new Date().getTime()){
            job.processing = true;
            if (!job.plugin){
                job.plugin = new Worker(job);                    
                await job.plugin.init(job.params);
            }
            await job.plugin.process()
            job.next = CronParser.parseExpression(job.cron).next();
            console.log('Scheduled: ' + job.next.toString() + ' ' + job.scriptPath)
        }
    }
    private processJobs(){
        this.jobs.forEach(async (job: IScheduleJobOptions)=>{
            if (!job.disabled && !job.processing){     
                this.runJOb(job);
            }
        })        
    }
}