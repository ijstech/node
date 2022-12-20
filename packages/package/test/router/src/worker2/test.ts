import {IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
import {util1} from '../utils';
import BigNumber from 'bignumber.js';

export default class HelloWorld implements IRouterPlugin{    
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>{
        console.dir(util1());
        response.end(new BigNumber('1').toString());
        return true;
    }
}
