import {IWorkerPlugin, ISession} from '@ijstech/plugin';

export default class Worker implements IWorkerPlugin {    
    async process(session: ISession, data?: any): Promise<any> {
        console.dir('### data ###')
        console.dir(data)
        console.dir('### session.params ###')
        console.dir(session.params);
        session.params.updated = new Date();
    };
};