import * as Types from './types';
export class DBClient{
    private _options: Types.IDBConnection;
    constructor(options?: Types.IDBConnection){
        this._options = options;
    };
    applyQueries(queries: Types.IQuery[]): Promise<Types.IQueryResult[]> {
        return new Promise(async resolve => {
            let data = await fetch(this._options?.url || '/pdm', {
                method: 'POST',
                body: JSON.stringify(queries),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let result = await data.json();
            resolve(result)
        });
    };
    checkTableExists(tableName: string): Promise<boolean> {
        return new Promise(resolve => resolve(true));
    };
    syncTableSchema(tableName: string, fields: Types.IFields): Promise<boolean> {
        return new Promise(resolve => resolve(true));
    };
    syncTableIndexes(tableName: string, indexes: Types.ITableIndexProps[]): Promise<boolean> {
        return new Promise(resolve => resolve(true));
    };
};