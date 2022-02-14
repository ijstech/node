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
                        db: {
                            "db1": {
                                mysql: Config.mysql
                            }
                        },
                        message: {
                            connection: {
                                redis: Config.redis
                            },
                            subscribe: ['msg_channel1']
                        }
                    },
                    dependencies: {
                        "@pack/demo": "file:../demoPack"
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
                        db: {
                            "db1": {
                                mysql: Config.mysql
                            }
                        },
                        message: {
                            connection: {
                                redis: Config.redis
                            },
                            publish: ['msg_channel1']
                        }
                    },
                    dependencies: {
                        "@pack/demo": "file:../demoPack"
                    }
                }
            ]
        }
    };
    let app = new AppServer(Options);
    app.start();
};
main();