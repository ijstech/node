import { IWorkerPluginOptions, Worker } from '@ijstech/plugin';
import CronParser from 'cron-parser';
export interface ISchdeulePluginOptions extends IWorkerPluginOptions {
    cron: string;
    disabled?: boolean;
}
export interface ISchedulerOptions {
    jobs?: ISchdeulePluginOptions[];
}
export interface IScheduleJobOptions extends ISchdeulePluginOptions {
    next?: CronParser.CronDate;
    plugin?: Worker;
}
export declare class Scheduler {
    private options;
    private timer;
    private started;
    private jobs;
    constructor(options: ISchedulerOptions);
    start(): void;
    private runJOb;
    private processJobs;
}
