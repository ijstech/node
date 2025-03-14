/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { IRedisConnection, ICachePlugin } from '@ijstech/types';
export declare class RedisCache implements ICachePlugin {
    private redisClient;
    constructor(options: IRedisConnection);
    get(key: string): Promise<string>;
    getValue(key: string): Promise<any>;
    set(key: string, value: any, expires?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
}
