/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import * as PDM from './pdm';
import * as Types from '@ijstech/types';
import * as DB from '@ijstech/db';
export default PDM;

export function loadPlugin(worker: Types.IWorker, options: any): any{    
    let client: DB.IClient;
    let graphql: PDM.TGraphQL;
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
        async graphQuery(schema: PDM.ISchema, query: string): Promise<any>{
            let graphql = new PDM.TGraphQL(schema, client);
            return await graphql.query(query);
        },
        graphIntrospection(schema: PDM.ISchema): any{
            let graphql = new PDM.TGraphQL(schema, client);
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