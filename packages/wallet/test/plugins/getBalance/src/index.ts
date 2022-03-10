import {IWorkerPlugin, ISession} from '@ijstech/types';
import {ERC20} from 'erc20';

class Worker implements IWorkerPlugin {
    private count: number = 0;
    async process(session: ISession, data: any): Promise<any> {
        try{
            let wallet = session.plugins.wallet;
            let erc20 = new ERC20(wallet, '0x9e185f9a8a4f5cd94d6bd612f97aa16506930a0a');
            let balance = await wallet.balance;
            let symbol = await erc20.symbol();            
            let tokenBalance = await erc20.balanceOf(wallet.address)
            return {
                address: wallet.address,
                eth_balance: balance.toString(),
                token_symbol: symbol,
                token_balance: tokenBalance.toString()
            }
        }
        catch(err){
            console.dir(err);
        }
    }
}
export default Worker;