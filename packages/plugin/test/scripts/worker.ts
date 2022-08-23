import {IWorkerPlugin, ISession} from '@ijstech/plugin';
import {BigNumber} from 'bignumber.js';
import test from '@ijs/pack1'; //../packs/pack1/index.ts

export default class Worker implements IWorkerPlugin {
    async process(session: ISession, data: any): Promise<any> {        
        try{
            return {
                test: test(),
                value: new BigNumber(data.v1).plus(data.v2).toNumber()
            }
        }
        catch(err){
            console.dir(err)
        }
    };
};