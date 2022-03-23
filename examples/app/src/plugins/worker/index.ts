import {IWorkerPlugin, ISession} from '@ijstech/types';
import {Demo} from '@pack/demo';

class Worker implements IWorkerPlugin {
    private count: number = 0;
    async init(params?: any): Promise<void> {
        console.dir('worker init');
    };
    async process(session: ISession, data: any): Promise<any> {
        try{
            if (data && data.channel){
                console.dir('message received inside worker: ' + data.channel + ' ' + data.msg);
            }
            else{
                let demo = new Demo();        
                this.count++;
                console.dir('message from worker');        
                return {
                    msg: demo.hello(),
                    data: data,
                    count: this.count
                };
            }
            
        }
        catch(err){
            console.dir(err.message)
        }
    };
}
export default Worker;