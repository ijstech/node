import { Wallet } from '@ijstech/eth-wallet';
import {IRequiredPlugins, IRouterPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/node';
import {helloWorld} from './hello';

class HelloWorld implements IRouterPlugin{
    message(channel: string, msg: string):void{

    }
    async route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean> {        
        if (request.path == '/job'){
            let job;
            try{
                job = await session.plugins.queue.createJob('job_queue_1', request.query, true);
                response.end(JSON.stringify(job, null, 4));
            }
            catch(err){
                console.dir('exception')
                console.dir(err.message)
            }
        }
        else if (request.path == '/message'){
            session.plugins.message.publish(0, JSON.stringify(request.query))
            response.end(JSON.stringify({
                action: 'publish_message',
                channel: 0,
                msg: request.query
            }, null, 4))
        }
        else if (request.path == '/proxy'){
            let target = {
                x: 10,
                y: 20
            };
            
            let hanler = {
                get: (obj:any, prop:any) => 42
            };
            
            target = new Proxy(target, hanler);
            response.end('target.x: ' + target.x)
        }
        else if (request.path == '/cache'){
            let key = 'cache_key';
            let data = '';
            try{
                data = await session.plugins.cache.get(key);
                await session.plugins.cache.set(key, request.query);
            }
            catch(err){}            
            response.end(JSON.stringify({
                cachedData: data
            }, null, 4))
        }
        else if (request.path == '/wallet'){
            try{
                let chainId = session.plugins.wallet.chainId || 1;                
                let balance = await session.plugins.wallet.getBalance();
                let address = session.plugins.wallet.address;
                response.end(JSON.stringify({
                    address: address,
                    balance: balance || 0,
                    chainId: chainId
                }, null, 4))
            }
            catch(err){
                response.end({
                    error: err.message
                })
            }
        }
        else if (request.path == '/db'){
            let con = session.plugins.db.getConnection('db1');
            try{
                let result = await con.query('select sysdate()');
                response.end(JSON.stringify({
                    result: result
                }, null, 4));
            }
            catch(err){
                console.dir(err.message)
            }
        }
        else{
            response.end(JSON.stringify({
                method: request.method,
                path: request.path,                
                url: request.url,
                origUrl: request.origUrl,
                datetime: new Date(),
                result: helloWorld(),
                query: request.query || '',
                params: request.params || '',
                body: request.body || '',  
                session: {
                    params: session.params
                }            
            }, null, 4));            
        }
        return true;    
    }
}
export default HelloWorld;