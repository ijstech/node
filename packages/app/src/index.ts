/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {IHttpServerOptions, HttpServer} from '@ijstech/http';
import {ISchedulerOptions, Scheduler} from '@ijstech/schedule';
import {IQueueOptions, Queue} from '@ijstech/queue';

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
export class AppServer {    
    private options: IAppServerOptions;        
    public httpServer: HttpServer;    
    public scheduler: Scheduler;
    public queue: Queue;
    public running: boolean;

    constructor(options: IAppServerOptions){
        this.options = options;
        if (this.options.http && (this.options.http.port || this.options.http.securePort)){
            this.httpServer = new HttpServer(this.options.http);
        };
        if (this.options.schedule){
            this.scheduler = new Scheduler(this.options.schedule);
        };
        if (this.options.queue){
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