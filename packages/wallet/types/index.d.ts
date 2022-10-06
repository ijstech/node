/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IWallet } from '@ijstech/eth-wallet';
import { IWorker } from '@ijstech/types';
import { IWalletPlugin, IWalletRequiredPluginOptions } from '@ijstech/types';
declare const _default: IWallet;
export default _default;
export declare function loadPlugin(worker: IWorker, options: IWalletRequiredPluginOptions): string | IWalletPlugin;
