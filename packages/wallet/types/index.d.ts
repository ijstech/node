/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IWallet } from '@ijstech/eth-wallet';
import { IWorker } from '@ijstech/types';
import { IWalletRequiredPluginOptions } from '@ijstech/types';
declare const _default: IWallet;
export default _default;
export type stringArray = string | _stringArray;
export interface _stringArray extends Array<stringArray> {
}
export declare function loadPlugin(worker: IWorker, options: IWalletRequiredPluginOptions): Promise<string | IWallet>;
