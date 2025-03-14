/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
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
        this._queue = new Queue(options.jobQueue, {
            redis: options.connection.redis, 
            removeOnSuccess: true, 
            removeOnFailure: true
        });
        // this._queue.checkStalledJobs(5000, (err, numStalled) => {});
    };
    async createJob(data: any, waitForResult?: boolean, options?: {
            id?: string;
            timeout?: number;
            retries?: number;
        }): Promise<IJob>{        
        return new Promise(async (resolve)=>{
            let job = this._queue.createJob(data).retries(options?.retries || 5);
            job.on('succeeded', (result)=>{                    
                if (waitForResult)
                    resolve({
                        id: job.id,
                        progress: 100,
                        status: 'succeeded',
                        result: result
                    });
            });
            job.on('failed', (err) => {
                if (waitForResult)
                    resolve({
                        id: result.id,
                        progress: result.progress,
                        status: 'failed'
                    })
            });
            if (options?.id)
                job.setId(options.id);
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
    async stop(){
        Queues = {};
        return new Promise((resolve)=>{
            this._queue.close(()=>{
                resolve(null)
            });
        })
    };
};
export function getJobQueue(options: IJobQueueOptions): JobQueue{
    let id = options.connection.redis.host + ':' + (options.connection.redis.db || 0) +':' + options.jobQueue;
    if (!Queues[id])
        Queues[id] = new JobQueue(options);
    return Queues[id];
};