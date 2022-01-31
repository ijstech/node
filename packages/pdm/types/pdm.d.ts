export declare class TContext {
    private $$records;
    constructor();
    private initRecordsets;
    fetch(): Promise<boolean>;
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
    private recordSet;
    private parentQuery;
    private queries;
    constructor(recordSet: TRecordSet<T>, parentQuery?: any);
    and: QueryFuncOverload<T>;
    or: QueryFuncOverload<T>;
}
declare class TQuery<T> {
    private recordSet;
    private queries;
    constructor(recordSet: TRecordSet<T>, queries?: any);
    where: QueryFuncOverload<T>;
}
interface IFields {
    [name: string]: IField;
}
interface InsertOptions {
    updateOnDuplicate?: boolean;
    ignoreOnDuplicate?: boolean;
}
export declare class TRecord {
    private $$fields;
    private recordSet;
    constructor(recordSet: TRecordSet<any>);
}
export declare class TRecordSet<T> {
    private _recordType;
    private _fields;
    protected _queries: any[];
    protected _records: T[];
    protected _context: TContext;
    constructor(context: TContext, record: any);
    add<TB extends keyof T>(data?: {
        [C in TB]?: T[C];
    }): T;
    applyInsert<TB extends keyof T>(data: {
        [C in TB]?: T[C];
    } | {
        [C in TB]?: T[C];
    }[], options?: InsertOptions): void;
    applyDelete(): TQuery<T>;
    applyUpdate<TB extends keyof T>(data?: {
        [C in TB]: T[C];
    }): TQuery<T>;
    get count(): Promise<number>;
    delete(record: T): void;
    get fields(): IFields;
    get first(): Promise<T>;
    get query(): TQuery<T>;
    fetch(): Promise<TRecordSet<T>>;
    records(index: number): T;
    get next(): T;
}
export interface IField {
    field?: string;
    size?: number;
    dataType?: 'key' | 'ref' | 'char' | 'varchar' | 'boolean' | 'integer' | 'decimal' | 'date' | 'blob' | 'text' | 'mediumText' | 'longText';
    details?: typeof TRecord;
}
export interface IGuidField extends IField {
    primaryKey?: boolean;
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
export declare function RecordSet(tableName: string, recordType: typeof TRecord, recordSetType?: any): (target: TContext, propName: string, params?: any) => void;
export declare function KeyField(fieldType?: IGuidField): (target: TRecord, propName: string) => void;
export declare function RefTo<T extends TContext>(record: keyof T, field?: string): (target: TRecord, propName: string) => void;
export declare function StringField(fieldType?: IStringField): (target: TRecord, propName: string) => void;
export declare function DecimalField(fieldType?: IDecimalField): (target: TRecord, propName: string) => void;
export declare function IntegerField(fieldType?: IIntegerField): (target: TRecord, propName: string) => void;
export declare function BooleanField(fieldType?: IBooleanField): (target: TRecord, propName: string) => void;
export declare function DateField(fieldType?: IDateField): (target: TRecord, propName: string) => void;
export declare function BlobField(fieldType?: IField): (target: TRecord, propName: string) => void;
export declare function OneToMany<T>(record: typeof TRecord, prop: keyof T, tableName: string, fieldName: string): (target: TRecord, propName: string) => void;
export {};
