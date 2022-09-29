/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { Worker } from '@ijstech/plugin';
import { getJobQueue, JobQueue, IJobQueueOptions } from './jobQueue';
import * as Types from '@ijstech/types';
import { IDomainRouterPackage, IDomainWorkerPackage } from '@ijstech/package';
export { IQueueOptions } from '@ijstech/types';
export { getJobQueue, JobQueue, IJobQueueOptions };
export interface IWorkerOptions {
    enabled: boolean;
    jobQueue: string;
    connection: Types.IJobQueueConnectionOptions;
}
export declare class Queue {
    private options;
    private started;
    private packageManager;
    private queue;
    private domainPackage;
    constructor(options: Types.IQueueOptions);
    addDomainRouter(domain: string, router: IDomainRouterPackage): Promise<void>;
    addDomainWorker(domain: string, worker: IDomainWorkerPackage): Promise<void>;
    private runWorker;
    start(): void;
    stop(): void;
}
export declare function loadPlugin(plugin: Worker, options: Types.IQueueRequiredPluginOptions, vm?: Types.VM): Types.IQueuePlugin;
export default loadPlugin;
