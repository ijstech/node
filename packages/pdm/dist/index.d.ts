declare module "types" {
    export interface IField {
        prop?: string;
        field?: string;
        record?: string;
        size?: number;
        details?: any;
        table?: string;
        dataType?: 'key' | 'ref' | '1toM' | 'char' | 'varchar' | 'boolean' | 'integer' | 'decimal' | 'date' | 'dateTime' | 'time' | 'blob' | 'text' | 'mediumText' | 'longText';
        notNull?: boolean;
        default?: any;
    }
    export interface IQueryData {
        [prop: string]: any;
    }
    export interface IQueryRecord {
        a: 'i' | 'd' | 'u';
        k: string;
        d: IQueryData;
    }
    export interface IQuery {
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
    export interface IDBClient {
        applyQueries(queries: IQuery[]): Promise<IQueryResult[]>;
        checkTableExists(tableName: string): Promise<boolean>;
        syncTableSchema(tableName: string, fields: IFields): Promise<boolean>;
        syncTableIndexes(tableName: string, indexes: ITableIndexProps[]): Promise<boolean>;
    }
    export interface IFields {
        [name: string]: IField;
    }
    export interface ISchema {
        [tableName: string]: IFields;
    }
    export interface IGraphClient {
        init(schema: ISchema, dbClient: IDBClient): void;
        query: (query: string, variables?: any) => Promise<any>;
        introspection: () => Promise<any>;
    }
    export interface IDBConnection {
        url: string;
    }
    export type TableIndexType = 'UNIQUE' | 'NON_UNIQUE';
    export interface ITableIndexProps {
        name: string;
        columns: string[];
        type?: TableIndexType;
    }
}
declare module "dbClient" {
    import * as Types from "types";
    export class DBClient {
        private _options;
        constructor(options?: Types.IDBConnection);
        applyQueries(queries: Types.IQuery[]): Promise<Types.IQueryResult[]>;
        checkTableExists(tableName: string): Promise<boolean>;
        syncTableSchema(tableName: string, fields: Types.IFields): Promise<boolean>;
        syncTableIndexes(tableName: string, indexes: Types.ITableIndexProps[]): Promise<boolean>;
    }
}
declare module "pdm" {
    import { IField, IFields, ISchema, IDBClient, IQueryData, ITableIndexProps } from "types";
    export { DBClient } from "dbClient";
    export interface IRefField extends IField {
        record: string;
    }
    export interface IRecordSet {
        _id: number;
        _queries: any[];
        fields: IFields;
        keyField: IField;
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
    export class TContext {
        private $$records;
        private _client;
        private _recordSets;
        private _recordSetIdxCount;
        private _recordIdxCount;
        private _modifiedRecords;
        private _applyQueries;
        private _deletedRecords;
        constructor(client: IDBClient);
        _getRecordSetId(): number;
        _getSchema(): ISchema;
        _checkTableExists(tableName: string): Promise<boolean>;
        _initTables(): Promise<boolean>;
        private getApplyQueries;
        protected applyDelete(recordSet: IRecordSet, query: any[]): void;
        protected applyInsert(recordSet: IRecordSet, data: any): void;
        protected applyUpdate(recordSet: IRecordSet, data: IQueryData, query: any[]): void;
        private initRecordsets;
        fetch(recordSet?: IRecordSet): Promise<any>;
        private modifyRecord;
        reset(): void;
        save(): Promise<any>;
    }
    type QueryOperator = 'like' | '=' | '!=' | '<' | '>' | '>=' | '<=';
    type ArrayQueryOperator = 'in';
    type RangeQueryOperator = 'between';
    type QueryFuncOverload<DT> = {
        <T extends DT, FieldName extends keyof T>(field: FieldName, op: QueryOperator, value: T[FieldName]): TQueryAndOr<T>;
        <T extends DT, FieldName extends keyof T>(field: FieldName, op: ArrayQueryOperator, value: T[FieldName][]): TQueryAndOr<T>;
        <T extends DT, FieldName extends keyof T>(field: FieldName, op: RangeQueryOperator, valueFrom: T[FieldName], valueTo: T[FieldName]): TQueryAndOr<T>;
        <T extends DT>(callback: (qr: TQuery<T>) => void): TQueryAndOr<T>;
    };
    class TQueryAndOr<T> {
        private parentQuery;
        private queries;
        constructor(parentQuery?: any);
        and: QueryFuncOverload<T>;
        or: QueryFuncOverload<T>;
    }
    class TQuery<T> {
        private queries;
        constructor(queries?: any);
        where: QueryFuncOverload<T>;
    }
    interface InsertOptions {
        updateOnDuplicate?: boolean;
        ignoreOnDuplicate?: boolean;
    }
    export class TRecord {
        private $$fields;
        private data;
        private recordSet;
        constructor(recordSet: TRecordSet<any>, data: any);
    }
    interface IContext {
        applyDelete(recordSet: IRecordSet, query: any[]): void;
        applyInsert(recordSet: IRecordSet, data: any): void;
        applyUpdate(recordSet: IRecordSet, data: IQueryData, query: any[]): void;
        modifyRecord(record: any): void;
    }
    export class TRecordSet<T> {
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
        applyUpdate<TB extends keyof T>(data: {
            [C in TB]?: T[C];
        }, keys?: {
            [C in TB]?: T[C];
        }): TQuery<T>;
        get context(): IContext;
        get count(): number;
        get current(): T;
        delete(record: T): void;
        fetch(): Promise<T[]>;
        get fields(): IFields;
        get first(): T;
        protected mergeRecords(records: any[]): any[];
        get next(): T;
        protected get keyField(): IField;
        private proxy;
        get query(): TQuery<T>;
        queryRecord(keyValue: string): Promise<T>;
        records(index: number): T;
        reset(): void;
        get tableName(): string;
        private validateFieldValue;
        values<FieldName extends keyof T>(field: FieldName): T[FieldName][];
    }
    export interface IRefField extends IField {
        record: string;
    }
    export interface IStringField extends IField {
        dataType?: 'char' | 'varchar' | 'text' | 'mediumText' | 'longText';
    }
    export interface IBooleanField extends IField {
    }
    export interface IDecimalField extends IField {
        digits?: number;
        decimals?: number;
    }
    export interface IIntegerField extends IField {
        digits?: number;
        decimals?: number;
    }
    export interface IDateField extends IField {
    }
    export interface IDateTimeField extends IField {
    }
    export interface ITimeField extends IField {
    }
    export function RecordSet(tableName: string, recordType: typeof TRecord, recordSetType?: any): (target: TContext, propName: string, params?: any) => void;
    export function Index(indexProps?: ITableIndexProps): (target: Function) => void;
    export function KeyField(fieldType?: IField): (target: TRecord, propName: string) => void;
    export function RefTo<T extends TContext>(record: keyof T, field?: string): (target: TRecord, propName: string) => void;
    export function StringField(fieldType?: IStringField): (target: TRecord, propName: string) => void;
    export function DecimalField(fieldType?: IDecimalField): (target: TRecord, propName: string) => void;
    export function IntegerField(fieldType?: IIntegerField): (target: TRecord, propName: string) => void;
    export function BooleanField(fieldType?: IBooleanField): (target: TRecord, propName: string) => void;
    export function DateField(fieldType?: IDateField): (target: TRecord, propName: string) => void;
    export function DateTimeField(fieldType?: IDateField): (target: TRecord, propName: string) => void;
    export function TimeField(fieldType?: IDateField): (target: TRecord, propName: string) => void;
    export function BlobField(fieldType?: IField): (target: TRecord, propName: string) => void;
    export function OneToMany<T>(record: typeof TRecord, prop: keyof T, tableName: string, fieldName: string): (target: TRecord, propName: string) => void;
}
/// <amd-module name="@ijstech/pdm" />
declare module "@ijstech/pdm" {
    import * as PDM from "pdm";
    export default PDM;
}
