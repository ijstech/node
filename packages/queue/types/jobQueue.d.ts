/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import Queue from './bee-queue';
import * as Types from '@ijstech/types';
type Job = Queue.Job<any>;
export { Job };
export interface IJobQueueOptions extends Types.IPluginOptions {
    jobQueue: string;
    disabled?: boolean;
    connection: Types.IJobQueueConnectionOptions;
}
export interface IJob {
    id: string;
    progress: number;
    status: string;
    result?: any;
}
export declare class JobQueue {
    private _options;
    private _queue;
    constructor(options: IJobQueueOptions);
    createJob(data: any, waitForResult?: boolean, options?: {
        id?: string;
        timeout?: number;
        retries?: number;
    }): Promise<IJob>;
    processJob(handler: (job: Queue.Job<any>) => Promise<any>): void;
    stop(): Promise<unknown>;
}
export declare function getJobQueue(options: IJobQueueOptions): JobQueue;
