import {IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
export default class Router implements IRouterPlugin {    
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean> {
        let result = {
            method: request.method,
            url: request.url,
            session: session.params,
            params: request.params,
            query: request.query,
            body: request.body,
            hello: true
        };
        response.end(result);
        return true;
    }
};