/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { VM } from '@ijstech/vm';
import * as Types from '@ijstech/types';
export interface IClient extends Types.IDBClient {
    import(sql: string): Promise<boolean>;
}
export declare function getClient(options?: Types.IDbConnectionOptions): IClient;
export declare function loadPlugin(plugin: Worker, options: Types.IDBRequiredPluginOptions, vm?: VM): Types.IDBPlugin;
declare const _default: Types.IDBClient;
export default _default;
