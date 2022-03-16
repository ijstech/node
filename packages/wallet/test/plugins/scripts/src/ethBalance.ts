import {IWorkerPlugin, ISession} from '@ijstech/plugin';

class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        let wallet = session.plugins.wallet;            
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