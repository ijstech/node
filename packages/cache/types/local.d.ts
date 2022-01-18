import { ICachePlugin } from '@ijstech/types';
export declare class LocalCache implements ICachePlugin {
    private Data;
    private Expires;
    get(key: string): Promise<string>;
    getValue(key: string): Promise<any>;
    set(key: string, value: string, expires?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
}
