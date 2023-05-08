import * as Types from './types';
export declare class DBClient {
    private _options;
    constructor(options?: Types.IDBConnection);
    applyQueries(queries: Types.IQuery[]): Promise<Types.IQueryResult[]>;
    checkTableExists(tableName: string): Promise<boolean>;
    syncTableSchema(tableName: string, fields: Types.IFields): Promise<boolean>;
}
