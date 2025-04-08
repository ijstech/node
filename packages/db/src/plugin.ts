import * as Types from '@ijstech/types';
export const Plugin: Types.IDBClient = {
        async applyQueries(queries: Types.IQuery[]): Promise<any>{
            let plugin: Types.IDBClient = global.$$plugin_db_default_default;
            let result = await plugin.applyQueries(queries);
            return result;
        },
        beginTransaction(): Promise<boolean>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            return plugin.beginTransaction();
        },
        async checkTableExists(tableName: string): Promise<boolean>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            let result = await plugin.checkTableExists(tableName);
            return result;
        },
        commit(): Promise<boolean>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            return plugin.commit();
        },
        async query(sql:string, params?: any[]): Promise<any>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            let result = await plugin.query(sql, params);
            return result;
        },            
        async resolve(table: string, fields: Types.IFields, criteria: any, args: any): Promise<any>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            let result = await plugin.resolve(table, fields, criteria, args);
            return result;
        },
        rollback(): Promise<boolean>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            return plugin.rollback();
        },
        async syncTableSchema(tableName: string, fields: Types.IFields): Promise<boolean>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            return await plugin.syncTableSchema(tableName, fields);
        },
        async syncTableIndexes(tableName: string, indexes: Types.ITableIndexProps[]): Promise<boolean>{
            let plugin: Types.IDBClient = global.$$plugin_db_default;
            return await plugin.syncTableIndexes(tableName, indexes);
        }
    };
export default Plugin;