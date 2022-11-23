declare module "bignumber.js" {
  export default BigNumber;
  export namespace BigNumber {
    interface Config {
      DECIMAL_PLACES?: number;
      ROUNDING_MODE?: BigNumber.RoundingMode;
      EXPONENTIAL_AT?: number | [number, number];

      RANGE?: number | [number, number];

      CRYPTO?: boolean;

      MODULO_MODE?: BigNumber.ModuloMode;

      POW_PRECISION?: number;

      FORMAT?: BigNumber.Format;

      ALPHABET?: string;
    }

    interface Format {

      prefix?: string;

      decimalSeparator?: string;

      groupSeparator?: string;

      groupSize?: number;

      secondaryGroupSize?: number;

      fractionGroupSeparator?: string;

      fractionGroupSize?: number;

      suffix?: string;
    }
    interface Instance {

      readonly c: number[] | null;

      readonly e: number | null;

      readonly s: number | null;
      [key: string]: any;
    }
    type Constructor = typeof BigNumber;
    type ModuloMode = 0 | 1 | 3 | 6 | 9;
    type RoundingMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    type Value = string | number | Instance;
  }
  export class BigNumber implements BigNumber.Instance {

    private readonly _isBigNumber: true;

    readonly c: number[] | null;

    readonly e: number | null;

    readonly s: number | null;

    constructor(n: BigNumber.Value, base?: number);

    absoluteValue(): BigNumber;

    abs(): BigNumber;

    comparedTo(n: BigNumber.Value, base?: number): number;

    decimalPlaces(): number;
    decimalPlaces(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): BigNumber;

    dp(): number;
    dp(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): BigNumber;

    dividedBy(n: BigNumber.Value, base?: number): BigNumber;

    div(n: BigNumber.Value, base?: number): BigNumber;

    dividedToIntegerBy(n: BigNumber.Value, base?: number): BigNumber;

    idiv(n: BigNumber.Value, base?: number): BigNumber;

    exponentiatedBy(n: BigNumber.Value, m?: BigNumber.Value): BigNumber;
    exponentiatedBy(n: number, m?: BigNumber.Value): BigNumber;

    pow(n: BigNumber.Value, m?: BigNumber.Value): BigNumber;
    pow(n: number, m?: BigNumber.Value): BigNumber;

    integerValue(rm?: BigNumber.RoundingMode): BigNumber;

    isEqualTo(n: BigNumber.Value, base?: number): boolean;

    eq(n: BigNumber.Value, base?: number): boolean;

    isFinite(): boolean;

    isGreaterThan(n: BigNumber.Value, base?: number): boolean;

    gt(n: BigNumber.Value, base?: number): boolean;

    isGreaterThanOrEqualTo(n: BigNumber.Value, base?: number): boolean;

    gte(n: BigNumber.Value, base?: number): boolean;

    isInteger(): boolean;

    isLessThan(n: BigNumber.Value, base?: number): boolean;

    lt(n: BigNumber.Value, base?: number): boolean;

    isLessThanOrEqualTo(n: BigNumber.Value, base?: number): boolean;

    lte(n: BigNumber.Value, base?: number): boolean;

    isNaN(): boolean;

    isNegative(): boolean;

    isPositive(): boolean;

    isZero(): boolean;

    minus(n: BigNumber.Value, base?: number): BigNumber;

    modulo(n: BigNumber.Value, base?: number): BigNumber;

    mod(n: BigNumber.Value, base?: number): BigNumber;

    multipliedBy(n: BigNumber.Value, base?: number): BigNumber;

    times(n: BigNumber.Value, base?: number): BigNumber;

    negated(): BigNumber;

    plus(n: BigNumber.Value, base?: number): BigNumber;

    precision(includeZeros?: boolean): number;

    precision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): BigNumber;

    sd(includeZeros?: boolean): number;

    sd(significantDigits: number, roundingMode?: BigNumber.RoundingMode): BigNumber;

    shiftedBy(n: number): BigNumber;

    squareRoot(): BigNumber;

    sqrt(): BigNumber;

    toExponential(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): string;
    toExponential(): string;

    toFixed(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): string;
    toFixed(): string;

    toFormat(decimalPlaces: number, roundingMode: BigNumber.RoundingMode, format?: BigNumber.Format): string;
    toFormat(decimalPlaces: number, roundingMode?: BigNumber.RoundingMode): string;
    toFormat(decimalPlaces?: number): string;
    toFormat(decimalPlaces: number, format: BigNumber.Format): string;
    toFormat(format: BigNumber.Format): string;

    toFraction(max_denominator?: BigNumber.Value): [BigNumber, BigNumber];

    toJSON(): string;

    toNumber(): number;

    toPrecision(significantDigits: number, roundingMode?: BigNumber.RoundingMode): string;
    toPrecision(): string;

    toString(base?: number): string;

    valueOf(): string;

    private static readonly default?: BigNumber.Constructor;

    private static readonly BigNumber?: BigNumber.Constructor;

    static readonly ROUND_UP: 0;

    static readonly ROUND_DOWN: 1;

    static readonly ROUND_CEIL: 2;

    static readonly ROUND_FLOOR: 3;

    static readonly ROUND_HALF_UP: 4;

    static readonly ROUND_HALF_DOWN: 5;

    static readonly ROUND_HALF_EVEN: 6;

    static readonly ROUND_HALF_CEIL: 7;

    static readonly ROUND_HALF_FLOOR: 8;

    static readonly EUCLID: 9;

    static DEBUG?: boolean;

    static clone(object?: BigNumber.Config): BigNumber.Constructor;

    static config(object: BigNumber.Config): BigNumber.Config;

    static isBigNumber(value: any): value is BigNumber;

    static maximum(...n: BigNumber.Value[]): BigNumber;

    static max(...n: BigNumber.Value[]): BigNumber;

    static minimum(...n: BigNumber.Value[]): BigNumber;

    static min(...n: BigNumber.Value[]): BigNumber;

    static random(decimalPlaces?: number): BigNumber;

    static sum(...n: BigNumber.Value[]): BigNumber;

    static set(object: BigNumber.Config): BigNumber.Config;
  }
}
/// <amd-module name="@ijstech/eth-contract" />
declare module "@ijstech/eth-contract" {
    /*!-----------------------------------------------------------
    * Copyright (c) IJS Technologies. All rights reserved.
    * Released under dual AGPLv3/commercial license
    * https://ijs.network
    *-----------------------------------------------------------*/
    import { BigNumber } from "bignumber.js";
    export { BigNumber };
    type stringArray = string | _stringArray;
    interface _stringArray extends Array<stringArray> {
    }
    export interface IWalletUtils {
        fromWei(value: any, unit?: string): string;
        hexToUtf8(value: string): string;
        sha3(value: string): string;
        stringToBytes(value: string | stringArray, nByte?: number): string | string[];
        stringToBytes32(value: string | stringArray): string | string[];
        toString(value: any): string;
        toUtf8(value: any): string;
        toWei(value: string, unit?: string): string;
    }
    export interface IBatchRequestResult {
        key: string;
        result: any;
    }
    export interface IBatchRequestObj {
        batch: any;
        promises: Promise<IBatchRequestResult>[];
        execute: (batch: IBatchRequestObj, promises: Promise<IBatchRequestResult>[]) => Promise<IBatchRequestResult[]>;
    }
    export interface IWallet {
        address: string;
        balance: Promise<BigNumber>;
        _call(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<any>;
        decode(abi: any, event: IWalletLog | IWalletEventLog, raw?: {
            data: string;
            topics: string[];
        }): Event;
        decodeLog(inputs: any, hexString: string, topics: any): any;
        getAbiEvents(abi: any[]): any;
        getAbiTopics(abi: any[], eventNames: string[]): any[];
        getChainId(): Promise<number>;
        methods(...args: any): Promise<any>;
        registerAbi(abi: any[] | string, address?: string | string[], handler?: any): string;
        send(to: string, amount: number): Promise<TransactionReceipt>;
        _send(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
        scanEvents(fromBlock: number, toBlock: number | string, topics?: any, events?: any, address?: string | string[]): Promise<Event[]>;
        utils: IWalletUtils;
        _txObj(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<Transaction>;
        _txData(abiHash: string, address: string, methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<string>;
    }
    export interface Event {
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
    export interface IWalletLog {
        address: string;
        data: string;
        topics: Array<string>;
        logIndex: number;
        transactionHash?: string;
        transactionIndex: number;
        blockHash?: string;
        type?: string;
        blockNumber: number;
    }
    export interface IWalletEventLog {
        event: string;
        address: string;
        returnValues: any;
        logIndex: number;
        transactionIndex: number;
        transactionHash: string;
        blockHash: string;
        blockNumber: number;
        raw?: {
            data: string;
            topics: string[];
        };
    }
    export interface TransactionReceipt {
        transactionHash: string;
        transactionIndex: number;
        blockHash: string;
        blockNumber: number;
        from: string;
        to: string;
        contractAddress?: string;
        cumulativeGasUsed: number;
        gasUsed: number;
        logs?: Array<IWalletLog>;
        events?: {
            [eventName: string]: IWalletEventLog | IWalletEventLog[];
        };
        status: boolean;
    }
    export interface Transaction {
        from?: string;
        to: string;
        nonce: number;
        gas: number;
        gasPrice: BigNumber;
        data: string;
        value?: BigNumber;
    }
    export interface TransactionOptions {
        from?: string;
        nonce?: number;
        gas?: number;
        gasLimit?: number;
        gasPrice?: BigNumber | number;
        data?: string;
        value?: BigNumber | number;
    }
    export interface EventType {
        name: string;
    }
    export const nullAddress = "0x0000000000000000000000000000000000000000";
    export interface IContractMethod {
        call: any;
        estimateGas(...params: any[]): Promise<number>;
        encodeABI(): string;
    }
    export interface IContract {
        deploy(params: {
            data: string;
            arguments?: any[];
        }): IContractMethod;
        methods: {
            [methodName: string]: (...params: any[]) => IContractMethod;
        };
    }
    export interface EventType {
        name: string;
    }
    export class Contract {
        wallet: IWallet;
        _abi: any;
        _bytecode: any;
        _address: string;
        private _events;
        privateKey: string;
        private abiHash;
        constructor(wallet: IWallet, address?: string, abi?: any, bytecode?: any);
        at(address: string): Contract;
        set address(value: string);
        get address(): string;
        protected decodeEvents(receipt: TransactionReceipt): any[];
        protected parseEvents(receipt: TransactionReceipt, eventName: string): Event[];
        get events(): EventType[];
        protected getAbiEvents(): any;
        protected getAbiTopics(eventNames?: string[]): any[];
        scanEvents(fromBlock: number, toBlock: number | string, eventNames?: string[]): Promise<Event[]>;
        batchCall(batchObj: IBatchRequestObj, key: string, methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<void>;
        protected txData(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<string>;
        protected call(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<any>;
        private _send;
        protected __deploy(params?: any[], options?: number | BigNumber | TransactionOptions): Promise<string>;
        protected send(methodName: string, params?: any[], options?: number | BigNumber | TransactionOptions): Promise<TransactionReceipt>;
        protected _deploy(...params: any[]): Promise<string>;
        protected methods(methodName: string, ...params: any[]): Promise<any>;
    }
    export class TAuthContract extends Contract {
        rely(address: string): Promise<any>;
        deny(address: string): Promise<any>;
    }
}
