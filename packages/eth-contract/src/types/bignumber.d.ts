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
