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
export {getJobQueue, JobQueue, IJobQueueOptions};

export interface IQueueOptions {
    jobQueue?: string;
    disabled?: boolean;
    connection?: Types.IJobQueueConnectionOptions;
    module?: string;
    packageManager?: PackageManager;
    workers?: Types.IQueuePluginOptions[];
    storage?: Types.IStorageOptions;    
    domains?: {[domainName: string]: {
        routers?: IDomainRouterPackage[],
        workers?: IDomainWorkerPackage[]
    }}
}
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
    private queue: JobQueue;
    private domainPackage: {[domain: string]: {[packPath: string]: IDomainWorkerPackage}} = {};

    constructor(options?: IQueueOptions) {
        options = options || {};
        this.packageManager = options.packageManager;
        this.options = options;
        for (let domain in options.domains){
            let domainOptions = options.domains[domain];
            if (domainOptions.routers){
                for (let i = 0; i < domainOptions.routers.length; i ++)
                    this.addDomainRouter(domain, domainOptions.routers[i]);
            };
            if (domainOptions.workers){
                for (let i = 0; i < domainOptions.workers.length; i ++)
                    this.addDomainWorker(domain, domainOptions.workers[i]);
            };
        };
    };
    async addDomainRouter(domain: string, router: IDomainRouterPackage){
        if (!this.packageManager)
            this.packageManager = new PackageManager({
                storage: this.options.storage
            });
        this.packageManager.addDomainRouter(domain, router); 
    };
    async addDomainWorker(domain: string, worker: IDomainWorkerPackage){
        if (!this.packageManager)
            this.packageManager = new PackageManager({
                storage: this.options.storage
            });
        this.domainPackage[domain] = this.domainPackage[domain] || {};
        this.domainPackage[domain][worker.packagePath] = worker; 
    };
    private runWorker(worker: IQueueWorkerOptions) {        
        if (!worker.plugin)
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
            this.queue = getJobQueue({
                connection: this.options.connection,
                jobQueue: this.options.jobQueue
            });            
            this.queue.processJob(async (job) =>{                                
                if (job.data?.worker){                    
                    let worker = job.data.worker;  
                    let pack: IDomainWorkerPackage;
                    if (this.domainPackage[worker.domain])
                        pack = this.domainPackage[worker.domain][worker.packagePath];
                    if (pack){          
                        let module = await this.packageManager.getPackageWorker(pack, worker.workerName);
                        if (module.moduleScript.errors)
                            console.error(module.moduleScript.errors)
                        if (module){
                            let plugins:any = {};
                            if (module.plugins?.cache)
                                plugins.cache = pack.options.plugins.cache;
                            if (module.plugins?.db)
                                plugins.db = {default: pack.options.plugins.db};
                            if (module.plugins?.wallet)
                                plugins.wallet = pack.options.plugins.wallet;
                            if (module.plugins?.fetch)
                                plugins.fetch = pack.options.plugins.fetch || {methods: ['GET']}
                            let params = {};
                            for (let v in module.params)
                                params[v] = module.params[v];
                            for (let v in worker.params)
                                params[v] = worker.params[v];
                            let plugin = new Worker({
                                dependencies: module.moduleScript.dependencies,
                                script: module.moduleScript.script,
                                params: params,
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
                                    if (route.plugins?.wallet)
                                        plugins.wallet = options.plugins.wallet;
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
                let worker:IQueueWorkerOptions = this.options.workers[i];
                if (!worker.disabled)
                    this.runWorker(worker);
            };
        }
    };
    async stop(): Promise<void>{
        if (!this.started)
            return;
        await this.queue.stop();
        if (this.options.workers){
            for (let i = 0; i < this.options.workers.length; i++) {
                let worker: IQueueWorkerOptions = this.options.workers[i];
                if (worker.queue){
                    await worker.queue.stop();
                    worker.queue = null;
                };
            };
        };
        this.started = false;
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