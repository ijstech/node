/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import * as PDM from './pdm';
import * as Types from '@ijstech/types';
import * as DB from '@ijstech/db';
import {TGraphQL} from './graphql';
import {ISchema} from './types';
export default PDM;

export function loadPlugin(worker: Types.IWorker, options: any): any{    
    let client: DB.IClient;
    if (!client)
        client = DB.getClient(options[Object.keys(options)[0]]);
    const plugin = {
        async applyQueries(queries: any): Promise<any>{    
            let result = await client.applyQueries(queries);
            if (typeof(result) == 'string')
                return JSON.stringify(result)
            else
                return result;
        },
        async graphQuery(schema: ISchema, query: string): Promise<any>{
            let graphql = new TGraphQL(schema, client);
            return await graphql.query(query);
        },
        graphIntrospection(schema: ISchema): any{
            let graphql = new TGraphQL(schema, client);
            return graphql.introspection;
        }
    }
    if (worker.vm){
        worker.vm.injectGlobalObject('$$pdm_plugin', plugin);
    }
    else{
        global['$$pdm_plugin'] = plugin;
    };
};