import { VM } from '@ijstech/vm';
import * as Types from '@ijstech/types';
export interface IClient extends Types.IDBClient {
    import(sql: string): Promise<boolean>;
}
export declare function getClient(options?: Types.IDbConnectionOptions): IClient;
export declare function loadPlugin(plugin: Worker, options: Types.IDBRequiredPluginOptions, vm?: VM): Types.IDBPlugin;
export default loadPlugin;
