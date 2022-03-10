import {BigNumber} from 'bignumber.js';
export function test(): number{
    let result = new BigNumber('123')
    return result.toNumber();
}