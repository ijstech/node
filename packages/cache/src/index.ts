/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {LocalCache} from './local';
import {RedisCache} from './redis';
import {VM} from '@ijstech/vm';
import {ICachePlugin, ICacheClientOptions, IWorker} from '@ijstech/types';
export{ ICachePlugin as ICacheClient, ICacheClientOptions };

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

export function loadPlugin(plugin: IWorker, options: ICacheClientOptions, vm?: VM): ICachePlugin {
    const resolveKey = (key: string) => {
        if (key.startsWith('$g:'))
            return key;
        else if (key.startsWith('$d:'))
            return `${plugin.domain||''}:${key.substring(3)}`;
        else
            return `${plugin.id||''}:${key}`;
    }

    return {
        async get(key: string): Promise<string>{
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            return await client.get(resolvedKey);
        },
        async set(key: string, value: any, expires?: number): Promise<boolean>{
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            return await client.set(resolvedKey, value, expires);
        },
        async del(key: string): Promise<boolean>{
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            return await client.del(resolvedKey);
        },
        async getValue(key: string): Promise<any>{
            let client = getClient(options);
            let resolvedKey = resolveKey(key);
            let value = await client.get(resolvedKey);
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