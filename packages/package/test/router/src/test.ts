import {IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
import BigNumber from 'bignumber.js';

export default class HelloWorld implements IRouterPlugin{    
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>{
        response.end(new BigNumber('1').toString());
        return true;
    }
}
