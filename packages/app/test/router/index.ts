import {IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
export default class Router implements IRouterPlugin {    
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean> {        
        let result:any = {
            msg: `${request.method} hello`,
            params: request.params
        }
        if (request.params.param1 == 'db'){
            let client = session.plugins.db.getConnection();            
            result.dbResult = await client.query('select sysdate() as sysdate');
        };
        if (request.params.param1 == 'cache'){
            let value = new Date().getTime().toString();
            await session.plugins.cache.set('param1', value)
            let r = await session.plugins.cache.get('param1');
            result.cacheResult = (value == r);
        }
        response.end(result)        
        return true;
    }
};