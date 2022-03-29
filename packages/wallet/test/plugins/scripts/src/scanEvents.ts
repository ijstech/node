import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import wallet from '@ijstech/wallet';
import {IWalletEvent} from '@ijstech/types';

class Worker implements IWorkerPlugin {
    async eventHandler(event: IWalletEvent){
        event.data.handled = true;
    };
    async process(session: ISession, data: any): Promise<any> {        
        if (data.abi){
            let hash = wallet.registerAbi(data.abi, data.address, this.eventHandler.bind(this));
        }
        let events = await wallet.scanEvents(data.fromBlock, data.toBlock);
        return events;
    };
};
export default Worker;