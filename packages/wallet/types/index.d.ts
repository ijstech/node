/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IWallet } from '@ijstech/eth-wallet';
import * as Types from '@ijstech/types';
declare const _default: IWallet;
export default _default;
export declare function loadPlugin(worker: Types.IWorker, options: Types.IWalletRequiredPluginOptions): string | Types.IWalletPlugin;
