import {IWorkerPlugin, ISession} from '@ijstech/plugin';

export default class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {        
        try{
            return {
                test: 'test1'
            }
        }
        catch(err){
            console.dir(err)
        }
    };
};