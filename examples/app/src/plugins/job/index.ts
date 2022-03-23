import { IWorkerPlugin, ISession } from '@ijstech/types';
import { Demo } from '@pack/demo';

class Worker implements IWorkerPlugin {
    async init(params?: any): Promise<void> {
        console.dir('job init')
    };
    async process(session: ISession, data: any): Promise<any> {
        console.dir('Message from schedule job');
        console.dir(session.params)
        if (data && data.channel){
            console.dir('message received inside job: ' + data.channel + ' ' + data.msg);
        }
        else{
            try {
                let demo = new Demo();
                console.dir('demo.hello: ' + demo.hello())
            }
            catch (err) {
                console.dir(err.message)
            }
        }
        return;
    }
}
export default Worker;
