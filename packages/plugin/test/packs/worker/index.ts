import {IWorkerPlugin, ISession, task, step} from '@ijstech/plugin';

export default class Worker implements IWorkerPlugin {
    @task()
    async process(session: ISession, data: any): Promise<any> {    
        let retryCount = await this.step1();
        return {retryCount: retryCount};
    };
    @step({maxAttempts: 3})    
    async step1(){
        let self = this as any;
        if (!self.retryCount){
            self.retryCount = 1;
            throw new Error('error')
        };
        self.retryCount ++;
        return self.retryCount;
    }
};