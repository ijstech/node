import {AppServer, IAppServerOptions} from "@ijstech/node";
import Config from '../data/config.js';

async function main(){
    const Options: IAppServerOptions = {        
        queue: {
            workers: [
                {
                    connection: {
                        redis: Config.redis
                    },
                    jobQueue: 'job_queue_1',
                    isolated: true,                    
                    scriptPath: './plugins/worker/index.js',                    
                    plugins: {
                        cache: {},
                        message: {
                            connection: {
                                redis: Config.redis
                            },
                            subscribe: ['msg_channel1']
                        }
                    }
                }
            ]
        },
        schedule: {
            jobs: [
                {   
                    isolated: true,                    
                    cron: '*/4 * * * * *', //every 4 seconds
                    scriptPath: './plugins/job/index.js',                    
                    params: {
                        msg: 'hello'
                    },
                    plugins: {
                        message: {
                            connection: {
                                redis: Config.redis
                            },
                            publish: ['msg_channel1']
                        }
                    }
                }
            ]
        }
    };
    let app = new AppServer(Options);
    app.start();
};
main();