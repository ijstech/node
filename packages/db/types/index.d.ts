import { VM } from '@ijstech/vm';
import * as Types from '@ijstech/types';
export declare function getClient(options?: Types.IDbConnectionOptions): Types.IDBClient;
export declare function loadPlugin(plugin: Worker, options: Types.IDBRequiredPluginOptions, vm?: VM): Types.IDBPlugin;
export default loadPlugin;
