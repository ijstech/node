export * from './pdm';
import * as Types from '@ijstech/types';
import * as DB from '@ijstech/db';

export function loadPlugin(worker: Types.IWorker, options: any): any{    
    let client: DB.IClient;
    if (worker.vm){
        if (!client)
            client = DB.getClient(options.db1);
        worker.vm.injectGlobalObject('$$pdm_plugin', {
            async applyQueries(queries: any): Promise<any>{    
                let result = await client.applyQueries(queries);
                return JSON.stringify(result);
            }
        });
    }
    else{
        if (!client)
            client = DB.getClient(options.db1);
        global['$$pdm_plugin'] = {
            async applyQueries(queries: any): Promise<any>{
                let result = await client.applyQueries(queries);
                return result;
            }
        };
    };
};