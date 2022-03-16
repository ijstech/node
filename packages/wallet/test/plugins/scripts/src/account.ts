import {IWorkerPlugin, ISession} from '@ijstech/plugin';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;
        wallet.defaultAccount = data.account;
        return wallet.account;
    };
};
export default Worker;