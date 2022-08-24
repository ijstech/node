/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import Fs from 'fs';
import Path from 'path';
import {IHttpServerOptions, HttpServer} from '@ijstech/http';
import {ISchedulerOptions, Scheduler} from '@ijstech/schedule';
import {IQueueOptions, Queue} from '@ijstech/queue';
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
export class AppServer {    
    private options: IAppServerOptions;        
    public httpServer: HttpServer;    
    public scheduler: Scheduler;
    public queue: Queue;
    public running: boolean;

    constructor(options: IAppServerOptions){
        this.options = options;
        if (this.options.http && (this.options.http.port || this.options.http.securePort)){
            if (this.options.http.router?.module && !this.options.http.router?.routes){
                let SCConfig = JSON.parse(Fs.readFileSync(Path.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                updateScriptPath(SCConfig.routes);
                this.options.http.router?.routes
            };
            this.httpServer = new HttpServer(this.options.http);
        };
        if (this.options.schedule){
            if (this.options.schedule.module && !this.options.schedule.jobs){
                let SCConfig = JSON.parse(Fs.readFileSync(Path.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                updateScriptPath(SCConfig.jobs);
                this.options.schedule.jobs = SCConfig.jobs;
            };
            this.scheduler = new Scheduler(this.options.schedule);
        };
        if (this.options.queue){
            if (this.options.queue.module && !this.options.queue.workers){
                let SCConfig = JSON.parse(Fs.readFileSync(Path.join(RootPath, this.options.http.router.module, 'scconfig.json'), 'utf-8'));
                updateScriptPath(SCConfig.workers);
                this.options.queue.workers = SCConfig.workers;
            };
            this.queue = new Queue(this.options.queue);
        };
    }
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
};