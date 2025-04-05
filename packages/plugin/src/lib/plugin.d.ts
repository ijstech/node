import {BigNumber} from 'bignumber.js';

export interface ITaskOptions {
    name: string;
}
export interface IStepConfig {
    retryOnFailure?: boolean;
    delay?: number;
    maxAttempts?: number;
    delayMultiplier?: number;
}
export declare function step(config?: IStepConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function task(options?: ITaskOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

export declare namespace Types{
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
    export interface IWalletAccount {
        address: string;
        privateKey?: string;
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
    export interface IWalletTokenInfo{
        name: string;
        symbol: string;
        totalSupply: BigNumber;
        decimals: number;	
    }
    type stringArray = string | _stringArray
    interface _stringArray extends Array<stringArray> { }
    export interface IWalletUtils{
        fromDecimals(value: BigNumber | number | string, decimals?: number): BigNumber;
		fromWei(value: any, unit?: string): string;
		hexToUtf8(value: string): string;
		sha3(value: string): string;
		stringToBytes(value: string | stringArray, nByte?: number): string | string[];
		stringToBytes32(value: string | stringArray): string | string[];
		toDecimals(value: BigNumber | number | string, decimals?: number): BigNumber;
		toString(value: any): string;
		toUtf8(value: any): string;		
		toWei(value: string, unit?: string): string;
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
        getTransaction(transactionHash: string): Promise<IWalletTransaction>;
        methods(...args: any): Promise<any>;
        set privateKey(value: string);
        recoverSigner(msg: string, signature: string): Promise<string>;		
        registerAbi(abi: any[] | string, address?: string|string[], handler?: any): string;
        registerAbiContracts(abiHash: string, address: string|string[], handler?: any): any;
        send(to: string, amount: number): Promise<IWalletTransactionReceipt>;		
        _send(abiHash: string, address: string, methodName: string, params?: any[], options?: any): Promise<IWalletTransactionReceipt>;
        scanEvents(fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string|string[]): Promise<IWalletEvent[]>;		
        scanEvents(params: {fromBlock: number, toBlock?: number | string, topics?: any, events?: any, address?: string|string[]}): Promise<IWalletEvent[]>;		
        signMessage(msg: string): Promise<string>;
        signTransaction(tx: any, privateKey?: string): Promise<string>;
        tokenInfo(address: string): Promise<IWalletTokenInfo>;
        utils: IWalletUtils;
        verifyMessage(account: string, msg: string, signature: string): Promise<boolean>;	
        soliditySha3(...val: any[]): string;
        toChecksumAddress(address: string): string;		
        isAddress(address: string): boolean;
        _txObj(abiHash: string, address: string, methodName:string, params?:any[], options?:number|BigNumber|IWalletTransaction): Promise<IWalletTransactionOptions>;
        _txData(abiHash: string, address: string, methodName:string, params?:any[], options?:number|BigNumber|IWalletTransaction): Promise<string>;
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
    export interface ICachePlugin{
        del(key: string): Promise<boolean>;
        get(key: string): Promise<string>;
        getValue(key: string): Promise<any>;
        set(key: string, value: any, expires?: number): Promise<boolean>;
    }
    export interface IDBPlugin{
        getConnection(name?: string): IDBClient;
    }
    export interface IQueueJob{
        id: string;
        progress: number;
        status: string;
    }
    export interface IQueuePlugin {
        createJob(queue: string|number, data:any, waitForResult?: boolean, timeout?: number, retries?: number): Promise<IQueueJob>
    }
    export interface IMessagePlugin {
        publish(channel: string|number, msg: string):void;
    }
    export interface IPlugins{
        cache?: ICachePlugin;
        db?: IDBPlugin;
        queue?: IQueuePlugin;
        message?: IMessagePlugin;
        wallet?: IWalletPlugin;
    }
    interface IField{
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
    interface IFields{[name: string]: IField}    
    interface IQueryData{[prop: string]: any}
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
        beginTransaction():Promise<boolean>;
        checkTableExists(tableName: string): Promise<boolean>;
        commit():Promise<boolean>;
        query(sql: string, params?: any[]): Promise<any>;
        resolve(table: string, fields: IFields, criteria: any, args: any): Promise<any>;
        rollback(): Promise<boolean>;
        syncTableSchema(tableName: string, fields: IFields): Promise<boolean>;
    }
}
export interface ISession{
    params?: any;
    plugins: Types.IPlugins;
    taskId?: string;
}
export declare abstract class IPlugin {
    init?(session: ISession, params?: any): Promise<void>;
}
export declare abstract class IRouterPlugin extends IPlugin {
    route(session: ISession, request: IRouterRequest, response: IRouterResponse): Promise<boolean>;
}
export declare abstract class IWorkerPlugin extends IPlugin {
    process(session: ISession, data: any): Promise<any>;
}
export interface IRouterRequest{
    method: string,
    hostname: string,
    path: string;
    url: string;
    origUrl: string;
    ip: string;
    query?: {[key: string]: string | string[]};
    params?: any;
    body?: any;
    type?: string;
    cookie: (name: string)=> string;
    header: (name: string)=> string;
}
export type ResponseType = 'application/json'|'image/gif'|'image/jpeg'|'image/png'|'image/svg+xml'|'text/plain'|'text/html'
export interface IRouterResponse{
    statusCode: (value: number)=>void;
    cookie: (name:string, value:string, optio?: any)=>void;
    end: (value: any, contentType?: ResponseType)=>void;
    header: (name:string, value: string)=>void;
}
export interface IWalletAccount {
    address: string;
    privateKey?: string;
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
    topics: string[];
    logIndex: bigint;
    transactionIndex: bigint;
    transactionHash: string;
    blockHash: string;
    blockNumber: bigint;
    removed: boolean;
    type?: string;
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
export interface IWalletUtils{
    fromWei(value: any, unit?: string): string;
    hexToUtf8(value: string): string;
    toUtf8(value: any): string;		
    toWei(value: string, unit?: string): string;
}
export interface IWalletTokenInfo{
    name: string;
    symbol: string;
    totalSupply: BigNumber;
    decimals: number;	
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
    getContractAbi(address: string);
    getContractAbiEvents(address: string);		
    methods(...args: any): Promise<any>;
    privateKey: string;
    provider: any;
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
    soliditySha3(...val: any[]): string;	
    toChecksumAddress(address: string): string;	
    isAddress(address: string): boolean;
    _txObj(abiHash: string, address: string, methodName:string, params?:any[], options?:number|BigNumber|IWalletTransaction): Promise<IWalletTransaction>;
    _txData(abiHash: string, address: string, methodName:string, params?:any[], options?:number|BigNumber|IWalletTransaction): Promise<string>;
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
export interface IMessagePlugin {
    publish(channel: string|number, msg: string):void;
}
export interface IQueueJob{
    id: string;
    progress: number;
    status: string;
}
export interface IQueuePlugin {
    createJob(queue: string|number, data:any, waitForResult?: boolean, timeout?: number, retries?: number): Promise<IQueueJob>
}
export interface ICachePlugin{
    del(key: string): Promise<boolean>;
	get(key: string): Promise<string>;
    getValue(key: string): Promise<any>;
	set(key: string, value: any, expires?: number): Promise<boolean>;
}
export interface IField{
    prop?: string;
    field?: string;
    record?: string;
    size?: number;
    details?: any;
    table?: string;
    dataType?: 'key'|'ref'|'1toM'|'char'|'varchar'|'boolean'|'integer'|'decimal'|'date'|'blob'|'text'|'mediumText'|'longText';
    notNull?: boolean;
    default?: any;
}
export interface IQueryData{[prop: string]: any}
export interface IQueryRecord{
    a: 'i'|'d'|'u', //insert, delete/ update
    k: string;
    d: IQueryData;
}
export interface IFields{[name: string]: IField}
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
    beginTransaction():Promise<boolean>;
    checkTableExists(tableName: string): Promise<boolean>;
    commit():Promise<boolean>;
    query(sql: string, params?: any[]): Promise<any>;
    resolve(table: string, fields: IFields, criteria: any, args: any): Promise<any>;
    rollback(): Promise<boolean>;
    syncTableSchema(tableName: string, fields: IFields): Promise<boolean>;
}
export interface IDBPlugin{
    getConnection(name?: string): IDBClient;
}