import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import Wallet from '@ijstech/wallet';
import {ERC20} from '@demo/sdk';

export default class Worker implements IWorkerPlugin {    
    async process(session: ISession, data?: any): Promise<any> {
        if (!session.params.init){
            let accounts = await Wallet.accounts;
            try{
                let erc20 = new ERC20(Wallet);
                let result = await erc20.deploy();
                console.dir('Deploy ERC20: ' + result)
                await erc20.mint(1000000);
                console.dir(`Account balance ${accounts[0]}: ${await erc20.balanceOf(accounts[0])}`)
                let r = await erc20.transfer({
                    amount: 100,
                    recipient: accounts[1]
                });
                console.dir(`Account balance ${accounts[1]}: ${await erc20.balanceOf(accounts[1])}`)
            }
            catch(err){
                console.dir(err)
            }
        }
        session.params.init = true;            
        try{
            let result = await Wallet.getBlockNumber();
            console.dir('Latest Block: ' + result);
        }
        catch(err){
            console.dir(err)
        }
    };
};