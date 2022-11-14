import { IWorkerPlugin, ISession } from '@ijstech/plugin';
declare class Worker implements IWorkerPlugin {
    process(session: ISession, data: any): Promise<any>;
}
export default Worker;
