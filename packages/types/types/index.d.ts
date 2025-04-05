import BigNumber from 'bignumber.js';
export {BigNumber};
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
export interface IRouterCookieOptions {        
    maxAge?: number | undefined;
    expires?: Date | undefined;
    path?: string | undefined;
    domain?: string | undefined;
    secure?: boolean | undefined;
    secureProxy?: boolean | undefined;
    httpOnly?: boolean | undefined;
    sameSite?: 'strict' | 'lax' | 'none' | boolean | undefined;
    signed?: boolean | undefined;
    overwrite?: boolean | undefined;
}
export interface IRouterResponse{
    statusCode: (value: number)=>void;
    cookie: (name:string, value:string, option?: IRouterCookieOptions)=>void;
    end: (value: any, contentType?: ResponseType)=>void;
    header: (name:string, value: string)=>void;
}
export declare abstract class IRouterPlugin {
    init?:{(params?: any):Promise<void>};
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin {
    init?:(params?: any)=>Promise<void>;
    // message?: (session: ISession, channel: string, msg: string)=>void;
    process(session: ISession, data?: any): Promise<any>;
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
    id: string;
    domain: string;
    data: any;
    vm: VM;
}
export interface ITask {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed';
    lastCompletedStep: string;
    completedSteps: string[];
}
export interface IStepConfig {
    retryOnFailure?: boolean;
    delay?: number;
    maxAttempts?: number;
    delayMultiplier?: number;
}
export interface ITaskOptions {
    name: string;
}
export interface ITaskManager{
    startTask(options: ITaskOptions|string, id?: string): Promise<ITask>;
    resumeTask(taskId: string): Promise<void>;
    completeStep(taskId: string, stepName: string): Promise<void>;
    completeTask(taskId: string): Promise<void>;
    loadTask(taskId: string): Promise<ITask | undefined>;
}
export interface IPluginOptions {
    id?: string;
    domain?: string;
    memoryLimit?: number;
    timeLimit?: number;
    isolated?: boolean;
    github?: IGithubOptions;
    modulePath?: string;
    script?: string;
    scriptPath?: string;
    params?: any;
    dependencies?: IDependencies;
    plugins?: IRequiredPlugins;
    taskManager?: ITaskManager;
}
// export interface IPluginOptions {
//     memoryLimit?: number;
//     timeLimit?: number;
//     isolated?: boolean;
//     script?: string;
//     modulePath?: string;
//     scriptPath?: string;
//     params?: any;
//     dependencies?: IDependencies;
//     plugins?: IRequiredPlugins;
// }
export interface IWorkerPluginOptions extends IPluginOptions{
    processing?: boolean;
}
export type IRouterPluginMethod = 'GET'|'POST'|'PUT'|'DELETE';
export interface IRouterPluginOptions extends IPluginOptions {
    baseUrl: string|string[];
    methods: IRouterPluginMethod[];
}

//Wallet Plugin
export interface IWalletNetwork{
    chainName?: string;
    provider?: any;
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
type IFetchMethods = 'GET'|'POST'
export interface IFetchRequiredPluginOptions{
    methods?: IFetchMethods[];
    hosts?: string[];
}
type stringArray = string | _stringArray
interface _stringArray extends Array<stringArray> { }
export interface IWalletUtils{
    fromWei(value: any, unit?: string): string;
    hexToUtf8(value: string): string;
    sha3(value: string): string;
    stringToBytes(value: string | stringArray, nByte?: number): string | string[];
    stringToBytes32(value: string | stringArray): string | string[];
    toString(value: any): string;
    toUtf8(value: any): string;		
    toWei(value: string, unit?: string): string;
}
export interface IWalletEventLog {
    event: string
    address: string
    returnValues: any
    logIndex: bigint
    transactionIndex: bigint
    transactionHash: string
    blockHash: string
    blockNumber: bigint
    raw ? : {
        data: string,
        topics: string[]
    }
}
export interface IWalletLog {
    address: string;
    data: string;
    topics: string[];
    logIndex: bigint;
    transactionIndex: bigint;
    transactionHash: string;
    blockHash: string;
    blockNumber: bigint;
    removed: boolean;
    type?: string;
}
export interface IWalletTransactionReceipt{
    status: bigint;
    transactionHash: string;
    transactionIndex: bigint;
    blockHash: string;
    blockNumber: bigint;
    from: string;
    to: string;
    contractAddress?: string;
    cumulativeGasUsed: bigint;
    gasUsed: bigint;
    effectiveGasPrice: bigint;
    logs: IWalletLog[];
    logsBloom: string;
    events?: {
        [eventName: string]: IWalletEventLog;
    };
}
export interface IWalletEvent{
    name: string;
    address: string;
    blockNumber: bigint;
    logIndex: bigint;
    topics: string[];
    transactionHash: string;
    transactionIndex: bigint;        
    data: any;
    rawData: any;
}
export interface IWalletTransaction {
    hash: string;
    nonce: bigint;
    blockHash: string | null;
    blockNumber: bigint | null;
    transactionIndex: bigint | null;
    from: string;
    to: string | null;
    value: BigNumber;
    gasPrice: BigNumber;
    maxPriorityFeePerGas?: bigint | string | BigNumber;
    maxFeePerGas?: bigint | string | BigNumber;
    gas: bigint;
    input: string;
}
export interface IWalletTransactionOptions {
    from?: string;
    to?: string;
    nonce?: number;
    gas?: number;
    gasLimit?: number;
    gasPrice?: BigNumber | number;
    data?: string;
    value?: BigNumber | number;
}
export interface IWalletBlockTransactionObject {
    number: bigint;
    hash: string;
    parentHash: string;
    nonce: string;
    sha3Uncles: string;
    logsBloom: string;
    transactionRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: string;
    extraData: string;
    gasLimit: bigint;
    gasUsed: bigint;
    timestamp: bigint | string;
    baseFeePerGas?: bigint;
    size: bigint;
    difficulty: bigint;
    totalDifficulty: bigint;
    uncles: string[];
    transactions: IWalletTransaction[];
}
export interface IWalletEvent {
    name: string;
    address: string;
    blockNumber: bigint;
    logIndex: bigint;
    topics: string[];
    transactionHash: string;
    transactionIndex: bigint;
    data: any;
    rawData: any;
}
export interface IWalletTokenInfo{
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: number;	
}
export interface IContractMethod {
    call: any;
    estimateGas(...params:any[]): Promise<number>;
    encodeABI(): string;
}
export interface IContract {
    deploy(params: {data: string, arguments?: any[]}): IContractMethod;
    methods: {[methodName: string]: (...params:any[]) => IContractMethod};
}
export interface IAbiDefinition {
    _abi: any;
}
export interface IMulticallContractCall {
    to: string;
    contract: IAbiDefinition;
    methodName: string;
    params: any[];
}
export interface IWalletPlugin {
    account: IWalletAccount;
    accounts: Promise<string[]>;
    address: string;
    balance: Promise<BigNumber>;
    balanceOf(address: string): Promise<BigNumber>;
    _call(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<any>;
    chainId: number;
    createAccount(): IWalletAccount;
    decode(abi: any, event: IWalletLog | IWalletEventLog, raw?: {
        data: string;
        topics: string[];
    }): IWalletEvent;
    decodeEventData(data: IWalletLog, events?: any): Promise<IWalletEvent>;
    decodeLog(inputs: any, hexString: string, topics: any): any;
    defaultAccount: string;
    getAbiEvents(abi: any[]): any;
    getAbiTopics(abi: any[], eventNames: string[]): any[];
    getBlock(blockHashOrBlockNumber?: number | string, returnTransactionObjects?: boolean): Promise<IWalletBlockTransactionObject>;
    getBlockNumber(): Promise<number>;
    getBlockTimestamp(blockHashOrBlockNumber?: number | string): Promise<number>;
    getChainId(): Promise<number>;
    getContractAbi(address: string): any;
    getContractAbiEvents(address: string): any;
    getTransaction(transactionHash: string): Promise<IWalletTransaction>;
    methods(...args: any): Promise<any>;
    set privateKey(value: string);
    recoverSigner(msg: string, signature: string): Promise<string>;
    registerAbi(abi: any[] | string, address?: string | string[], handler?: any): string;
    registerAbiContracts(abiHash: string, address: string | string[], handler?: any): any;
    send(to: string, amount: number): Promise<IWalletTransactionReceipt>;
    _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<IWalletTransactionReceipt>;
    scanEvents(fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string | string[]): Promise<IWalletEvent[]>;
    scanEvents(params: {fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string | string[]}): Promise<IWalletEvent[]>;
    signMessage(msg: string): Promise<string>;
    signTransaction(tx: any, privateKey?: string): Promise<string>;
    tokenInfo(address: string): Promise<IWalletTokenInfo>;
    utils: IWalletUtils;
    verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;
    soliditySha3(...val: any[]): string;
    toChecksumAddress(address: string): string;
    isAddress(address: string): boolean;
    _txObj(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | IWalletTransactionOptions): Promise<IWalletTransactionOptions>;
    _txData(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | IWalletTransactionOptions): Promise<string>;
    multiCall(calls: {to: string; data: string}[], gasBuffer?: string): Promise<{results: string[]; lastSuccessIndex: BigNumber}>;
    doMulticall(
        contracts: IMulticallContractCall[], 
        gasBuffer?: string
    ): Promise<any[]>;
    encodeFunctionCall<T extends IAbiDefinition, F extends Extract<keyof T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>>(
        contract: T, 
        methodName: F, 
        params: string[]
    ): string;
    decodeAbiEncodedParameters<T extends IAbiDefinition, F extends Extract<keyof T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>>(
        contract: T, 
        methodName: F, 
        hexString: string
    ): any;
}
export interface IDomainOptions {
    plugins?: IRequiredPlugins
    // {
    //     db?: {
    //         mysql?: {
    //             host: string;
    //             user: string;
    //             password: string;
    //             database: string;
    //         };
    //     };
    //     cache?: {
    //         redis?: {
    //             host: string;
    //             password?: string;
    //             db?: number;
    //         };
    //     };
    //     fetch?: {
    //         methods?: 'GET'|'POST'[];
    //         hosts?: string[];
    //     };
    //     wallet?: {
    //         accounts?: IWalletAccount[];
    //         chainId?: number;
    //         networks?: IWalletNetworks;
    //     };
    // };
}
//Queue Plugin
export interface IQueuePluginOptions extends IWorkerPluginOptions{
    jobQueue: string;
    disabled?: boolean;
    connection: IJobQueueConnectionOptions;
}
export interface IDomainRouterPackage{
    baseUrl: string;
    packagePath: string;
    options?: IDomainOptions
}
export interface IDomainWorkerPackage{
    packagePath: string;
    options?: IDomainOptions
}
export interface IS3Options {
    endpoint: string;
    key: string;
    secret: string;
    bucket: string;
}
export interface IStorageOptions{
    s3?: IS3Options;
    web3Storage?: {endpoint?: string,token: string};
    localCache?: {path: string};
    log?: IDbConnectionOptions;
}
export interface IQueueOptions {
    jobQueue?: string;
    disabled?: boolean;
    connection?: IJobQueueConnectionOptions;
    module?: string;
    workers?: IQueuePluginOptions[];
    storage?: IStorageOptions;
    domains?: {[domainName: string]: {
        routers?: IDomainRouterPackage[],
        workers?: IDomainWorkerPackage[]
    }}
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
    dataType?: 'key'|'ref'|'1toM'|'char'|'varchar'|'boolean'|'integer'|'decimal'|'date'|'dateTime'|'time'|'blob'|'text'|'mediumText'|'longText';
    notNull?: boolean;
    default?: any;
}
export interface IFields{[name: string]: IField}
export interface IRefField extends IField{
    record: string;
}
export interface IStringField extends IField{
    dataType?: 'char'|'varchar'|'text'|'mediumText'|'longText'
}
export interface IBooleanField extends IField{

}
export interface IDecimalField extends IField{
    digits ?: number;
    decimals?: number;
}
export interface IIntegerField extends IField{
    digits ?: number;
    decimals?: number;
}
export interface IDateField extends IField{

}
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
    getConnection(name?: string): IDBClient | string;
}
export interface IDBClient{
    applyQueries(queries: IQuery[]): Promise<IQueryResult[]>;
    beginTransaction():Promise<boolean>;
    checkTableExists(tableName: string): Promise<boolean>;
    commit():Promise<boolean>;
    query(sql: string, params?: any[]): Promise<any>;
    resolve(table: string, fields: IFields, criteria: any, args: any): Promise<any>;
    rollback(): Promise<boolean>;
    syncTableSchema(tableName: string, fields: IFields): Promise<boolean>;
    syncTableIndexes(tableName: string, indexes: ITableIndexProps[]): Promise<boolean>;
}
export interface IDbConnectionOptions{
    type?: string;
    mysql?: IMySQLConnection;
    connection?: IMySQLConnection;
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
export type IPackageScript = {
    version?: string,
    script?: string,
    dts?: string;/*{
        [file: string]: string;
    };*/
};
export interface IDependencies {
    [packageName: string]: IPackageScript;
}
export interface IGithubOptions {
    org: string;
    repo: string;
    token?: string;
}
export interface IRequiredPlugins{
    cache?: ICacheClientOptions,
    db?: IDbConnectionOptions, //IDBRequiredPluginOptions,
    queue?: IQueueRequiredPluginOptions,
    message?: IMessageRequiredPluginOptions,
    wallet?: IWalletRequiredPluginOptions,
    fetch?: IFetchRequiredPluginOptions,
}
export type TableIndexType = 'UNIQUE'|'NON_UNIQUE';
export interface ITableIndexProps{
    name: string;
    columns: string[]; 
    type?: TableIndexType;
}