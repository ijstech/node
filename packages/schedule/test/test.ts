import assert from "assert";
import {Scheduler} from '../src';
import Path from 'path';
import Config from './data/config';
import {Storage} from '@ijstech/storage';
import {Queue} from '@ijstech/queue';

async function sync(): Promise<string>{
    let storage = new Storage(Config.storage);
    let path = Path.resolve(__dirname, './worker');
    let result = await storage.putDir(path, {ipfs: true, s3:true});
    return result.cid;
}
async function test(){
    let cid: string;    
    if (Config.storage)
        cid = await sync();
    console.dir('#CID: ' + cid);
    let queue1 = new Queue({
        jobQueue: Config.worker.jobQueue,
        connection: Config.worker.connection,
        storage: Config.storage,
        domains: {
            'localhost': {
                workers: [{
                    packagePath: cid?cid:Path.resolve(__dirname, 'worker'), 
                    options: Config
                }]
            }
        }
    });    
    queue1.start();

    let scheduler1 = new Scheduler({
        worker: Config.worker,
        storage: Config.storage,
        domains: {
            "localhost": [{
                pack: {
                    packagePath: cid?cid:Path.resolve(__dirname, 'worker'), 
                    options: Config
                }
            }]
        }
    });    
    scheduler1.start();  

    let scheduler2 = new Scheduler({
        worker: Config.worker,
        storage: Config.storage,
        domains: {
            "localhost": [{
                pack: {
                    packagePath: cid?cid:Path.resolve(__dirname, 'worker'), 
                    options: Config
                }
            }]
        }
    });     
    scheduler2.start();  
}
test();
    