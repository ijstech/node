import {IWorkerPlugin, ISession} from '@ijstech/plugin';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;
        wallet.defaultAccount = data.from;
        let result = await wallet.send(data.to, data.amount);
        return result;
    };
};
export default Worker;