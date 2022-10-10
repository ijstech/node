import {AppServer} from '../src';
import Path from 'path';
import Config from './data/config';

import * as Ganache from "ganache";
let Provider = Ganache.provider();
const wallet = {
    accounts: null,
    chainId: 5777,
    networks: {
        5777: {
            chainName: "Ganache",
            provider: Provider
        }
    }
};
let server: AppServer;
async function init(){
    setTimeout(async () => {
        await Provider.send("evm_mine", [{blocks: 1}] );    
    }, 2000);
    server = new AppServer({        
        package: {
            storage: Config.storage,
            packages: {
                "@demo/sdk": [{
                    path: Path.resolve(__dirname, 'sdk'),
                    version: "*"
                }]
            }
        },
        schedule: {
            worker: {
                enabled: false,
                jobQueue: 'schedule',
                connection: Config.worker.connection
            },
            domains: {
                "localhost": [
                    {
                        packagePath: Path.resolve(__dirname, 'worker'),
                        options: {
                            plugins: {
                                wallet: wallet
                            }
                        }
                    }
                ]
            }
        },
        queue: {
            jobQueue: 'schedule',
            connection: Config.worker.connection,
            domains: {
                "localhost": {
                    workers: [{                    
                        packagePath: Path.resolve(__dirname, 'worker'),
                        options: {
                            plugins: {
                                wallet: wallet
                            }
                        }
                    }]
                }
            }
        }
    });
    server.start();
}
init();