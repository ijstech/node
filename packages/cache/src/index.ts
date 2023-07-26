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
    return {
        async get(key: string): Promise<string>{
            let client = getClient(options);
            if (!key.startsWith('$g:'))
                key = `${plugin.id||''}:${key}`;
            return await client.get(key);
        },
        async set(key: string, value: any, expires?: number): Promise<boolean>{
            if (!key.startsWith('$g:'))
                key = `${plugin.id||''}:${key}`;
            let client = getClient(options);
            return await client.set(key, value, expires);
        },
        async del(key: string): Promise<boolean>{
            if (!key.startsWith('$g:'))
                key = `${plugin.id||''}:${key}`;
            let client = getClient(options);
            return await client.del(key);
        },
        async getValue(key: string): Promise<any>{
            if (!key.startsWith('$g:'))
                key = `${plugin.id||''}:${key}`;
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