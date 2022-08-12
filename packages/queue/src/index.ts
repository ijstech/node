/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {Worker} from '@ijstech/plugin';
import {Message} from '@ijstech/message';
import {getJobQueue, JobQueue} from './jobQueue';
import * as Types from '@ijstech/types';
export {IQueueOptions} from '@ijstech/types';
export {getJobQueue};

interface IQueueWorkerOptions extends Types.IQueuePluginOptions{
    plugin?: Worker;
    queue?: JobQueue;
    message?: Message;
}
export class Queue {
    private options: Types.IQueueOptions;
    private started: boolean;
    constructor(options: Types.IQueueOptions) {
        this.options = options;
    };
    runWorker(worker: IQueueWorkerOptions) {        
        worker.plugin = new Worker(worker);
        worker.queue = getJobQueue(worker);
        if (worker.plugins && worker.plugins.message) {
            worker.message = new Message(worker.plugin, worker.plugins.message);
        }
        worker.queue.processJob(async (job) => {                
            try{
                let result = await worker.plugin.process(job.data);
                return result;
            }
            catch(err){
                console.trace(err)
            }
        });
    };
    start() {
        if (this.started)
            return;
        this.started = true;
        for (let i = 0; i < this.options.workers.length; i++) {
            let worker = this.options.workers[i];
            if (!worker.disabled)
                this.runWorker(worker);
        };
    };
}
export function loadPlugin(plugin: Worker, options: Types.IQueueRequiredPluginOptions, vm?: Types.VM): Types.IQueuePlugin{
    return {
        createJob: async function (queue: string|number, data: any, waitForResult?:boolean, timeout?: number, retries?: number): Promise<Types.IQueueJob>{            
            if (typeof (queue) == 'number')
                queue = options.queues[queue];
            if (queue && options.queues.indexOf(queue) >= 0) {                
                let q = getJobQueue({
                    jobQueue: queue,
                    connection: options.connection
                });
                let job = await q.createJob(data, waitForResult, timeout, retries);                
                if (vm) //can returns string value to VM only
                    return <any>JSON.stringify(job);
                else
                    return job;
            };
        }
    };
};
export default loadPlugin;