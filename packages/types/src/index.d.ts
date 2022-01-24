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
export type IPackageVersion = string;
export interface IDependencies {
    [packageName: string]: IPackageVersion;
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
    query(sql: string, params?: any[]): Promise<any>;
    beginTransaction():Promise<boolean>;
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
export interface IRequiredPlugins{
    cache?: ICacheClientOptions,
    db?: IDBRequiredPluginOptions,
    queue?: IQueueRequiredPluginOptions,
    message?: IMessageRequiredPluginOptions,
    wallet?: IWalletRequiredPluginOptions
}