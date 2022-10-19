import {IWorkerPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
import Fetch from '@ijstech/fetch';

export default class Worker implements IWorkerPlugin {    
    async process(session: ISession, data?: any): Promise<any> {  
        let result:any = {
            params: session.params,
            data: data
        };
        if (data?.param1 == 'fetch'){
            console.dir('fetch')
            try{
                let r = await Fetch.get('https://postman-echo.com/get?param1=param1value');
                console.dir(r)
            }
            catch(err){
                console.dir(err)
            };   
        };
        if (data?.param1 == 'db'){
            console.dir('## db')                     
            try{
                let client = session.plugins.db.getConnection();            
                result.dbResult = await client.query('select sysdate() as sysdate');
                console.dir(result.dbResult)
            }
            catch(err){
                console.dir(err)
            }
        };
        if (data?.param1 == 'cache'){
            console.dir('## cache')
            let value = new Date().getTime().toString();
            await session.plugins.cache.set('param1', value)
            let r = await session.plugins.cache.get('param1');
            result.cacheResult = (value == r);
        };
        return result;
    };
};