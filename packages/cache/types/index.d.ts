/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { VM } from '@ijstech/vm';
import { ICachePlugin, ICacheClientOptions } from '@ijstech/types';
export { ICachePlugin as ICacheClient, ICacheClientOptions };
export declare function getClient(options?: ICacheClientOptions): ICachePlugin;
export declare function loadPlugin(plugin: Worker, options: ICacheClientOptions, vm?: VM): ICachePlugin;
export default loadPlugin;
