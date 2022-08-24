import {IWorkerPlugin, ISession} from '@ijstech/plugin';

export default class HelloWorld implements IWorkerPlugin{    
    async process(session: ISession, data: any): Promise<any> {        
        console.dir('Worker !')
        console.dir(data)
        return true;
    }
}