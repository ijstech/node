/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {MySQLClient} from './mysql';
import {VM} from '@ijstech/vm';
import * as Types from '@ijstech/types';

let Clients = {};
export interface IClient extends Types.IDBClient{
    import(sql: string): Promise<boolean>;
};
export function getClient(options?: Types.IDbConnectionOptions): IClient{
    if (options.mysql){
        let opt = options.mysql;
        let id = opt.host + ':' + opt.user + ':' + opt.database;
        if (!Clients[id])
            Clients[id] = new MySQLClient(opt);
        return Clients[id];
    }
};
function getPluginClient(vm: VM, db: string, client: Types.IDBClient): string{
    let name = '$$plugin_db_' + db;
    let plugin: Types.IDBClient = {
        async applyQueries(queries: Types.IQuery[]): Promise<any>{
            let result = await client.applyQueries(queries);
            return JSON.stringify(result);
        },
        beginTransaction(): Promise<boolean>{
            return client.beginTransaction();
        },
        async checkTableExists(tableName: string): Promise<boolean>{
            let result = await client.checkTableExists(tableName);
            return result;
        },
        commit(): Promise<boolean>{
            return client.commit();
        },
        async query(sql:string, params?: any[]): Promise<any>{
            let result = await client.query(sql, params);
            return JSON.stringify(result);
        },            
        async resolve(table: string, fields: Types.IFields, criteria: any, args: any): Promise<any>{
            let result = await client.resolve(table, fields, criteria, args);
            return JSON.stringify(result);
        },
        rollback(): Promise<boolean>{
            return client.rollback();
        },
        async syncTableSchema(tableName: string, fields: Types.IFields): Promise<boolean>{
            return await client.syncTableSchema(tableName, fields);
        }
    };
    (plugin as any)["$$query_json"] = true;
    (plugin as any)["$$resolve_json"] = true;
    if (!vm.loadedPlugins[name]){
        vm.loadedPlugins[name] = true;        
        vm.injectGlobalObject(name, plugin);
    };
    return name;
}
export function loadPlugin(plugin: Worker, options: Types.IDBRequiredPluginOptions, vm?: VM): Types.IDBPlugin{
    return {         
        getConnection(name?: string): Types.IDBClient | string{            
            let opt: any;
            if (name)
                opt = options[name]
            else{
                opt = options[Object.keys(options)[0]]
            }
            if (vm){                
                let client = getClient(opt);
                return getPluginClient(vm, name, client);
            }            
            else
                return getClient(opt);
        }
    };
};
export default loadPlugin;