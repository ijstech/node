class TContext {
    private $$records: {[name: string]: {
        tableName: string,
        recordType: typeof TRecord,
        recordSetType: typeof TRecordSet
    }};    
    constructor(){        
        this.initRecordsets();
    };
    private initRecordsets(){
        for (let n in this.$$records){
            let t = this.$$records[n];
            if (t.recordSetType)
                this[n] = new ((<any>t).recordSetType)(this, t.recordType)
            else
                this[n] = new TRecordSet<typeof t.recordType>(this, t.recordType);            
        };
    };
    save():Promise<any>{
        return new Promise((resolve, reject)=>{
            resolve(null);
        });
    };
};
type QueryOperator = '='|'!='|'<'|'>'|'>='|'<=';
type ArrayQueryOperator = 'in';
type RangeQueryOperator = 'between';

function queryFunc<T, FieldName extends keyof T>(field: FieldName, op: QueryOperator,  value: T[FieldName]): TQueryAndOr<T>;
function queryFunc<T, FieldName extends keyof T>(field: FieldName, op: ArrayQueryOperator, value: T[FieldName][]):TQueryAndOr<T>;
function queryFunc<T, FieldName extends keyof T>(field: FieldName, op: RangeQueryOperator, valueFrom: T[FieldName], valueTo: T[FieldName]):TQueryAndOr<T>;
function queryFunc<T>(callback: (qr: TQuery<T>)=>void): TQueryAndOr<T>;
function queryFunc<T>(...args: any[]): any{    
    if (typeof(args[0]) == 'function')
        args[0](new TQuery<T>(this.recordSet))
    else{
        let fieldName = args[0];
        let recordSet: TRecordSet<T> = this.recordSet;
        if (recordSet && recordSet.fields && recordSet.fields[fieldName])
            fieldName = recordSet.fields[fieldName].field || fieldName;

        if (args[1] == 'between')
            console.log(fieldName, args[1], args[2], args[3])
        else
            console.log(fieldName, args[1], args[2]);
    };
    return new TQueryAndOr<T>(this.recordSet);
};
type QueryFuncOverload<DT> = {
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: QueryOperator,  value: T[FieldName]): TQueryAndOr<T>;
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: ArrayQueryOperator, value: T[FieldName][]):TQueryAndOr<T>;
    <T extends DT, FieldName extends keyof T>(field: FieldName, op: RangeQueryOperator, valueFrom: T[FieldName], valueTo: T[FieldName]):TQueryAndOr<T>;
    <T extends DT>(callback: (qr: TQuery<T>)=>void): TQueryAndOr<T>;
};
class TQueryAndOr<T>{
    private recordSet: TRecordSet<T>;
    constructor(recordSet: TRecordSet<T>){
        this.recordSet = recordSet;
    };    
    and: QueryFuncOverload<T> = (...args: any[]): TQueryAndOr<T>=>{
        return queryFunc.apply(this, args);
    };
    or: QueryFuncOverload<T> = (...args: any[]): TQueryAndOr<T>=>{
        return queryFunc.apply(this, args);
    };
};
class TQuery<T>{
    private recordSet: TRecordSet<T>;
    constructor(recordSet: TRecordSet<T>){
        this.recordSet = recordSet;
    };
    where: QueryFuncOverload<T> = (...args: any[]): TQueryAndOr<T>=>{
        return queryFunc.apply(this, args);
    };
};
function RecordSet(tableName: string, recordType: typeof TRecord, recordSetType?: any){
    return function (target: TContext, propName: string, params?: any) {                
        target['$$records'] = target['$$records'] || {};
        target['$$records'][propName] = {
            tableName: tableName,
            recordType: recordType,
            recordSetType: recordSetType
        };
    };
};
interface IFields{[name: string]: IField}
class TRecordSet<T>{        
    private _recordType: any;
    private _fields: IFields;
    protected _records: T[] = [];
    protected _context: TContext;
    constructor(context: TContext, record: any){        
        this._context = context;
        this._recordType = record;
    };
    get query(): TQuery<T>{
        return new TQuery<T>(this);
    };
    get count(): Promise<number>{
        return new Promise((resolve)=>{
            resolve(this._records.length)
        });
    };
    append<TB extends keyof T>(data?: {
        [C in TB]: T[C]
    }): T{
        let result = new this._recordType(this)
        this._records.push(result);
        if (data){
            for (let p in data)
                result[p] = data[p];
        };
        return result;
    };
    async fetch(): Promise<T[]>{
        return [];
    };
    get fields(): IFields{
        if (!this._fields){            
            let rd = new this._recordType();
            this._fields = rd._fields;
        };
        return this._fields;
    };
};
interface IField{
    field?: string;    
    dataType?: string;
};
interface IStringField extends IField{
    maxLength?: number
};
interface INumericField extends IField{

};
class TRecord {
    private $$fields: IFields;
    private recordSet: TRecordSet<any>;
    constructor(recordSet: TRecordSet<any>){
        this.recordSet = recordSet;
    };
};
function StringField(fieldType?: IStringField){
    return function (target: TRecord, propName: string) {
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType || {field: propName, maxLength: 30};
    };
};
function NumericField(fieldType?: INumericField){
    return function (target: TRecord, propName: string) {
        target['$$fields'] = target['$$fields'] || {};
        target['$$fields'][propName] = fieldType || {field: propName};
    };
};
//PDM Model
class User extends TRecord {
    @StringField({field: 'user_name', maxLength: 5})
    name: string;
    @NumericField()
    age: number;
};
class UserRecordSet<T extends User> extends TRecordSet<T>{
    async queryByName(name: string): Promise<User>{
        console.dir('queryByName');
        this.query.where('name', '=', name);     
        let records = await this.fetch();           
        let user = records[0] || this.append();
        user.name = name;        
        return user;   
    };
};
export default class UserContext extends TContext {
    @RecordSet('user_info', User, UserRecordSet)
    user: UserRecordSet<User>;
};

async function test(){
    let context = new UserContext();
    context.user.query
        .where('age', '<', 20)
        .and('name', '!=', 'ycwong');

    let qry = context.user.query.where('age', 'in', [1,2]);
    qry.or('name', '=', 'ycwong');

    //sub-query
    context.user.query.where((qry)=>{
        qry.where('age', 'between', 1, 2).or('age','>', 20)
    });
    
    let user = context.user.append({
        age: 1,
        name: 'ycwong'
    });
    user.name = 'yc';
    console.dir('user.age: ' + user.age);
    console.dir('user.name: ' + user.name);

    let yc = await context.user.queryByName('ycwong');
    console.dir('yc.name: ' + yc.name);
    console.dir('records count: ' + await context.user.count);
    context.save();

    let context2 = new UserContext();
    console.dir('context2.user.count: '+ await context2.user.count);
    let result = await context2.save();
};
test();