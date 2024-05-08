export interface IField{
    prop?: string;
    field?: string;
    record?: string;
    size?: number;
    details?: any;
    table?: string;
    dataType?: 'key'|'ref'|'1toM'|'char'|'varchar'|'boolean'|'integer'|'decimal'|'date'|'dateTime'|'time'|'blob'|'text'|'mediumText'|'longText';
}
export interface IQueryData{[prop: string]: any}
export interface IQueryRecord{
    a: 'i'|'d'|'u', //insert, delete/ update
    k: string;
    d: IQueryData;
}
export interface IQuery{
    id: number;
    table: string;
    fields: IFields;
    queries?: any[];
    records?: IQueryRecord[];
}
export interface IQueryResult {
    id?: number;
    result?: any;
    error?: string;
}
export interface IDBClient{
    applyQueries(queries: IQuery[]): Promise<IQueryResult[]>;
    checkTableExists(tableName: string): Promise<boolean>;
    syncTableSchema(tableName: string, fields: IFields): Promise<boolean>;
    syncTableIndexes(tableName: string, indexes: ITableIndexProps[]): Promise<boolean>;
};
export interface IFields{[name: string]: IField};
export interface ISchema {[tableName: string]: IFields};
export interface IGraphClient{
    init(schema: ISchema, dbClient: IDBClient): void;
    query: (query: string, variables?: any) => Promise<any>;
    introspection: () => Promise<any>;
};
export interface IDBConnection{
    url: string;
};
export type TableIndexType = 'UNIQUE'|'NON_UNIQUE';
export interface ITableIndexProps{
    name: string;
    columns: string[]; 
    type?: TableIndexType;
};