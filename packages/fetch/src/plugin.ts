import * as Types from '@ijstech/types';

export interface IFetchGetData{
    headers?: {[field: string]: string};
};
export interface IFetchPostData{
    headers?: {[field: string]: string};
    body?: any;
};
export interface IFetchPluginObject{
    get(url: string, data: IFetchGetData):Promise<string>;
    post(url: string, data: IFetchPostData):Promise<string>;
};
export interface IFetchResult{
    status: number;
    body: string;
};
export const Plugin = {
    async get(url: string, data?: IFetchGetData): Promise<IFetchResult>{
        return new Promise(async (resolve)=>{
            let plugin: IFetchPluginObject = global.$$fetch_plugin;
            let result = await plugin.get(url, data);
            resolve(JSON.parse(result));
        });
    },
    async post(url: string, data: IFetchPostData): Promise<IFetchResult>{
        return new Promise(async (resolve)=>{
            let plugin: IFetchPluginObject = global.$$fetch_plugin;
            let result = await plugin.post(url, data);
            resolve(JSON.parse(result));
        });
    }
};
export default Plugin;