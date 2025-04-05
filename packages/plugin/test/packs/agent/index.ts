import {task, step, IWorkerPlugin, ISession} from '@ijstech/plugin';
import Fetch from '@ijstech/fetch';

export default class Worker implements IWorkerPlugin {
    @task({name: 'test'})
    async process(session: ISession, data?: any): Promise<any> {   
        let result = {
            step1: false,
            step2: false,
            step3: false
        }
        result.step1 = await this.step1();
        result.step2 = await this.step2();
        result.step3 = await this.step3();
        return result;
    };
    
    @step()
    async step1(): Promise<any> {
        let r = await Fetch.get('https://postman-echo.com/get?param1=param1value');
        if (r.status == 200 )
            return true;
    };
    @step()
    async step2(): Promise<any> {
        return true;
    };
    @step()
    async step3(): Promise<any> {
        return true;
    };
};