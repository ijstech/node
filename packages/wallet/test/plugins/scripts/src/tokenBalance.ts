import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import {ERC20} from 'erc20';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;
        let erc20 = new ERC20(wallet, data.contract);
        let result = await erc20.balanceOf(data.account);
        return result.toNumber();
    };
};
export default Worker;