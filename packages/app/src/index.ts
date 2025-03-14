/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import Fs from 'fs';
import Path from 'path';
import {IHttpServerOptions, HttpServer} from '@ijstech/http';
import {ISchedulerOptions, Scheduler} from '@ijstech/schedule';
import {IQueueOptions, Queue} from '@ijstech/queue';
import {PackageManager, IPackageOptions} from '@ijstech/package';

import {ICacheClientOptions, IDbConnectionOptions, IJobQueueConnectionOptions, IMessageConnection, IWalletAccount, IWalletNetworks} from '@ijstech/types'
const RootPath = process.cwd();

export interface IPlugin{
    scriptPath?: string;
    baseUrl?: string;
};
export interface IPlugins{
    [name: string]: IPlugin;
};
export interface IAppServerOptions{    
    http?: IHttpServerOptions;
    schedule?: ISchedulerOptions;
    queue?: IQueueOptions;
    package?: IPackageOptions;
};
function updateScriptPath(items: {scriptPath?: string}[]){
    if (items){
        for (let i = 0; i < items.length; i ++){
            if (items[i].scriptPath){
                if (items[i].scriptPath.endsWith('.ts'))
                    items[i].scriptPath = 'src/' + items[i].scriptPath
                else if (items[i].scriptPath.endsWith('.js'))
                    items[i].scriptPath = 'lib/' + items[i].scriptPath
            }
        }
    }
}
export interface IDomainOptions{
    cache?: ICacheClientOptions,
    db?: IDbConnectionOptions,
    queue?: IJobQueueConnectionOptions,
    message?: IMessageConnection,
    wallet?: {
        networks: IWalletNetworks;
        accounts?: IWalletAccount[];
    }
}
export class AppServer {    
    private options: IAppServerOptions;        
    public httpServer: HttpServer;    
    public scheduler: Scheduler;
    public queue: Queue;
    public running: boolean;
    private _packageManager: PackageManager;

    constructor(options: IAppServerOptions){
        this.options = options;
        if (this.options.package)
            this._packageManager = new PackageManager(this.options.package);
        if (this.options.http && (this.options.http.port || this.options.http.securePort)){
            
            if (this.options.http.router?.module && !this.options.http.router?.routes){
                try{
                    let SCConfig = JSON.parse(Fs.readFileSync(Path.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                    updateScriptPath(SCConfig.routes);
                    this.options.http.router?.routes
                }
                catch(err){
                    console.dir(err)
                }                
            };
            this.httpServer = new HttpServer(this.options.http);
        };
        if (this.options.schedule){
            if (this._packageManager && !this.options.schedule.packageManager)
                this.options.schedule.packageManager = this._packageManager;
            if (this.options.schedule.module && !this.options.schedule.jobs){
                try{
                    let SCConfig = JSON.parse(Fs.readFileSync(Path.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                    updateScriptPath(SCConfig.jobs);
                    this.options.schedule.jobs = SCConfig.jobs;
                }
                catch(err){
                    console.dir(err)
                }
            };
            this.scheduler = new Scheduler(this.options.schedule);
        };
        if (this.options.queue){
            if (this._packageManager && !this.options.queue.packageManager)
                this.options.queue.packageManager = this._packageManager;
            if (this.options.queue.module && !this.options.queue.workers){
                try{
                    let SCConfig = JSON.parse(Fs.readFileSync(Path.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                    updateScriptPath(SCConfig.workers);
                    this.options.queue.workers = SCConfig.workers;
                }
                catch(err){
                    console.dir(err)
                }
            };
            this.queue = new Queue(this.options.queue);
        };
    };
    get packageManager(): PackageManager {
        return this._packageManager;
    };
    async start(){
        if (this.running)
            return;                    
        if (this.options.http && (this.options.http.port || this.options.http.securePort))
            this.httpServer.start();
        if (this.options.schedule)         
            this.scheduler.start();
        if (this.options.queue)
            this.queue.start();
        this.running = true;                
    };
    async stop(){
        if (!this.running)
            return;                    
        if (this.httpServer)
            await this.httpServer.stop();
        if (this.scheduler)         
            this.scheduler.stop();
        if (this.queue)
            this.queue.stop();
        this.running = false;  
    }
};