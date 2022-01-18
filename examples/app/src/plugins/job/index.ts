import {IWorkerPlugin, ISession} from '@ijstech/node';

class Worker implements IWorkerPlugin{
   async process(session: ISession, data: any): Promise<any> {
       console.dir('Message from schedule job');
       console.dir(session.params)
       return;
   }
   message(session: ISession, channel: string, msg: string){
        console.dir('message received inside job: ' + channel + ' ' + msg);
   }
}
export default Worker;
