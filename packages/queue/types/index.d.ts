/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { Worker } from '@ijstech/plugin';
import { getJobQueue, JobQueue, IJobQueueOptions } from './jobQueue';
import * as Types from '@ijstech/types';
import { IDomainOptions } from '@ijstech/package';
export { IQueueOptions } from '@ijstech/types';
export { getJobQueue, JobQueue, IJobQueueOptions };
export declare class Queue {
    private options;
    private started;
    private packageManager;
    constructor(options: Types.IQueueOptions);
    addDomainPackage(domain: string, baseUrl: string, packagePath: string, options?: IDomainOptions): Promise<void>;
    private runWorker;
    start(): void;
}
export declare function loadPlugin(plugin: Worker, options: Types.IQueueRequiredPluginOptions, vm?: Types.VM): Types.IQueuePlugin;
export default loadPlugin;
