import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import Wallet from '@ijstech/wallet';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        return await Wallet.getBlockNumber();  
    };
};
export default Worker;