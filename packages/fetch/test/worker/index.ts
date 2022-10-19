import {IWorkerPlugin, IRouterRequest, IRouterResponse, ISession} from '@ijstech/plugin';
import Fetch from '@ijstech/fetch';

export default class Worker implements IWorkerPlugin {    
    async process(session: ISession, data?: any): Promise<any> {  
        let r = await Fetch.get('https://postman-echo.com/get?param1=param1value');
        return {
            success: true,
            status: r.status,
            body: r.body
        }
    };
};