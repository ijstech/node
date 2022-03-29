import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import wallet from '@ijstech/wallet';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        wallet.defaultAccount = data.account;
        let balance = await wallet.balance;
        let balanceOf = await wallet.balanceOf(data.account);
        return {
            account: wallet.account.address,
            balance: balance.toNumber(),
            balanceOf: balanceOf.toNumber()
        };
    };
};
export default Worker;