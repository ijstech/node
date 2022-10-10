import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import Wallet from '@ijstech/wallet';
import {BigNumber} from 'bignumber.js';
import SDK from '@demo/sdk';

export default class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {
        try{
            let latestBlock = await Wallet.getBlockNumber();
            console.dir(latestBlock);
        }
        catch(err){
            console.dir(err)
        }
    };
};