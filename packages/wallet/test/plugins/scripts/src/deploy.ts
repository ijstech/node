import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import {ERC20} from 'erc20';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;
        wallet.defaultAccount = data.account;
        let erc20 = new ERC20(wallet);
        let address = await erc20.deploy({
            cap: data.cap,
            decimals: data.decimals,
            initialSupply: data.initialSupply,
            name: data.name,
            symbol: data.symbol
        });
        return {
            address: address,
            abi: erc20._abi
        };
    };
};
export default Worker;