import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import {ERC20} from 'erc20';
class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;
        let erc20 = new ERC20(wallet, data.contract);
        return {
            name: await erc20.name(),
            symbol: await erc20.symbol(),
            decimals: (await erc20.decimals()).toNumber(),
            totalSupply:  (await erc20.totalSupply()).toString(10)
        }
    };
};
export default Worker;