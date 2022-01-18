import {ICachePlugin} from '@ijstech/types';

const DefaultExpires = 3600;// 3600 seconds;
//TODO: clear expired data
export class LocalCache implements ICachePlugin{
    private Data = {};	
    private Expires = {};
	async get(key: string):Promise<string> {     
        let expires = this.Expires[key];
        if (expires && expires >= (new Date().getTime() / 1000)){
            delete this.Data[key];
            throw new Error('$key_not_found');
        };
        return this.Data[key];
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
	async set(key: string, value: string, expires?: number): Promise<boolean> {
        if (typeof value !== 'string')
            value = JSON.stringify(value);
        expires = expires || DefaultExpires;        
        this.Expires[key] = expires;
        this.Data[key] = value;
        return true;
	}
	async del(key: string):Promise<boolean> {
        delete this.Data[key];
        delete this.Expires[key];
        return true;
	}
};
