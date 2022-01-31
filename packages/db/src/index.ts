import {MySQLClient} from './mysql';
import {VM} from '@ijstech/vm';
import * as Types from '@ijstech/types';

let Clients = {};
export function getClient(options?: Types.IDbConnectionOptions): Types.IDBClient{
    if (options.mysql){
        let opt = options.mysql;
        let id = opt.host + ':' + opt.user + ':' + opt.database;
        if (!Clients[id])
            Clients[id] = new MySQLClient(opt);
        return Clients[id];
    }
};
function getPluginClient(vm: VM, db: string, client: Types.IDBClient): Types.IDBClient{
    let name:any = '$$plugin_db_' + db;
    if (!vm.loadedPlugins[name]){
        vm.loadedPlugins[name] = true;        
        let plugin: Types.IDBClient = {
            async applyQueries(queries: Types.IQuery[]): Promise<Types.IQueryResult[]>{
                let result = await client.applyQueries(queries);
                return result;
            },
            beginTransaction(): Promise<boolean>{
                return client.beginTransaction();
            },
            commit(): Promise<boolean>{
                return client.commit();
            },
            async query(sql:string, params?: any[]): Promise<any>{
                let result = await client.query(sql, params);
                return JSON.stringify(result);
            },
            rollback(): Promise<boolean>{
                return client.rollback();
            }
        }
        vm.injectGlobalObject(name, plugin);        
    }
    return name;
}
export function loadPlugin(plugin: Worker, options: Types.IDBRequiredPluginOptions, vm?: VM): Types.IDBPlugin {
    return {         
        getConnection(name: string): Types.IDBClient{            
            let opt = options[name];
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