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
    private httpServer: HttpServer;    
    private scheduler: Scheduler;
    private queue: Queue;
    private running: boolean;

    constructor(options: IAppServerOptions){
        this.options = options;
    }
    async start(){
        if (this.running)
            return;                    
        if (this.options.http && (this.options.http.port || this.options.http.securePort)){
            this.httpServer = new HttpServer(this.options.http);
            this.httpServer.start();
        };
        if (this.options.schedule){
            this.scheduler = new Scheduler(this.options.schedule);
            this.scheduler.start();
        }
        if (this.options.queue){
            this.queue = new Queue(this.options.queue);
            this.queue.start();
        }
        this.running = true;                
    };
};