import { IWorkerPlugin, ISession } from '@ijstech/node';
import { Demo } from '@pack/demo';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        console.dir('Message from schedule job');
        console.dir(session.params)
        try {
            let demo = new Demo();
            console.dir('demo.hello: ' + demo.hello())
        }
        catch (err) {
            console.dir(err.message)
        }
        return;
    }
    message(session: ISession, channel: string, msg: string) {
        console.dir('message received inside job: ' + channel + ' ' + msg);
    }
}
export default Worker;
