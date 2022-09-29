/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {Worker, Router, IRouterRequest, RouterRequest, RouterResponse} from '@ijstech/plugin';
import {Message} from '@ijstech/message';
import {getJobQueue, JobQueue, IJobQueueOptions} from './jobQueue';
import * as Types from '@ijstech/types';
import {PackageManager, IDomainRouterPackage, IDomainWorkerPackage} from '@ijstech/package';
export {IQueueOptions} from '@ijstech/types';
export {getJobQueue, JobQueue, IJobQueueOptions};

interface IQueueWorkerOptions extends Types.IQueuePluginOptions{
    plugin?: Worker;
    queue?: JobQueue;
    message?: Message;
};
export interface IWorkerOptions{
    enabled: boolean;
    jobQueue: string;
    connection: Types.IJobQueueConnectionOptions;
};
export class Queue {
    private options: Types.IQueueOptions;
    private started: boolean;
    private packageManager: PackageManager;
    private domainPackage: {[domain: string]: {[packPath: string]: IDomainWorkerPackage}} = {};

    constructor(options: Types.IQueueOptions) {
        this.options = options;
    };
    async addDomainRouter(domain: string, router: IDomainRouterPackage){
        if (!this.packageManager)
            this.packageManager = new PackageManager();
        this.packageManager.addDomainRouter(domain, router); 
    };
    async addDomainWorker(domain: string, worker: IDomainWorkerPackage){
        if (!this.packageManager)
            this.packageManager = new PackageManager();
        this.domainPackage[domain] = this.domainPackage[domain] || {};
        this.domainPackage[domain][worker.packagePath] = worker; 
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
            });
            queue.processJob(async (job) =>{                                
                if (job.data?.worker){                    
                    let worker = job.data.worker;  
                    let pack: IDomainWorkerPackage;
                    if (this.domainPackage[worker.domain])
                        pack = this.domainPackage[worker.domain][worker.packagePath];
                    if (pack){          
                        let module = await this.packageManager.getPackageWorker(pack, worker.workerName);
                        if (module){
                            let plugins:any = {};
                            if (module.plugins?.cache)
                                plugins.cache = pack.options.plugins.cache;
                            if (module.plugins?.db)
                                plugins.db = {default: pack.options.plugins.db};
                            
                            let plugin = new Worker({
                                dependencies: module.moduleScript.dependencies,
                                script: module.moduleScript.script,
                                params: worker.params,
                                plugins: plugins
                            });
                            let result = await plugin.process(worker.params);
                        }
                    }
                    else
                        console.error('Domain package not found: ' + worker.domain)
                    return true;
                }
                else if (this.packageManager && job.data?.request?.hostname){
                    let request: IRouterRequest = job.data.request;
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
};
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
                let job = await q.createJob(data, waitForResult, {
                    timeout,
                    retries
                });                
                if (vm)
                    return <any>JSON.stringify(job);
                else
                    return job;
            };
        }
    };
};
export default loadPlugin;