import {IWorkerPlugin, ISession, task, step} from '@ijstech/plugin';
import dbClient from '@ijstech/db';

export default class Worker implements IWorkerPlugin {
    @task()
    async process(session: ISession, data: any): Promise<any> {  
        let result = await dbClient.query('SELECT SYSDATE() as sysdate');
        return result;
    };
};