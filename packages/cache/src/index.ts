/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {LocalCache} from './local';
import {RedisCache} from './redis';
import {VM} from '@ijstech/vm';
import {ICachePlugin, ICacheClientOptions} from '@ijstech/types';

let Clients = {};
export function getClient(options?: ICacheClientOptions): ICachePlugin{
    if (options && options.redis){
        let id = options.redis.host + (options.redis.db || 0);
        if (!Clients[id])
            Clients[id] = new RedisCache(options.redis)
        return Clients[id];
    }
    else{
        let id = '$$local';
        if (!Clients[id])
            Clients[id] = new LocalCache()
        return Clients[id];
    }
};

export function loadPlugin(plugin: Worker, options: ICacheClientOptions, vm?: VM): ICachePlugin {
    return {
        async get(key: string): Promise<string>{
            let client = getClient(options);
            return await client.get(key);
        },
        async set(key: string, value: any, expires?: number): Promise<boolean>{
            let client = getClient(options);
            return await client.set(key, value, expires);
        },
        async del(key: string): Promise<boolean>{
            let client = getClient(options);
            return await client.del(key);
        },
        async getValue(key: string): Promise<any>{
            let client = getClient(options);
            let value = await client.get(key);
            if (vm) //can returns string value to VM only
                return value;
            try{
                return JSON.parse(value);
            }
            catch(err){
                return value;
            }
        }
    };
};
export default loadPlugin;