import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import {ERC20} from 'erc20';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;
        let erc20 = new ERC20(wallet, data.contract);
        let result = {
            name: await erc20.name(),
            symbol: await erc20.symbol(),
            totalSupply: (await erc20.totalSupply()).toNumber(),            
            cap: (await erc20.cap()).toNumber()
        }
        return result;
    };
};
export default Worker;