/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IWorkerPluginOptions, Worker } from '@ijstech/plugin';
import { PackageManager, IDomainWorkerPackage } from '@ijstech/package';
import { IWorkerOptions } from '@ijstech/queue';
import { IDomainOptions } from '@ijstech/types';
import { IStorageOptions } from '@ijstech/storage';
export declare function parseCron(expression: string): Date;
export interface ISchdeulePluginOptions extends IWorkerPluginOptions {
    cron: string;
    disabled?: boolean;
}
export interface ISchedulerOptions {
    module?: string;
    jobs?: ISchdeulePluginOptions[];
    worker?: IWorkerOptions;
    storage?: IStorageOptions;
    domains?: {
        [domainName: string]: IDomainSchedulePackage[];
    };
    packageManager?: PackageManager;
}
export interface IScheduleJob extends ISchdeulePluginOptions {
    id?: string;
    next?: Date;
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
export interface IDomainSchedulePackage {
    packagePath: string;
    params?: any;
    schedules?: IDomainSchedule[];
    options?: IDomainOptions;
}
export interface IDomainWorker {
    pack: IDomainWorkerPackage;
    schedules?: IDomainSchedule[];
}
export declare class Scheduler {
    private options;
    private timer;
    private started;
    private jobs;
    private queue;
    private packageManager;
    private domainPackages;
    constructor(options?: ISchedulerOptions);
    addDomainPackage(domain: string, pack: IDomainSchedulePackage): Promise<void>;
    addJob(job: ISchdeulePluginOptions, module?: string): void;
    start(): Promise<void>;
    stop(): void;
    runJob(domain: string, workerName: string, params?: any): Promise<any>;
    private processJob;
    private processJobs;
}
