/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { Worker } from '@ijstech/plugin';
import { Message } from '@ijstech/message';
import { getJobQueue, JobQueue, IJobQueueOptions } from './jobQueue';
import * as Types from '@ijstech/types';
export { IQueueOptions } from '@ijstech/types';
export { getJobQueue, JobQueue, IJobQueueOptions };
interface IQueueWorkerOptions extends Types.IQueuePluginOptions {
    plugin?: Worker;
    queue?: JobQueue;
    message?: Message;
}
export declare class Queue {
    private options;
    private started;
    constructor(options: Types.IQueueOptions);
    runWorker(worker: IQueueWorkerOptions): void;
    start(): void;
}
export declare function loadPlugin(plugin: Worker, options: Types.IQueueRequiredPluginOptions, vm?: Types.VM): Types.IQueuePlugin;
export default loadPlugin;
