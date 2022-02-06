import {IWorkerPlugin, ISession} from '@ijstech/types';
import {Demo} from '@pack/demo';

class Worker implements IWorkerPlugin {
    private count: number = 0;
    async process(session: ISession, data: any): Promise<any> {
        try{
            let demo = new Demo();        
            this.count++;
            console.dir('message from worker');        
            return {
                msg: demo.hello(),
                data: data,
                count: this.count
            };
        }
        catch(err){
            console.dir(err.message)
        }
    }
    message(session: ISession, channel: string, msg: string){
        console.dir('message received inside worker: ' + channel + ' ' + msg);
    };
}
export default Worker;