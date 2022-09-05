import {IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
import {hello} from 'pack1';

export default class HelloWorld implements IRouterPlugin{    
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>{
        response.end(hello());
        return true;
    }
}
