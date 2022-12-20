import {IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
import BigNumber from 'bignumber.js';
import {hello} from 'pack1';

export default class HelloWorld implements IRouterPlugin{    
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>{
        console.dir(new BigNumber('1').toString())
        response.end(hello());
        return true;
    }
}
