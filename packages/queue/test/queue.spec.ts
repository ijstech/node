import assert from 'assert';
import Config from './config.js';
import {getJobQueue} from '../src';

function sleep(seconds: number): Promise<boolean>{
    return new Promise((resolve)=>{
        setTimeout(() => {
            // console.dir('timeout')
            resolve(true);
        }, seconds);
    })
}
describe('Job Queue', function () {
    this.timeout(30000);
    let processCount = 0;
    before(async function(){
        let queue = getJobQueue(Config);  
        queue.processJob(async (job)=>{      
            console.dir('## queue: ' + job.id);
            processCount ++; 
            // await sleep(2);
            console.dir(job.data);
            return {id: job.id, data: 'ok'}
        });
    })
    it('Process Jobs', async function(){
        let queue = getJobQueue(Config);                
        return new Promise(async (resolve)=>{
            let job = await queue.createJob({id: 'job1', data: 'hello'}, false, {id: 'job1'})
            assert.strictEqual(job.id, 'job1');
            assert.strictEqual(job.status, 'created');
            job = await queue.createJob({id: 'job1', data: 'hello'}, false, {id: 'job1'})
            assert.strictEqual(job.id, null);
            job = await queue.createJob({id: 'job1', data: 'hello'}, false, {id: 'job1'})
            assert.strictEqual(job.id, null);
            await sleep(4);
            job = await queue.createJob({id: 'job1', data: 'hello'}, false, {id: 'job1'})
            assert.strictEqual(job.id, 'job1');
            assert.strictEqual(job.status, 'created');      

            job = await queue.createJob({id: 'job2', data: 'hello'}, true)
            assert.strictEqual(job.status, 'succeeded');
            assert.strictEqual(job.result.data, 'ok');    

            job = await queue.createJob({id: 'job3', data: 'hello'}, true, {id: 'job3'});
            assert.strictEqual(processCount, 4);
            if (job.result.id == 'job3')
                resolve();
        })
    });
});