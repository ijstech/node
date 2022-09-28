/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {Worker, Router, IRouterRequest, RouterRequest, RouterResponse} from '@ijstech/plugin';
import {Message} from '@ijstech/message';
import {getJobQueue, JobQueue, IJobQueueOptions} from './jobQueue';
import * as Types from '@ijstech/types';
import {PackageManager, IDomainOptions,} from '@ijstech/package';
export {IQueueOptions} from '@ijstech/types';
export {getJobQueue, JobQueue, IJobQueueOptions};

interface IQueueWorkerOptions extends Types.IQueuePluginOptions{
    plugin?: Worker;
    queue?: JobQueue;
    message?: Message;
}
export class Queue {
    private options: Types.IQueueOptions;
    private started: boolean;
    private packageManager: PackageManager;
    constructor(options: Types.IQueueOptions) {
        this.options = options;
    };
    async addDomainPackage(domain: string, baseUrl: string, packagePath: string, options?: IDomainOptions){
        if (!this.packageManager)
            this.packageManager = new PackageManager();
        this.packageManager.addDomainPackage(domain, baseUrl, packagePath, options); 
    };
    private runWorker(worker: IQueueWorkerOptions) {        
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
        if (this.options.jobQueue && !this.options.disabled && this.options.connection){
            let queue = getJobQueue({
                connection: this.options.connection,
                jobQueue: this.options.jobQueue
            })
            queue.processJob(async (job) =>{                
                let request: IRouterRequest = job.data.request;
                if (this.packageManager && request && request.hostname){
                    let {options, pack, params, route} = await this.packageManager.getDomainRouter({
                        domain: request.hostname,
                        method: request.method,
                        url: request.url
                    });                    
                    if (route){
                        let plugin: Router = (<any>route)._plugin;
                        if (!plugin){
                            let script = await pack.getScript(route.module);
                            if (script){                                
                                let plugins:any = {};
                                if (options && options.plugins){
                                    if (route.plugins?.db)
                                        plugins.db = {default: options.plugins.db};
                                    if (route.plugins?.cache)
                                        plugins.cache = options.plugins.cache;
                                };
                                let method = request.method as Types.IRouterPluginMethod;
                                plugin = new Router({
                                    baseUrl: route.url,
                                    methods: [method],
                                    script: script.script,
                                    params: route.params,
                                    dependencies: script.dependencies,
                                    plugins: plugins
                                });
                                (<any>route)._plugin = plugin;
                            };
                        };
                        if (plugin){                                                                                                                          
                            let result = {};
                            request.params = params;
                            await plugin.route(null, RouterRequest(request), RouterResponse(result));
                            return result;
                        };
                    };
                };
            });
        };
        if (this.options.workers){
            for (let i = 0; i < this.options.workers.length; i++) {
                let worker = this.options.workers[i];
                if (!worker.disabled)
                    this.runWorker(worker);
            };
        }
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