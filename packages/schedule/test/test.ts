import assert from "assert";
import {Scheduler} from '../src';
import Path from 'path';
import Config from './data/config';
import {Queue} from '@ijstech/queue';

async function test(){    
    let queue1 = new Queue(Config.worker);
    await queue1.addDomainWorker('localhost', {
        packagePath: Path.resolve(__dirname, 'worker'), 
        options: Config
    });
    queue1.start();

    let scheduler1 = new Scheduler({
        worker: Config.worker,
        domains: {
            "localhost": [{
                pack: {
                    packagePath: Path.resolve(__dirname, 'worker'), 
                    options: Config
                }
            }]
        }
    });    
    scheduler1.start();  

    let scheduler2 = new Scheduler({
        worker: Config.worker,
        domains: {
            "localhost": [{
                pack: {
                    packagePath: Path.resolve(__dirname, 'worker'), 
                    options: Config
                }
            }]
        }
    });     
    scheduler2.start();  
}
test();
    