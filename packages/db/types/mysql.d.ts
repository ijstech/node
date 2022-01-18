import * as Types from '@ijstech/types';
import * as MySQL from 'mysql';
export declare class MySQLClient implements Types.IDBClient {
    private _connection;
    private options;
    private transaction;
    constructor(options: Types.IMySQLConnection);
    get connection(): MySQL.Connection;
    private end;
    beginTransaction(): Promise<boolean>;
    commit(): Promise<boolean>;
    query(sql: string, params?: any[]): Promise<any>;
    rollback(): Promise<boolean>;
}
