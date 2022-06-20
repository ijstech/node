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
    statusCode: number;
    cookie: (name:string, value:string, option?: IRouterCookieOptions)=>void;
    end: (value: any, contentType?: ResponseType)=>void;
    header: (name:string, value: string)=>void;
}
export declare abstract class IRouterPlugin {
    init(params?: any):Promise<void>;
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin {
    init(params?: any):Promise<void>;
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
export type IRouterPluginMethod = 'GET'|'POST'|'PUT'|'DELETE';
export interface IRouterPluginOptions extends IPluginOptions {
    form?: {
        host: string,
        token: string,
        package?: string,
        mainForm?: string
    },
    github?: {
        org: string,
        repo: string,
        token: string
    },
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
export interface IWalletUtils{
    fromWei(value: any, unit?: string): string;
    hexToUtf8(value: string): string;
    toUtf8(value: any): string;		
    toWei(value: string, unit?: string): string;
}
export interface IWalletEventLog {
    event: string
    address: string
    returnValues: any
    logIndex: number
    transactionIndex: number
    transactionHash: string
    blockHash: string
    blockNumber: number
    raw ? : {
        data: string,
        topics: string[]
    }
}
export interface IWalletLog {
    address: string;
    data: string;
    topics: Array <string>;
    logIndex: number;
    transactionHash?: string;
    transactionIndex: number;
    blockHash?: string;
    type?: string;
    blockNumber: number;
}
export interface IWalletTransactionReceipt{
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    contractAddress?: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    logs ? : Array <IWalletLog>;
    events ? : {
        [eventName: string]: IWalletEventLog | IWalletEventLog[]
    };
    status: boolean;
}
export interface IWalletEvent{
    name: string;
    address: string;
    blockNumber: number;
    logIndex: number;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;        
    data: any;
    rawData: any;
}
export interface IWalletTransaction {
    hash: string;
    nonce: number;
    blockHash: string | null;
    blockNumber: number | null;
    transactionIndex: number | null;
    from: string;
    to: string | null;
    value: string;
    gasPrice: string;
    maxPriorityFeePerGas?: number | string | BigNumber;
    maxFeePerGas?: number | string | BigNumber;
    gas: number;
    input: string;
}
export interface IWalletBlockTransactionObject{
    number: number;
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
    gasLimit: number;
    gasUsed: number;
    timestamp: number | string;
    baseFeePerGas?: number;
    size: number;
    difficulty: number;
    totalDifficulty: number;
    uncles: string[];
    transactions: IWalletTransaction[];
}
export interface IWalletEvent {
    name: string;
    address: string;
    blockNumber: number;
    logIndex: number;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;
    data: any;
    rawData: any;
}
export interface IWalletTokenInfo{
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: number;	
}
export interface IWalletPlugin {
    account: IWalletAccount;
    accounts: Promise<string[]>;
    address: string;
    balance: Promise<BigNumber>;
    balanceOf(address: string): Promise<BigNumber>;
    chainId: number;
    createAccount(): IWalletAccount;
    decode(abi:any, event:IWalletLog|IWalletEventLog, raw?:{data: string,topics: string[]}): IWalletEvent;
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
    methods(...args: any): Promise<any>;
    set privateKey(value: string);
    recoverSigner(msg: string, signature: string): Promise<string>;		
    registerAbi(abi: any[] | string, address?: string|string[], handler?: any): string;
    registerAbiContracts(abiHash: string, address: string|string[], handler?: any): any;
    send(to: string, amount: number): Promise<IWalletTransactionReceipt>;		
    scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string|string[]): Promise<IWalletEvent[]>;		
    signMessage(msg: string): Promise<string>;
    signTransaction(tx: any, privateKey?: string): Promise<string>;
    tokenInfo(address: string): Promise<IWalletTokenInfo>;
    utils: IWalletUtils;
    verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;		
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
    getConnection(name?: string): IDBClient;
}
export interface IDBClient{
    applyQueries(queries: IQuery[]): Promise<IQueryResult[]>;
    query(sql: string, params?: any[]): Promise<any>;
    resolve(table: string, fields: IFields, criteria: any, args: any): Promise<any>;
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
export type IPackageScript = {
    version?: string,
    script?: string,
    dts?: {
        [file: string]: string;
    };
};
export interface IDependencies {
    [packageName: string]: IPackageScript;
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
