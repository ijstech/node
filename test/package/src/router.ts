import {IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';

export default class HelloWorld implements IRouterPlugin{    
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>{
        response.end('hello!');
        return true;
    }
}