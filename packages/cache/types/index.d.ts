import { VM } from '@ijstech/vm';
import { ICachePlugin, ICacheClientOptions } from '@ijstech/types';
export declare function getClient(options?: ICacheClientOptions): ICachePlugin;
export declare function loadPlugin(plugin: Worker, options: ICacheClientOptions, vm?: VM): ICachePlugin;
export default loadPlugin;
