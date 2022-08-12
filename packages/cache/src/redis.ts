/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import {RedisClient } from "redis";
import {IRedisConnection, ICachePlugin} from '@ijstech/types';

const DefaultExpires = 3600;// 3600 seconds;
export class RedisCache implements ICachePlugin{
    private redisClient: RedisClient
	constructor(options: IRedisConnection) {
		this.redisClient =  new RedisClient(options);
	}
	get(key: string):Promise<string> {        
		return new Promise((resolve, reject) => {
			this.redisClient.get(key, (err, value) => {
				if (err)
					reject(err)
				else
					resolve(value)
			});
		})
	}
    async getValue(key: string): Promise<any> {
		let value = await this.get(key);
        try{
            return JSON.parse(value);
        }
        catch(err){
            return value;
        }
	}
	set(key: string, value: any, expires?: number): Promise<boolean> {
		return new Promise((resolve, reject) => {
			if (typeof value !== 'string')
				value = JSON.stringify(value);
            expires = expires || DefaultExpires			
            this.redisClient.set(key, value, 'EX', expires, err => {
                if (err)
                    reject(err)
                else
                    resolve(true);
            });
		})
	}
	del(key: string):Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.redisClient.del(key, err => {
				if (err)
					reject(err)
				else
                    resolve(true)
			})
		})
	}
};
