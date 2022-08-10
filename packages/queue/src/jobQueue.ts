/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Queue from './bee-queue';
import * as Types from '@ijstech/types';

type Job = Queue.Job<any>;
export {Job};

export interface IJobQueueOptions extends Types.IPluginOptions{
    jobQueue: string;
    disabled?: boolean;
    connection: Types.IJobQueueConnectionOptions;
};
let Queues = {};
export interface IJob{
    id: string;
    progress: number;
    status: string;
    result?: any;
};
type DoneCallback<T> = (error: Error | null, result?: T) => void;
export class JobQueue{    
    private _options: any;
    private _queue: Queue;
    constructor(options: IJobQueueOptions){
        this._options = options;
        this._queue = new Queue(options.jobQueue, {redis: options.connection.redis});
    };
    async createJob(data: any, waitForResult?: boolean, timeout?: number, retries?: number): Promise<IJob>{        
        return new Promise(async (resolve)=>{
            let job = this._queue.createJob(data).retries(retries || 5);
            if (waitForResult){
                job.on('succeeded', (result)=>{                    
                    resolve({
                        id: job.id,
                        progress: 100,
                        status: 'succeeded',
                        result: result
                    });
                });
                job.on('failed', (err) => {
                    resolve({
                        id: result.id,
                        progress: result.progress,
                        status: 'failed'
                    })
                });
            };
            let result = await job.save();            
            if (!waitForResult)                
                resolve({
                    id: result.id,
                    progress: result.progress,
                    status: result.status
                })
        });
    };
    processJob(handler: (job: Queue.Job<any>)=>Promise<any>){
        this._queue.process(handler);
    };
};
export function getJobQueue(options: IJobQueueOptions): JobQueue{
    let id = options.connection.redis.host + ':' + (options.connection.redis.db || 0) +':' + options.jobQueue;
    if (!Queues[id])
        Queues[id] = new JobQueue(options);
    return Queues[id];
};