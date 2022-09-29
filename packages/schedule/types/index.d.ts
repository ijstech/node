/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IWorkerPluginOptions, Worker } from '@ijstech/plugin';
import CronParser from 'cron-parser';
import { IDomainWorkerPackage } from '@ijstech/package';
import { IWorkerOptions } from '@ijstech/queue';
export interface ISchdeulePluginOptions extends IWorkerPluginOptions {
    cron: string;
    disabled?: boolean;
}
export interface ISchedulerOptions {
    module?: string;
    jobs?: ISchdeulePluginOptions[];
    worker?: IWorkerOptions;
}
export interface IScheduleJob extends ISchdeulePluginOptions {
    id?: string;
    next?: CronParser.CronDate;
    domain?: string;
    pack?: IDomainWorkerPackage;
    workerName?: string;
    plugin?: Worker;
}
export interface IDomainSchedule {
    id?: string;
    cron: string;
    worker: string;
    params?: any;
}
export interface IDomainWorker {
    pack: IDomainWorkerPackage;
    schedules: IDomainSchedule[];
}
export declare class Scheduler {
    private options;
    private timer;
    private started;
    private jobs;
    private queue;
    private packageManager;
    private domainWorkers;
    constructor(options?: ISchedulerOptions);
    addDomainWorker(domain: string, pack: IDomainWorkerPackage, schedules: IDomainSchedule[]): Promise<void>;
    addJob(job: ISchdeulePluginOptions, module?: string): void;
    start(): void;
    stop(): void;
    private runJob;
    private processJobs;
}
