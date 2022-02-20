interface ParsedUrlQuery {[key: string]: string | string[]}
export interface IRouterRequest{
    method: string,
    hostname: string,
    path: string;
    url: string;
    origUrl: string;
    ip: string;
    query?: ParsedUrlQuery;
    params?: any;
    body?: any;
    type?: string;
    cookie: (name: string)=> string;
    header: (name: string)=> string;
}
export interface ISession{
    params?: any;
    plugins: IPlugins;
}
export type ResponseType = 'application/json'|'image/gif'|'image/jpeg'|'image/png'|'image/svg+xml'|'text/plain'|'text/html'
export interface IRouterResponse{
    statusCode: number;
    cookie: (name:string, value:string, option: any)=>void;
    end: (value: any, contentType?: ResponseType)=>void;
    header: (name:string, value: string)=>void;
}
export declare abstract class IRouterPlugin {
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin {
    init?: (params?: any)=>Promise<boolean>;
    message?: (session: ISession, channel: string, msg: string)=>void;
    process(session: ISession, data: any): Promise<any>;
}
export interface IRedisConnection {
    host: string;
    port?: number;
    password?: string;
    db?: number;
}
export interface IPlugins{
    cache?: ICachePlugin;
    db?: IDBPlugin;
    queue?: IQueuePlugin;
    message?: IMessagePlugin;
    wallet?: IWalletPlugin;
}
export interface VM {
    injectGlobalObject(name: string, obj: any, script?: string): void;
    injectGlobalValue(name: string, value: any, script?: string): void;
    injectGlobalFunction(funcName: string, func: any): void;
    injectGlobalPackage(packName: string, script: string): void;
    injectGlobalScript(script: string): void;
}
export interface IWorker {
    data: any;
    vm: VM;
}
export interface IPluginOptions {
    memoryLimit?: number;
    timeLimit?: number;
    isolated?: boolean;
    script?: string;
    scriptPath?: string;
    params?: any;
    dependencies?: IDependencies;
    plugins?: IRequiredPlugins;
}
export interface IWorkerPluginOptions extends IPluginOptions{
    processing?: boolean;
}
//Wallet Plugin
export interface IWalletNetwork{
    chainName?: string;
    provider?: string;
}
export interface IWalletNetworks {
    [chainId: number]: IWalletNetwork;
}
export interface IWalletAccount {
    address: string;
    privateKey?: string;
}
export interface IWalletRequiredPluginOptions{
    chainId: number;
    networks: IWalletNetworks;
    accounts: IWalletAccount[];
}
export interface IWalletPlugin{
    get address(): string;
    get chainId(): number;
    set chainId(value: number);
    getBalance(): Promise<number>;
}
//Queue Plugin
export interface IQueuePluginOptions extends IWorkerPluginOptions{
    jobQueue: string;
    disabled?: boolean;
    connection: IJobQueueConnectionOptions;
}
export interface IQueueOptions {
    workers: IQueuePluginOptions[];
}
export interface IQueueJob{
    id: string;
    progress: number;
    status: string;
}
export interface IJobQueueConnectionOptions{
    redis: IRedisConnection;
}
export interface IQueueRequiredPluginOptions {
    queues: string[],
    connection: IJobQueueConnectionOptions
}
export interface IQueuePlugin {
    createJob(queue: string|number, data:any, waitForResult?: boolean, timeout?: number, retries?: number): Promise<IQueueJob>
}

//Cache Plugin
export interface ICachePlugin{
    del(key: string): Promise<boolean>;
	get(key: string): Promise<string>;
    getValue(key: string): Promise<any>;
	set(key: string, value: any, expires?: number): Promise<boolean>;
}
export interface ICacheClientOptions{
    redis?: IRedisConnection;
}

//DB Plugin
export interface IField{
    prop?: string;
    field?: string;
    record?: string;
    size?: number;
    details?: any;
    table?: string;
    dataType?: 'key'|'ref'|'1toM'|'char'|'varchar'|'boolean'|'integer'|'decimal'|'date'|'blob'|'text'|'mediumText'|'longText';
}
export interface IFields{[name: string]: IField}
export interface IRefField extends IField{
    record: string;
}
export interface IStringField extends IField{
    dataType?: 'char'|'varchar'|'text'|'mediumText'|'longText'
};
export interface IBooleanField extends IField{

};
export interface IDecimalField extends IField{
    digits ?: number;
    decimals?: number;
};
export interface IIntegerField extends IField{
    digits ?: number;
    decimals?: number;
};
export interface IDateField extends IField{

};
export interface IQueryRecord{
    a: 'i'|'d'|'u', //insert, delete/ update
    k: string;
    d: IQueryData;
}
export interface IQueryData{[prop: string]: any}
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
export interface IMySQLConnection{
    host: string;
    port?: number;
    password: string;
    user: string;
    database: string;
}
export interface IDBPlugin{
    getConnection(name: string): IDBClient;
}
export interface IDBClient{
    applyQueries(queries: IQuery[]): Promise<IQueryResult[]>;
    query(sql: string, params?: any[]): Promise<any>;
    beginTransaction():Promise<boolean>;
    checkTableExists(tableName: string): Promise<boolean>;
    commit():Promise<boolean>;
    rollback(): Promise<boolean>;
}
export interface IDbConnectionOptions{
    mysql?: IMySQLConnection
}
export interface IDBRequiredPluginOptions{
    [name: string]: IDbConnectionOptions;
}

//Message Plugin
export interface IMessagePlugin {
    publish(channel: string|number, msg: string):void;
}
export interface IMessageRequiredPluginOptions{
    connection: IMessageConnection;
    subscribe?: string[];
    publish?: string[];
}
export interface IMessageConnection{
    redis: IRedisConnection;
}

//Plugins option interface
export type IPackageVersion = string;
export interface IDependencies {
    [packageName: string]: IPackageVersion;
}
export interface IGithubOptions {
    org: string;
    repo: string;
    token?: string;
}
export interface IPluginOptions {
    memoryLimit?: number;
    timeLimit?: number;
    isolated?: boolean;
    github?: IGithubOptions;
    script?: string;
    scriptPath?: string;
    params?: any;
    dependencies?: IDependencies;
    plugins?: IRequiredPlugins;
}
export interface IRequiredPlugins{
    cache?: ICacheClientOptions,
    db?: IDBRequiredPluginOptions,
    queue?: IQueueRequiredPluginOptions,
    message?: IMessageRequiredPluginOptions,
    wallet?: IWalletRequiredPluginOptions
}
