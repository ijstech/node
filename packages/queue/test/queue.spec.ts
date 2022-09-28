import assert from 'assert';
import Config from './config.js';
import {getJobQueue} from '../src';

describe('Job Queue', function () {
    it('Process Jobs', async function(){
            let queue = getJobQueue(Config);                
            return new Promise(async (resolve)=>{            
                let count = 0
                queue.processJob(async (job)=>{                                                
                    count++;
                    if (count == 2)
                        await queue.createJob({id: 'job3', data: 'hello'})
                    if (count == 3)
                        resolve();
                    return {id: job.id, data: 'ok'}
                });

                let job = await queue.createJob({id: 'job1', data: 'hello'}, true)
                assert.strict(job.status, 'succeeded');
                assert.strict(job.result.data, 'ok');
                job = await queue.createJob({id: 'job2', data: 'hello'})
                assert.strict(job.status, 'created');
            })
    });
});