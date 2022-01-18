import {IWorkerPlugin, ISession} from '@ijstech/node';

class Worker implements IWorkerPlugin {
    private count: number = 0;
    async process(session: ISession, data: any): Promise<any> {
        this.count++;
        console.dir('message from worker');        
        return {
            msg: 'hello from worker',
            data: data,
            count: this.count
        };
    }
    message(session: ISession, channel: string, msg: string){
        console.dir('message received inside worker: ' + channel + ' ' + msg);
    };
}
export default Worker;