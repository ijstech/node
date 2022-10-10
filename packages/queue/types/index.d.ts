/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { Worker } from '@ijstech/plugin';
import { getJobQueue, JobQueue, IJobQueueOptions } from './jobQueue';
import * as Types from '@ijstech/types';
import { PackageManager, IDomainRouterPackage, IDomainWorkerPackage } from '@ijstech/package';
export { getJobQueue, JobQueue, IJobQueueOptions };
export interface IQueueOptions {
    jobQueue?: string;
    disabled?: boolean;
    connection?: Types.IJobQueueConnectionOptions;
    module?: string;
    packageManager?: PackageManager;
    workers?: Types.IQueuePluginOptions[];
    storage?: Types.IStorageOptions;
    domains?: {
        [domainName: string]: {
            routers?: IDomainRouterPackage[];
            workers?: IDomainWorkerPackage[];
        };
    };
}
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
    constructor(options?: IQueueOptions);
    addDomainRouter(domain: string, router: IDomainRouterPackage): Promise<void>;
    addDomainWorker(domain: string, worker: IDomainWorkerPackage): Promise<void>;
    private runWorker;
    start(): void;
    stop(): Promise<void>;
}
export declare function loadPlugin(plugin: Worker, options: Types.IQueueRequiredPluginOptions, vm?: Types.VM): Types.IQueuePlugin;
export default loadPlugin;
