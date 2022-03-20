import * as Types from '@ijstech/types';
export interface IRecordSet {
    _id: number;
    _queries: any[];
    fields: Types.IFields;
    keyField: Types.IField;
    tableName: string;
    mergeRecords(data: any): any[];
    reset(): void;
}
interface IRecord {
    $$record: any;
    $$proxy: any;
    $$newRecord: boolean;
    $$recordSet: IRecordSet;
    $$keyValue: string;
    $$deleted: boolean;
    $$modified: boolean;
    $$origValues: {
        [prop: string]: any;
    };
    $$modifies: {
        [prop: string]: any;
    };
}
export declare class TContext {
    private $$records;
    private _client;
    private _recordSets;
    private _recordSetIdxCount;
    private _recordIdxCount;
    private _modifiedRecords;
    private _applyQueries;
    private _deletedRecords;
    private _graphql;
    constructor(client?: Types.IDBClient);
    private getApplyQueries;
    private applyDelete;
    private applyInsert;
    private applyUpdate;
    private initRecordsets;
    get graphql(): TGraphQL;
    fetch(recordSet?: IRecordSet): Promise<any>;
    private modifyRecord;
    reset(): void;
    save(): Promise<any>;
}
declare type QueryOperator = 'like' | '=' | '!=' | '<' | '>' | '>=' | '<=';
declare type ArrayQueryOperator = 'in';
declare type RangeQueryOperator = 'between';
declare type QueryFuncOverload<DT> = {
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: QueryOperator, value: T[FieldName]): TQueryAndOr<T>;
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: ArrayQueryOperator, value: T[FieldName][]): TQueryAndOr<T>;
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: RangeQueryOperator, valueFrom: T[FieldName], valueTo: T[FieldName]): TQueryAndOr<T>;
    <T extends DT>(callback: (qr: TQuery<T>) => void): TQueryAndOr<T>;
};
declare class TQueryAndOr<T> {
    private parentQuery;
    private queries;
    constructor(parentQuery?: any);
    and: QueryFuncOverload<T>;
    or: QueryFuncOverload<T>;
}
declare class TQuery<T> {
    private queries;
    constructor(queries?: any);
    where: QueryFuncOverload<T>;
}
interface InsertOptions {
    updateOnDuplicate?: boolean;
    ignoreOnDuplicate?: boolean;
}
export declare class TRecord {
    private $$fields;
    private data;
    private recordSet;
    constructor(recordSet: TRecordSet<any>, data: any);
}
interface IContext {
    applyDelete(recordSet: IRecordSet, query: any[]): void;
    applyInsert(recordSet: IRecordSet, data: any): void;
    applyUpdate(recordSet: IRecordSet, data: Types.IQueryData, query: any[]): void;
    modifyRecord(record: any): void;
}
export declare class TRecordSet<T> {
    private _id;
    private _recordType;
    private _fields;
    private _keyField;
    protected _queries: any[];
    protected _recordsIdx: {};
    protected _records: T[];
    protected _context: TContext;
    protected _master: IRecord;
    protected _masterField: string;
    protected _currIdx: number;
    protected _tableName: string;
    protected _fetchAll: boolean;
    constructor(context: TContext, record: any, tableName: string, master?: IRecord, masterField?: string);
    add<TB extends keyof T>(data?: {
        [C in TB]?: T[C];
    }): T;
    applyInsert<TB extends keyof T>(data: {
        [C in TB]?: T[C];
    }, options?: InsertOptions): void;
    applyDelete(): TQuery<T>;
    applyUpdate<TB extends keyof T>(data?: {
        [C in TB]: T[C];
    }): TQuery<T>;
    get context(): IContext;
    get count(): number;
    get current(): T;
    delete(record: T): void;
    fetch(): Promise<T[]>;
    get fields(): Types.IFields;
    get first(): T;
    protected mergeRecords(records: any[]): any[];
    get next(): T;
    protected get keyField(): Types.IField;
    private proxy;
    get query(): TQuery<T>;
    queryRecord(keyValue: string): Promise<T>;
    records(index: number): T;
    reset(): void;
    get tableName(): string;
    private validateFieldValue;
    values<FieldName extends keyof T>(field: FieldName): T[FieldName][];
}
export declare class TGraphQL {
    private _schema;
    private _introspection;
    private _context;
    private _client;
    private $$records;
    constructor(context: TContext, records: any, client: Types.IDBClient);
    private buildSchema;
    query(source: string): Promise<any>;
    get introspection(): any;
}
export interface IRefField extends Types.IField {
    record: string;
}
export interface IStringField extends Types.IField {
    dataType?: 'char' | 'varchar' | 'text' | 'mediumText' | 'longText';
}
export interface IBooleanField extends Types.IField {
}
export interface IDecimalField extends Types.IField {
    digits?: number;
    decimals?: number;
}
export interface IIntegerField extends Types.IField {
    digits?: number;
    decimals?: number;
}
export interface IDateField extends Types.IField {
}
export declare function RecordSet(tableName: string, recordType: typeof TRecord, recordSetType?: any): (target: TContext, propName: string, params?: any) => void;
export declare function KeyField(fieldType?: Types.IField): (target: TRecord, propName: string) => void;
export declare function RefTo<T extends TContext>(record: keyof T, field?: string): (target: TRecord, propName: string) => void;
export declare function StringField(fieldType?: IStringField): (target: TRecord, propName: string) => void;
export declare function DecimalField(fieldType?: IDecimalField): (target: TRecord, propName: string) => void;
export declare function IntegerField(fieldType?: IIntegerField): (target: TRecord, propName: string) => void;
export declare function BooleanField(fieldType?: IBooleanField): (target: TRecord, propName: string) => void;
export declare function DateField(fieldType?: IDateField): (target: TRecord, propName: string) => void;
export declare function BlobField(fieldType?: Types.IField): (target: TRecord, propName: string) => void;
export declare function OneToMany<T>(record: typeof TRecord, prop: keyof T, tableName: string, fieldName: string): (target: TRecord, propName: string) => void;
export {};
